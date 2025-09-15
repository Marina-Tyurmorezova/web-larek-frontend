import { IProduct } from "../../types";
import { IEvents } from "../base/events";

//Класс каталога товаров
export class ProductData {
    protected products: IProduct[] = [];  // массив объектов товаров
    protected productItem: IProduct; // один конкретный товар
    protected events: IEvents;

   constructor(events: IEvents) {
    this.events = events;
    this.productItem = {} as IProduct; 
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