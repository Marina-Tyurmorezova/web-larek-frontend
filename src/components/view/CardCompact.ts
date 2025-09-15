import { Product, ICardEvents } from "./Product";
import { TProductBasket } from "../../types";
import { ensureElement } from "../../utils/utils";

//карточка в корзине
export class CardCompact extends Product<TProductBasket> {
    protected _index: HTMLElement;
    protected _deleteBasketButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: ICardEvents) {
       super(container);
       
       this._index = ensureElement<HTMLElement>(
            '.basket__item-index',
            this.container
        );

        this._deleteBasketButton = ensureElement<HTMLButtonElement>(
            '.basket__item-delete',
            this.container
        );

        if (events?.onDeleteClick) {
            this._deleteBasketButton.addEventListener('click', events.onDeleteClick);
        }
    }

    set index(value: number) {
        this.setText(this._index, value);
    }
}