import { IEvents } from "../components/base/events";
import { Component } from "../components/base/component";
import { createElement, ensureAllElements, ensureElement } from "../utils/utils";
import { CDN_URL } from "../utils/constants";
import { Api, ApiListResponse } from "../components/base/api";



//Интерфейс карточки товара
export interface IProduct {
    id: string;
    category: string;
    title: string;
    image: string;
    price: number | null;
    description: string;
}

//Интерфейс данных покупателя
export interface IBuyer {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export type TProductPreview = Pick<IProduct, 'category' | 'title' | 'image' | 'price'>;
export type TProductDetails = Pick<IProduct, 'category' | 'title' | 'image' | 'price' | 'description'> & {buttonText:boolean};
export type TBuyerInfo = Pick<IBuyer, 'payment' | 'address'| 'email' | 'phone'>& { total: number; items: string[] };
export type TProductBasket = Pick<IProduct, 'title'|'price'> & { index: number };
export type FormErrors = Partial<Record<keyof IBuyer, string>>;


// ------------СЛОЙ ДАННЫХ---------------

//Класс каталога товаров
export class ProductData {
    protected products: IProduct[] = [];  // массив объектов товаров
    protected productItem: IProduct; // один конкретный товар
    protected events: IEvents;

   constructor(events: IEvents) {
    this.events = events;
    }

    getProductList(): IProduct[] { 
        return this.products;
    } 

    setProductList(products:IProduct[]) {
        this.products = products;
        this.events.emit('products:update');
    } 

    getProduct(): IProduct {
        return this.productItem; 
    } 

    setProduct(productItem:IProduct) {
        this.productItem = productItem;
    } 
}

//Класс для работы с корзиной товаров
export class BasketData {
    protected chooseProductList: IProduct[] = [];
    protected events: IEvents;

    constructor(events: IEvents) {
        this.events = events;
    }

    addProduct(product: IProduct) {
        this.chooseProductList = [...this.chooseProductList, product];
		this.events.emit('basket:update');
    }

    deleteProduct(productId:string) {
        this.chooseProductList = this.chooseProductList.filter((productItem) => productItem.id !== productId);
		this.events.emit('basket:update');
    } 

    showOrderList(): IProduct[] {
        return this.chooseProductList;
    }

    countProductItem(): number {
        return this.chooseProductList.length;
    }

    countTotalAmound(): number {
        return this.chooseProductList.reduce((acc, productItem) => acc + productItem.price, 0);
       
    } 

    checkAviability(productId: string):boolean {
        	if (this.chooseProductList.find((productItem) => productItem.id === productId)) {
			return true;
		} else return false;
	
    }
	
	clearBasket() {
		this.chooseProductList = [];
		this.events.emit('basket:update');
	};  
}


//Класс для работы с данными покупателя
export class BuyerData {
    protected buyer: IBuyer = {
        payment: '',
        address: '',
        email: '' ,
        phone: '' 
    };
	protected formErrors: FormErrors = {};
    protected events: IEvents;

    constructor(events: IEvents) {
        this.events = events;
    }

    //получение данных покупателя
    getBuyerInfo(): IBuyer {
        return this.buyer;
    } 
	//очистка данных покупателя
	clearBuyerInfo(): void {
		this.buyer = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
		this.formErrors = {};
	}

	setOrderData(field: keyof IBuyer, value: string) {
		this.buyer[field] = value;
			if (this.checkValidationOrder()) {
			this.events.emit('formOrder:confirmed');
		}
	}

	setContactsData(field: keyof IBuyer, value: string) {
		this.buyer[field] = value;
		if (this.checkValidationContacts()) {
			this.events.emit('formCntacts:confirmed');
		}
	}

    //проверка валидации данных покупателя на первом этапе оформления
    checkValidationOrder(){
		const errors: typeof this.formErrors = {};

		if (!this.buyer.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		if (!this.buyer.address) {
			errors.address = 'Необходимо указать адрес';
		}

		this.formErrors = errors;
		this.events.emit('formErrors.formOrder:filled', this.formErrors);
		return Object.keys(errors).length === 0;
    }

	//проверка валидации данных покупателя на первом этапе оформления
	checkValidationContacts(){
		const errors: typeof this.formErrors = {};

		if (!this.buyer.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.buyer.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors.formContacts:filled', this.formErrors);
		return Object.keys(errors).length === 0;
	}	
}

//-----------------СЛОЙ ПРЕДСТАВЛЕНИЯ----------------------

//для работы со всей страницей
interface IPage {
	locked: boolean;
	counter: number;
	catalog: HTMLElement[];
}

export class Page extends Component<IPage> {
	protected wrapper: HTMLElement;
	protected basketButton: HTMLButtonElement;
    protected counterElement: HTMLElement;
	protected catalogItems: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
	
	this.wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);

	this.basketButton = ensureElement <HTMLButtonElement>(
			'.header__basket',
			this.container
        );
    
	this.counterElement = ensureElement<HTMLElement>(
			'.header__basket-counter',
            this.container
		);

    this.basketButton.addEventListener('click', () => {
		this.events.emit('basket:open');
		});

	this.catalogItems = ensureElement<HTMLElement>(
			'.gallery',
			this.container
		);
	}

