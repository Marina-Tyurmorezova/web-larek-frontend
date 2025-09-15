import { Component } from "../base/component";
import { IEvents } from "../base/events";
import { ensureElement, createElement } from "../../utils/utils";

//Корзина
interface IBasket {
    modalTitle: string;
    basketOrderButton: string;
    basketList: HTMLElement[];
    basketPrice: number;
}

export class Basket extends Component<IBasket> {
    protected _modalTitle: HTMLElement;
    protected _basketOrderButton: HTMLButtonElement;
    protected _basketList: HTMLElement;
    protected _basketPrice: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents){
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

        this._basketOrderButton.addEventListener('click', () => {
            this.events.emit('formOrder:open');
        });

        this.basketList = [];
    }

    set modalTitle(value: string) {
        this.setText(this._modalTitle, value);
    }

    set basketOrderButton(value: string) {
        this.setText(this._basketOrderButton, value);
    }

    set basketList(items: HTMLElement[]) {
        if (items.length) {
            this._basketList.replaceChildren(...items);
            this.setDisabled(this._basketOrderButton, false);
        } else {
            this._basketList.replaceChildren(
                createElement<HTMLParagraphElement>('p', {
                    textContent: 'Корзина пуста',
                    style: 'opacity: 0.3;',
                })
            );
            this.setDisabled(this._basketOrderButton, true);
        }
    }

    set basketPrice(value: number) {
        this.setText(this._basketPrice, `${value} синапсов`);
    }
}