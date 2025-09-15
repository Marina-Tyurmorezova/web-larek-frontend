
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
export type TBuyerInfo = Pick<IBuyer, 'payment' | 'address'| 'email' | 'phone'> & { total: number; items: string[] };
export type TProductBasket = Pick<IProduct, 'title'|'price'> & { index: number };
export type FormErrors = Partial<Record<keyof IBuyer, string>>;