	set locked(value: boolean) {
		if (value) {
			this.wrapper.classList.add('page__wrapper_locked');
		} else {
			this.wrapper.classList.remove('page__wrapper_locked');
		}
	}

	set counter(value: number) {
		this.setText(this.counterElement, value);
	}

    set catalog(items: HTMLElement[]) {
		this.catalogItems.replaceChildren(...items);
	}
}

// модальное окно
interface IModal {
    content: HTMLElement;
}

export class Modal extends Component<IModal>{
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

    this._content = ensureElement<HTMLElement>(
			'.modal__content',
			this.container
		);

	this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',	
			this.container
		);

	this._closeButton.addEventListener('click', this.close.bind(this));

	this.container.addEventListener('mousedown', (event) => {
		if (event.target === event.currentTarget) {
			this.close();
		}
	});

	this._content.addEventListener('click', (event) => event.stopPropagation());
	
	this.handleEscUp = this.handleEscUp.bind(this);
	}
    
    set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

    open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
		document.addEventListener('keyup', this.handleEscUp);
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit('modal:close');
		document.removeEventListener('keyup', this.handleEscUp);
	}

	render(data: IModal): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}

	handleEscUp(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			this.close();
		}
	}
}

//успешное оформление заказа
interface IOrderSuccess {
	title: string;
	description: number;
	button: string;
}

interface ISuccessEvents {
	onClick: () => void;
}

export class OrderSuccess extends Component<IOrderSuccess>{
    protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, events: ISuccessEvents) {
		super(container);

		this._title = ensureElement<HTMLElement>(
			'.order-success__title',
			this.container
		);
		this._description = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this._button = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);
    }

    set title(value: string) {
		this.setText(this._title, value);
	}

	set description(value: number) {
		this.setText(this._description, `Списано ${value} синапсов`);
	}

	set button(value: string) {
		this.setText(this._button, value);
	}
}


// Категории товаров
export const categoryList: Record<string, string> = {
	'софт-скил': 'card__category_soft',
	'хард-скил': 'card__category_hard',
	'другое': 'card__category_other',
	'дополнительное': 'card__category_additional',
	'кнопка': 'card__category_button',	
};

export type categoryKey = keyof typeof categoryList;

//товар
export class Product<T> extends Component<IProduct>{
    protected _title: HTMLElement;
	protected _price: HTMLElement;
    protected _id: string;
    protected _category?: HTMLElement;
	protected _image?: HTMLImageElement;	
	protected _description?: HTMLElement;
	
	constructor(container: HTMLElement) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', this.container);
		this._price = ensureElement<HTMLElement>('.card__price', this.container);
		this._category = container.querySelector('.card__category');
        this._image = container.querySelector('.card__image');
		this._description = container.querySelector('.card__text');
	}

    set title(value: string) {
		this.setText(this._title, value);
	}

    get title(): string {
		return this._title.textContent || '';
	}

    get price(): number|null {
        const text = this._price.textContent;
		return text === 'Бесценно' ? null : parseInt(text);
    }

    set image(value: string) {
		this.setImage(this._image, CDN_URL + value, this.title);
	}

    set category(value: string) {
		this.setText(this._category, value);
		if (this._category) {
			for (const key in categoryList) {
				this._category.classList.toggle(
					categoryList[key as categoryKey],
					key === value
				);
			}
		}
    }

    set description(value: string) {
		this.setText(this._description, value);
	}

    set id(value: string) {
		this._id = value;
	}

	get id(): string {
		return this._id;
	}

	render(data: Partial<T> & Partial<IProduct>) {
		const { title, price, ...other } = data;
		super.render({ title, price });
		Object.assign(this, other);
		return this.container;
	}
}

interface ICardEvents {
	onCardClick?: (event: MouseEvent) => void;
	onButtonClick?: (event: MouseEvent) => void;
	onDeleteClick?: (event: MouseEvent) => void;
}

//карточка в каталоге товаров (галереее товаров)
export class CardCatalog extends Product<TProductPreview> {
    constructor(container: HTMLElement, events?: ICardEvents){
        super(container);

		if (events?.onCardClick) {
			this.container.addEventListener('click', events.onCardClick);
		}
    }
}

//карточка с полной информацией о товаре
export class CardFull extends Product<TProductDetails> {
    protected _cardButton: HTMLButtonElement;
	protected _inBasket: boolean = false;

	constructor(container: HTMLElement, events?: ICardEvents) {
		super(container);

		this._cardButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.container
		);

