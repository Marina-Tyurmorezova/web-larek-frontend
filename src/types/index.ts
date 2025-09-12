import { IEvents } from "../components/base/events";
import { Component } from "../components/base/component";
import { ensureAllElements, ensureElement } from "../utils/utils";
import { CDN_URL } from "../utils/constants";
import { Api, ApiListResponse } from "../components/base/api";



//Интерфейс карточки товара
interface IProduct {
    id: string;
    category: string;
    title: string;
    image: string;
    price: number | null;
    description: string;
}

//Интерфейс данных покупателя
interface IBuyer {
    payment: 'card'|'cash'|''; // два варианта оплаты
    address: string;
    email: string;
    phone: string;
}

type TProductPreview = Pick<IProduct, 'category' | 'title' | 'image' | 'price'>;
type TProductDetails = Pick<IProduct, 'category' | 'title' | 'image' | 'price' | 'description'> & {buttonText:boolean};
type TBuyerInfo = Pick<IBuyer, 'payment' | 'address'| 'email' | 'phone'>& { total: number; items: string[] };
type TProductBasket = Pick<IProduct, 'title'|'price'>;

// ------------СЛОЙ ДАННЫХ---------------
//Класс каталога товаров
class ProductData {
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
class BasketData {
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
	
    };  
}


//Класс для работы с данными покупателя
class BuyerData {
    protected buyer: IBuyer = {
        payment: '',
        address: '',
        email: '' ,
        phone: '' 
    }
    protected events: IEvents;

    constructor(events: IEvents) {
        this.events = events;
    }

    //получение данных покупателя
    getBuyerInfo(): IBuyer {
        return this.buyer;
    } 

    //проверка валидации данные покупателя
    checkValidation(data: Record<keyof TBuyerInfo, string>): boolean {
    }

    //сохранение данных покупателя
    setBuyerInfo(data: TBuyerInfo): void {
    }
}

//-----------------СЛОЙ ПРЕДСТАВЛЕНИЯ----------------------

interface IHeader {
    counter: number;
}

class Header  extends Component<IHeader> {
    protected basketButton: HTMLButtonElement;
    protected counterElement: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

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
    }
    set counter(value: number) {
		this.setText(this.counterElement, value);
	}

}

interface IGallery {
    catalog: HTMLElement[];
}

class Gallery extends Component<IGallery> {
    protected catalogItems: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

    this.catalogItems = ensureElement<HTMLElement>(
			'.gallery',
			this.container
		);
    }

    set catalog(items: HTMLElement[]) {
		this.catalogItems.replaceChildren(...items);
	}
}

interface IModal {
    content: HTMLElement;
}

class Modal extends Component<IModal>{
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);

    this._content = ensureElement<HTMLElement>(
			'.modal__content',
			this.container
		);
	this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this.container
		);
    }

    set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

    open() {
	}

	close() {
	}

	render(data: IModal): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}

interface IOrderSuccess {
	title: string;
	description: number;
	button: string;
}

class OrderSuccess extends Component<IOrderSuccess>{
    protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, events: IEvents) {
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

class Product<T> extends Component<IProduct>{
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
        return
    }

    set image(value: string) {
		this.setImage(this._image, CDN_URL + value, this.title);
	}

    set category(value: string) {
		this.setText(this._category, value);
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
}

class CardCatalog extends Product<TProductPreview> {
    constructor(container: HTMLElement, events?: IEvents){
        super(container);
    }
}

class CardFull extends Product<TProductDetails> {
    protected _cardButton: HTMLButtonElement;
	protected _inBasket: boolean = false;

	constructor(container: HTMLElement, events?: IEvents) {
		super(container);

		this._cardButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.container
		);
    }
   
    set cardButtonText(value:boolean) {

    }
}


class CardCompact extends Product<TProductBasket> {
    protected _itemIndex: HTMLElement;
    protected _deleteBasketButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
       super(container);
       
       this._itemIndex = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.container
		);
		this._deleteBasketButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);
    }

    set itemIndex(value: number) {
		this.setText(this._itemIndex, value);
	}
}

interface IBasket {
    modalTitle: string;
	basketOrderButton: string;
	basketList: HTMLElement[];
	basketPrice: number;
}

class Basket extends Component<IBasket> {
    protected _modalTitle: HTMLElement;
	protected _basketOrderButton: HTMLButtonElement;
	protected _basketList: HTMLElement;
	protected _basketPrice: HTMLElement;

    constructor(container: HTMLElement, events: IEvents){
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
    }

    set modalTitle(value: string) {
		this.setText(this._modalTitle, value);
	}

    set basketList(items: HTMLElement[]) {

    }

    set basketPrice(value: number) {
        this.setText(this._basketPrice, `${value} синапсов`);
    }

    set basketOrderButton(value: string) {
        this.setText(this._basketOrderButton, value);
    }
}

interface IForm {
    modalFormTitles: string[];
	submitButton: string;
	valid: boolean;
	errors: string[];	
}

class Form<T> extends Component<IForm> {
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
}

interface IFormOrder {
	payButtons: string[];
	address: string;
	isPaymentMethod: 'card' | 'cash';
}

class FormOrder extends Form<IFormOrder>{
    protected _payButtons: HTMLButtonElement[];
	protected _isPaymentMethod: string | null = null;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._payButtons = ensureAllElements<HTMLButtonElement>(
			'button[type=button]',
			this.container
		);
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

interface IFormContacts {
	email: string;
	phone: string;
}

class FormContacts extends Form<IFormContacts>{
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

class CommAPI extends Api implements ICommAPI {
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
 
