import { Component } from "../base/component";
import { ensureElement, ensureAllElements } from "../../utils/utils";
import { IEvents } from "../base/events";

//Формы в модальном окне
interface IForm {
    modalFormTitles: string[];
    submitButton: string;
    valid: boolean;
    errors: string[];	
}

export class Form<T> extends Component<IForm> {
    protected _modalFormTitles: HTMLElement[];
    protected _submitButton: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this._modalFormTitles = ensureAllElements<HTMLElement>(
            '.modal__title',
            this.container
        );

        this._submitButton = ensureElement<HTMLButtonElement>(
            'button[type=submit]',
            this.container
        );

        this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onInputUpdate(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    set modalFormTitles(value: string[]) {
        this._modalFormTitles.forEach((title, index) => {
            this.setText(title, value[index]);
        });
    }

    set submitButton(value: string) {
        this.setText(this._submitButton, value);
    }

    set valid(value: boolean) {
        this._submitButton.disabled = !value;
    }

    set errors(value: string) {
        this.setText(this._errors, value);
    }

    protected onInputUpdate(field: keyof T, value: string) {
        this.events.emit(`${this.container.name}.${String(field)}:filled`, {
            field,
            value,
        });
    }

    render(data: Partial<T> & IForm) {
        const { modalFormTitles, submitButton, valid, errors, ...inputs } = data;
        super.render({ modalFormTitles, submitButton, valid, errors });
        Object.assign(this, inputs);
        return this.container;
    }
}