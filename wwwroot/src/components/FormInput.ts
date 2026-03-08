const inputId = "an-input";

const template = /* html */`
<style>
    :host { display: block; }
    :host([hidden]) { display: none; }
    * {
        /* Reset */
        margin: 0;
        box-sizing: border-box;
    }
</style>
<label for="${inputId}"><slot></slot></label>
<input id="${inputId}" part="input" />
`;

const attrDisabled = "disabled";
const attrName = "name"; // Value is used by the associated form when we call setFormValue
const attrRequired = "required";
const attrType = "type";
const attrValue = "value";

export default class FormInput extends HTMLElement {

    // Custom element metadata
    static get formAssociated(): boolean {
        return true;
    }

    static get observedAttributes(): string[] {
        return [attrDisabled, attrType, attrValue];
    }

    // Custom element helper values
    #shadowRoot: ShadowRoot;
    #internals: ElementInternals;

    // Child elements
    #inputElem: HTMLInputElement;

    constructor() {
        super();

        this.#shadowRoot = this.attachShadow({ mode: "open" });
        this.#internals = this.attachInternals();

        this.#shadowRoot.innerHTML = template;

        this.#inputElem = this.#shadowRoot.getElementById(inputId) as HTMLInputElement;
        this.#inputElem.addEventListener("input", this.#onInput.bind(this), { passive: true });
    }

    // Properties

    get name(): string | null {
        return this.getAttribute(attrName);
    }

    set name(value: string | null) {
        if (value !== null) this.setAttribute(attrName, value);
        else this.removeAttribute(attrName);
    }

    get disabled(): boolean {
        return this.hasAttribute(attrDisabled);
    }

    set disabled(value: boolean) {
        if (value) this.setAttribute(attrDisabled, "");
        else this.removeAttribute(attrDisabled);
    }

    get required(): boolean {
        return this.hasAttribute(attrRequired);
    }

    set required(value: boolean) {
        if (value) this.setAttribute(attrRequired, "");
        else this.removeAttribute(attrRequired);
    }

    get type(): string | null {
        return this.getAttribute(attrType);
    }

    set type(value: string | null) {
        if (value !== null) this.setAttribute(attrType, value);
        else this.removeAttribute(attrType);
    }

    get value(): string {
        return this.#inputElem.value;
    }

    set value(value: string) {
        this.#inputElem.value = value;
    }

    // The following properties and methods aren't strictly required,
    // but browser-level form controls provide them. Providing them helps
    // ensure consistency with browser-provided controls.
    get form() { return this.#internals.form; }
    get validity() { return this.#internals.validity; }
    get validationMessage() { return this.#internals.validationMessage; }
    get willValidate() { return this.#internals.willValidate; }

    // Lifecycle methods

    connectedCallback() {
        this.#upgradeProperty(attrDisabled);
        this.#upgradeProperty(attrRequired);
        this.#upgradeProperty(attrType);
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        switch (name) {
            case attrDisabled: this.#disabledChanged(newValue !== null);
            case attrType: this.#typeChanged(newValue);
            case attrValue: this.#valueChanged(newValue);
        }
    }

    // formAssociatedCallback(form): void {}
    // formDisabledCallback(disabled: boolean): void {}
    // formResetCallback(): void {}
    // formStateRestoreCallback(state: string | File | FormData, mode: "autocomplete" | "restore"): void {}

    // Attribute change handlers

    #disabledChanged(value: boolean) {
        this.#inputElem.disabled = value;
    }

    #typeChanged(newValue: string | null) {
        if (newValue !== null) this.#inputElem.type = newValue;
        else this.#inputElem.removeAttribute("type");
    }

    #valueChanged(newValue: string | null) {
        if (newValue !== null) this.#inputElem.setAttribute("value", newValue);
        else this.#inputElem.removeAttribute("value");
    }

    // Event handlers

    #onInput() {
        if (this.#validate()) this.#internals.setFormValue(this.#inputElem.value);
    }

    // Other private methods

    #validate() {
        if (this.required && !this.#hasValue())
        {
            this.#internals.setValidity({ valueMissing: true }, "This value is required", this.#inputElem);
            return false;
        }
        else {
            this.#internals.setValidity({});
            return true;
        }

    }

    #hasValue() {
        return this.#inputElem.value !== null
            && this.#inputElem.value.trim() !== "";
    }

    // TODO:
    // - reflect other attributes to input?
    //  - max, min, step, ...
    // - how to allow styling so that label and input can align with other form elements?
    // - ...

    #upgradeProperty(prop: PropertyKey) {
        if (this.hasOwnProperty(prop)) {
            // @ts-ignore: this is guarded by hasOwnProperty
            let value = this[prop];
            // @ts-ignore: this is guarded by hasOwnProperty
            delete this[prop];
            // @ts-ignore: this is guarded by hasOwnProperty
            this[prop] = value;
        }
    }
}
