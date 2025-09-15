import { IBuyer } from "../../types";
import { IEvents } from "../base/events";
import { FormErrors } from "../../types";


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
            this.events.emit('formCotacts:confirmed');
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