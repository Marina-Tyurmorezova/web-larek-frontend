import { Form } from "./Form";
import { IEvents } from "../base/events";

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