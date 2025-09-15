import { Form } from "./Form";
import { IEvents } from "../base/events";
import { ensureAllElements } from "../../utils/utils";

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
