//Интерфейс карточки товара
interface IProduct {
    _id: string;
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
    getBuyerInfo(data: string): TBuyerInfo; //получение данных покупателя
    checkValidation(data: Record<keyof TBuyerInfo, string>):boolean; //проверка валидации данные покупателя
    setBuyerInfo(data: TBuyerInfo):void; //сохранение данных покупателя
}

//Интерфейс каталога товаров
interface IProductData {
    products: IProduct[];
    preview: string | null; //для выбор конкретного товара по id для просмотра
    getProductList(products: IProduct[]):IProduct; //получения списка всех карточек товаров
    getProduct(productId:string):IProduct; //метод получения  конкретного выбранного продукта из каталога для просмотра
}

//Интерфес для работы с корзиной товаров
interface IBasket {
    chooseProductList: IProduct[];
    addProduct(productId:string):void; //метод добавления товара в корзину
    deleteProduct(productId:string):void; //метод удаления товара из корзины
    showOrderList(chooseProductList: IProduct[]):TBasket; //метод получения списка выбранных товаров
    countProductItem(chooseProductList: IProduct):number|null; //метод подсчета количества товаров в корзине
    countTotalAmound(chooseProductList: IProduct):number|null; //метод подсчета итоговой суммы покупок
    checkAviability():boolean; //метод проверки выбран товар или нет  
}

 
type TProductPreview = Pick<IProduct, 'category' | 'title' | 'image' | 'price'>;
type TProductDetails = Pick<IProduct, 'category' | 'title' | 'image' | 'price' | 'description'>;
type TBuyerInfo = Pick<IBuyer, 'payment' | 'address'| 'email' | 'phone'>;
type TBasket = Pick<IProduct, 'title'|'price'>;