		if (events?.onButtonClick) {
			this._cardButton.addEventListener('click', events.onButtonClick);
		}
    }
   
    set cardButtonText(value:boolean) {
		if (this.price === null) {
			this.setText(this._cardButton, 'Недоступно');
			this.setDisabled(this._cardButton, true);
		} else {
			this.setDisabled(this._cardButton, false);
			this.setText(
				this._cardButton,
				value ? 'Удалить из корзины' : 'Купить'
			);
		}
    }
}

//карточка в корзине
export class CardCompact extends Product<TProductBasket> {
    protected _itemIndex: HTMLElement;
    protected _deleteBasketButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: ICardEvents) {
       super(container);
       
       this._itemIndex = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.container
		);

		this._deleteBasketButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);

		if (events?.onDeleteClick) {
			this._deleteBasketButton.addEventListener('click', events.onDeleteClick);
		}
    }

    set itemIndex(value: number) {
		this.setText(this._itemIndex, value);
	}
}


//Корзина
interface IBasket {
    modalTitle: string;
	basketOrderButton: string;
	basketList: HTMLElement[];
	basketPrice: number;
}

export class Basket extends Component<IBasket> {
    protected _modalTitle: HTMLElement;
	protected _basketOrderButton: HTMLButtonElement;
	protected _basketList: HTMLElement;
	protected _basketPrice: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents){
        super(container);

        this._modalTitle = ensureElement<HTMLElement>(
			'.modal__title',
			this.container
		);

		this._basketList = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this._basketOrderButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);
		this._basketPrice = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);

		this.basketList = [];
    }

    set modalTitle(value: string) {
		this.setText(this._modalTitle, value);
	}

    set basketList(items: HTMLElement[]) {
		if (items.length) {
			this._basketList.replaceChildren(...items);
			this.setDisabled(this._basketOrderButton, false);
		} else {
			this._basketList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
					style: 'opacity: 0.3;',
				})
			);
			this.setDisabled(this._basketOrderButton, true);
		}
    }

    set basketPrice(value: number) {
        this.setText(this._basketPrice, `${value} синапсов`);
    }

    set basketOrderButton(value: string) {
        this.setText(this._basketOrderButton, value);
    }
}

//Формы в модальном окне
interface IForm {
    modalFormTitles: string[];
	submitButton: string;
	valid: boolean;
	errors: string[];	
}

export class Form<T> extends Component<IForm> {
    protected _modalFormTitles: HTMLElement[];
	protected _submitButton: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

        this._modalFormTitles = ensureAllElements<HTMLElement>(
			'.modal__title',
			this.container
		);

		this._submitButton = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);

		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputUpdate(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
    }

    set modalFormTitles(value: string[]) {
		this._modalFormTitles.forEach((title, index) => {
			this.setText(title, value[index]);
		});
	}

	set submitButton(value: string) {
		this.setText(this._submitButton, value);
	}

	set valid(value: boolean) {
		this._submitButton.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	protected onInputUpdate(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:filled`, {
			field,
			value,
		});
	}

	render(data: Partial<T> & IForm) {
		const { modalFormTitles, submitButton, valid, errors, ...inputs } = data;
		super.render({ modalFormTitles, submitButton, valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

//форма первого этапа оформления заказа
export interface IFormOrder {
	payButtons: string[];
	address: string;
	isPaymentMethod: 'card' | 'cash';
}

export class FormOrder extends Form<IFormOrder>{
    protected _payButtons: HTMLButtonElement[];
	protected _isPaymentMethod: string | null = null;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._payButtons = ensureAllElements<HTMLButtonElement>(
			'button[type=button]',
			this.container
		);

		this._payButtons.forEach((btn) => {
			btn.addEventListener('click', () => {
				this.events.emit(`${this.container.name}.${btn.name}:selected`);
			});
		});
    }

    set payButtons(value: string[]) {
		this._payButtons.forEach((title, index) => {
			this.setText(title, value[index]);
		});
	}

    set isPaymentMethod(value: 'card' | 'cash') {
		this._isPaymentMethod = value;

		this._payButtons.forEach((btn) => {
			this.toggleClass(btn, 'button_alt-active', btn.name === value);
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}	
}

//форма второго этапа оформления заказа
export interface IFormContacts {
	email: string;
	phone: string;
}

export class FormContacts extends Form<IFormContacts>{
    constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}

//-----СЛОЙ КОММУНИКАЦИИ-----

interface ICommAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	placeOrder(order: TBuyerInfo): Promise<IOrderSuccess>;
}

export class CommAPI extends Api implements ICommAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then(
			(data: ApiListResponse<IProduct>) => data.items
		);
	}

	getProductItem(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((item: IProduct) => item);
	}

	placeOrder(order: TBuyerInfo): Promise<IOrderSuccess> {
		return this.post('/order', order).then((res: IOrderSuccess) => res);
	}
}
 
