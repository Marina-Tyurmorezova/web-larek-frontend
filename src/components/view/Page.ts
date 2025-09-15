import { Component } from "../base/component";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";

//для работы со всей страницей
interface IPage {
    locked: boolean;
    counter: number;
    catalog: HTMLElement[];
}

export class Page extends Component<IPage> {
    protected wrapper: HTMLElement;
    protected basketButton: HTMLButtonElement;
    protected counterElement: HTMLElement;
    protected catalogItems: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
    
    this.wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);

    this.basketButton = ensureElement <HTMLButtonElement>(
            '.header__basket',
            this.container
        );
    
    this.counterElement = ensureElement<HTMLElement>(
            '.header__basket-counter',
            this.container
        );

    this.basketButton.addEventListener('click', () => {
        this.events.emit('basket:open');
        });

    this.catalogItems = ensureElement<HTMLElement>(
            '.gallery',
            this.container
        );
    }

    set locked(value: boolean) {
        if (value) {
            this.wrapper.classList.add('page__wrapper_locked');
        } else {
            this.wrapper.classList.remove('page__wrapper_locked');
        }
    }

    set counter(value: number) {
        this.setText(this.counterElement, value);
    }

    set catalog(items: HTMLElement[]) {
        this.catalogItems.replaceChildren(...items);
    }
}