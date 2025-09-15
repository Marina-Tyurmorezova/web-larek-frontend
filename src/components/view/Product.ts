import { Component } from "../base/component";
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { CDN_URL } from "../../utils/constants";

// Категории товаров
export const categoryList: Record<string, string> = {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'другое': 'card__category_other',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',	
};

export type categoryKey = keyof typeof categoryList;

//товар
export class Product<T> extends Component<IProduct>{
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _id: string;
    protected _category?: HTMLElement;
    protected _image?: HTMLImageElement;	
    protected _description?: HTMLElement;
    
    constructor(container: HTMLElement) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', this.container);
        this._price = ensureElement<HTMLElement>('.card__price', this.container);
        this._category = container.querySelector('.card__category');
        this._image = container.querySelector('.card__image');
        this._description = container.querySelector('.card__text');
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
        } else {
            this.setText(this._price, `${value} синапсов`);
        }
    }

    get price(): number|null {
        const text = this._price.textContent;
        return text === 'Бесценно' ? null : parseInt(text);
    }

    set image(value: string) {
        this.setImage(this._image, CDN_URL + value, this.title);
    }

    set category(value: string) {
        this.setText(this._category, value);
        if (this._category) {
            for (const key in categoryList) {
                this._category.classList.toggle(
                    categoryList[key as categoryKey],
                    key === value
                );
            }
        }
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set id(value: string) {
        this._id = value;
    }

    get id(): string {
        return this._id;
    }

    render(data: Partial<T> & Partial<IProduct>) {
        const { title, price, ...other } = data;
        super.render({ title, price });
        Object.assign(this, other);
        return this.container;
    }
}

//события карточек товаров
export interface ICardEvents {
    onCardClick?: (event: MouseEvent) => void;
    onButtonClick?: (event: MouseEvent) => void;
    onDeleteClick?: (event: MouseEvent) => void;
}