import { IProduct } from "../../types";
import { IEvents } from "../base/events";

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

    //количество товаров
    countProductItem(): number {
        return this.chooseProductList.length;
    }

    //сумма товаров
    countTotalAmound(): number {
        return this.chooseProductList.reduce((acc, item) => acc + item.price, 0);
       
    } 

    checkAviability(id: string):boolean {
        return this.chooseProductList.some(product => product.id === id); 
    
    }
    
    clearBasket() {
        this.chooseProductList = [];
        this.events.emit('basket:update');
    };  
}
