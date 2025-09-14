import './scss/styles.scss';
import {
        CommAPI ,
        IBuyer ,
        IProduct ,
        ProductData ,
        BasketData ,
        BuyerData ,
        Page ,
        Modal ,
        OrderSuccess ,
        CardCatalog ,
        CardFull ,
        CardCompact ,
        Basket ,
        FormOrder ,
        IFormOrder ,
        FormContacts ,
        IFormContacts} from "./types";

import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new CommAPI(CDN_URL, API_URL);

events.onAll((event) => {
	console.log(event.eventName, event.data);
});

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardFullTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const productData = new ProductData(events);
const basketData = new BasketData(events);
const buyerData = new BuyerData(events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new FormOrder(cloneTemplate(orderTemplate), events);
const contacts = new FormContacts(cloneTemplate(contactsTemplate), events);

const cardFull = new CardFull(cloneTemplate(cardFullTemplate), {
	onButtonClick: () => {
		events.emit('product:buy');
	},
});

const success = new OrderSuccess(cloneTemplate(successTemplate), {
	onClick: () => {
		modal.close();
		events.emit('formOrder.success');
	},
});


// Изменились элементы каталога
events.on('products:update', () => {
	const itemsList = productData.getProductList().map((item) => {
		const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onCardClick: () => events.emit('card:select', item),
		});
		return card.render(item);
	});
	page.render({catalog: itemsList });
});

// Обновить корзину товаров
events.on('basket:update', () => {
	page.counter = basketData.countTotalAmound();

	const basketItemsList = basketData.showOrderList().map((item, indx) => {
		const card = new CardCompact(cloneTemplate(cardBasketTemplate), {
			onDeleteClick: () => events.emit('basket:delete', item),
		});
		return card.render({ ...item, index: indx + 1 });
	});

	basket.render({
	    basketList: basketItemsList,
		basketPrice: basketData.countTotalAmound(),
	});
});

events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

events.on('basket:delete', (item: IProduct) => {
	basketData.deleteProduct(item.id);
	cardFull.cardButtonText = basketData.checkAviability(item.id);
});

// Открыть карточку товара
events.on('card:select', (item: IProduct) => {
	modal.render({
		content: cardFull.render({
			...item,
			buttonText: basketData.checkAviability(item.id),
		}),
	});
	productData.setProduct(item);
});

// Добавление или удаление товара из корзины
events.on('card:buy', () => {
	if (basketData.checkAviability(cardFull.id)) {
		basketData.deleteProduct(cardFull.id);
	} else {
		basketData.addProduct(productData.getProduct());
	}
	cardFull.cardButtonText = basketData.checkAviability(cardFull.id);
});

// Переход к странице оформления заказа
events.on('formOrder:open', () => {
	modal.render({
		content: order.render({
			valid: false,
			errors: [],
			modalFormTitles: ['Способ оплаты', 'Адрес доставки'],
			submitButton: 'Далее',
			payButtons: ['Онлайн', 'При получении'],
			address: '',
		}),
	});
});

events.on('formOrder.card:selected', () => {
	order.isPaymentMethod = 'card';
	buyerData.setOrderData('payment', 'card');
});

events.on('formOrder.cash:selected', () => {
	order.isPaymentMethod = 'cash';
	buyerData.setOrderData('payment', 'cash');
});

events.on(
	'formOrder.address:filled',
	(data: { field: keyof IFormOrder; value: string }) => {
		buyerData.setOrderData('address', data.value);
	}
);

events.on('formErrors.formOrder:filled', (errors: Partial<IBuyer>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Переход к странице с контактными данными
events.on('fprmOrder:submit', () => {
	modal.render({
		content: contacts.render({
			valid: false,
			errors: [],
			modalFormTitles: ['Email', 'Телефон'],
			submitButton: 'Оплатить',
			email: '',
			phone: '',
		}),
	});
});

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IFormContacts; value: string }) => {
		buyerData.setContactsData(data.field, data.value);
	}
);

events.on('formErrors.contacts:change', (errors: Partial<IBuyer>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

// Отправлена форма заказа
events.on('formContacts:submit', () => {
	const itemsList = basketData.showOrderList().map((item) => {
		return item.id;
	});
	api
		.placeOrder({
			...buyerData.getBuyerInfo(),
			total: basketData.countTotalAmound(),
			items: itemsList,
		})
		.then((result) => {
			modal.render({ content: success.render({ description: result.description}) }); //проверить
			basketData.clearBasket();
			buyerData.clearBuyerInfo();
			events.emit('formOrder.success');
		})
		.catch((err) => {
			console.log(err);
		});
});

// Блокируем прокрутку страницы, если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокируем прокрутку страницы, если закрыта модалка
events.on('modal:close', () => {
	page.locked = false;
});

// Получить каталог товаров с сервера
api
	.getProductList()
	.then((itemsList) => {
		productData.setProductList(itemsList);
	})
	.catch((err) => {
		console.log(err);
	});
