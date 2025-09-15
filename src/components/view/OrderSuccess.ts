import { Component } from "../base/component";
import { ensureElement } from "../../utils/utils";

//успешное оформление заказа
export interface IOrderSuccess {
    title: string;
    text: number; 
    button: string;
}

interface ISuccessEvents {
    onClick: () => void;
}

export class OrderSuccess extends Component<IOrderSuccess>{
    protected _title: HTMLElement;
    protected _text: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, events: ISuccessEvents) {
        super(container);

        this._title = ensureElement<HTMLElement>(
            '.order-success__title',
            this.container
        );
        this._text = ensureElement<HTMLElement>(
            '.order-success__description',
            this.container
        );
        this._button = ensureElement<HTMLButtonElement>(
            '.order-success__close',
            this.container
        );

        if (events?.onClick) {
            this._button.addEventListener('click', events.onClick);
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set text(value: number) {
        this.setText(this._text, `Списано ${value} синапсов`);
    }

    set button(value: string) {
        this.setText(this._button, value);
    }
}