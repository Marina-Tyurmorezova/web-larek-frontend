import { Product, ICardEvents} from "./Product";
import { TProductPreview } from "../../types";

//карточка в каталоге товаров (галереее товаров)
export class CardCatalog extends Product<TProductPreview> {
    constructor(container: HTMLElement, events?: ICardEvents){
        super(container);

        if (events?.onCardClick) {
            this.container.addEventListener('click', events.onCardClick);
        }
    }
}