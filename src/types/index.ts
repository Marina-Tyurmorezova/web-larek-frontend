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
    payment: 'online'|'cash'|''; // два варианта оплаты
    address: string;
    email: string;
    phone: string;
}

//Класс каталога товаров
class ProductData {
    protected products: IProduct[];  // массив объектов товаров
    protected productItem: IProduct; // один конкретный товар
    
   constructor() {
    this.products = [];
    this.productItem = null;
    }

    //получения списка всех карточек товаров
    getProductList(): IProduct[] { 
        return this.products;
    } 

    //сохранение списка карточек
    setProductList(products:IProduct[]): void {
        this.products = products;
    } 

    //метод получения  конкретного выбранного продукта из каталога для просмотра
    getProduct(productId:string): IProduct | null {
        return this.products.find(product => product.id === productId) || null;
    } 

    //метод сохранения одного выбранного продукта
    setProduct(product:IProduct): void {
        this.productItem = product;
    } 
}

//Класс для работы с корзиной товаров
class Basket {
    protected chooseProductList: IProduct[];

    constructor() {
        this.chooseProductList = [];
    }

    //метод добавления товара в корзину
    addProduct(product: IProduct): void {
        this.chooseProductList.push(product);
    }

    //метод удаления товара из корзины
    deleteProduct(productId:string): void {
        this.chooseProductList = this.chooseProductList.filter(p => p.id !== productId);
    } 

    //метод получения списка выбранных товаров
    showOrderList(): IProduct[] {
        return this.chooseProductList;
    }

    //метод подсчета количества товаров в корзине
    countProductItem(): number {
        return this.chooseProductList.length;
    }

    //метод подсчета итоговой суммы покупок
    countTotalAmound(): number {
        return this.chooseProductList.reduce((sum, product) => sum + (product.price ?? 0), 0);
    } 
    //метод проверки выбран товар или нет 
    checkAviability(productId: string):boolean {
       return this.chooseProductList.some(product => product.id === productId);
    };  
}


//Класс для работы с данными покупателя
class Buyer {
    protected payment: 'online'|'cash'|''; // два варианта оплаты
    protected address: string;
    protected email: string;
    protected phone: string;

    constructor() {
        this.payment = '';
        this.address = '';
        this.email = '';
        this.phone = '';
    }

    //получение данных покупателя
    getBuyerInfo(): TBuyerInfo {
        return {
            payment: this.payment,
            address: this.address,
            email: this.email,
            phone: this.phone
        };
    } 

    //проверка валидации данные покупателя
    checkValidation(data: Record<keyof TBuyerInfo, string>): boolean {
        if (!data.payment) return false;
        if (!data.address) return false;
        if (!data.email.includes('@')) return false;
        if (!data.phone.match(/^\+?\d+$/)) return false;
        
        return true;
    }

    //сохранение данных покупателя
    setBuyerInfo(data: TBuyerInfo): void {
        if (this.checkValidation(data)) {
            this.payment = data.payment;
            this.address = data.address;
            this.email = data.email;
            this.phone = data.phone;
        }
    }
}

 
type TProductPreview = Pick<IProduct, 'category' | 'title' | 'image' | 'price'>;
type TProductDetails = Pick<IProduct, 'category' | 'title' | 'image' | 'price' | 'description'>;
type TBuyerInfo = Pick<IBuyer, 'payment' | 'address'| 'email' | 'phone'>;
type TBasket = Pick<IProduct, 'title'|'price'>;