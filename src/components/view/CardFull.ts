import { Product, ICardEvents } from "./Product";
import { TProductDetails } from "../../types";
import { ensureElement } from "../../utils/utils";

//карточка с полной информацией о товаре
export class CardFull extends Product<TProductDetails> {
    protected _cardButton: HTMLButtonElement;
    protected _inBasket: boolean = false;

    constructor(container: HTMLElement, events?: ICardEvents) {
        super(container);

        this._cardButton = ensureElement<HTMLButtonElement>(
            '.card__button',
            this.container
        );

        if (events?.onButtonClick) {
            this._cardButton.addEventListener('click', events.onButtonClick);
        }
    }
   
    set buttonText(value: boolean) {
        if (this.price === null) {
            this.setText(this._cardButton, 'Недоступно');
            this.setDisabled(this._cardButton, true);
        } else {
            this.setDisabled(this._cardButton, false);
            this.setText(
                this._cardButton,
                value ? 'Удалить из корзины' : 'Купить'
            );
        }
    }

}