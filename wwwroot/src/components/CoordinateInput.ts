const template = /* html */`
<style>
    :host { display: block; }
    :host([hidden]) { display: none; }
    * {
        /* Reset */
        margin: 0;
        box-sizing: border-box;
        line-height: 1.1;
        font: inherit;
    }
    input {
        width: 10ch;
    }
</style>
<label ><slot></slot>:</label>
<input id="input-x" part="input" type="number" placeholder="X" />
<input id="input-x" part="input" type="number" placeholder="Y" />
<input id="input-x" part="input" type="number" placeholder="Z" />
`;

const attrDisabled = "disabled";
const attrName = "name"; // Value is used by the associated form when we call setFormValue
const attrRequired = "required";
const attrValue = "value";

export default class CoordinateInput extends HTMLElement {

    // Custom element metadata
    static get formAssociated(): boolean {
        return true;
    }

    static get observedAttributes(): string[] {
        return [attrDisabled, attrValue];
    }

    // Custom element helper values
    #shadowRoot: ShadowRoot;
    #internals: ElementInternals;

    #inputs: [HTMLInputElement, HTMLInputElement, HTMLInputElement];

    constructor() {
        super();

        this.#shadowRoot = this.attachShadow({ mode: "open" });
        this.#internals = this.attachInternals();

        this.#shadowRoot.innerHTML = template;

        this.#inputs = [
            this.#shadowRoot.getElementById("input-x") as HTMLInputElement,
            this.#shadowRoot.getElementById("input-y") as HTMLInputElement,
            this.#shadowRoot.getElementById("input-z") as HTMLInputElement,
        ];

        for(const i of this.#inputs) i.addEventListener("input", this.#onInput.bind(this), { passive: true });
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

    get value(): [number, number, number] {
        return [
            Number(this.#inputs[0].value),
            Number(this.#inputs[1].value),
            Number(this.#inputs[2].value)
        ];
    }

    set value(value: [number, number, number]) {
        this.#inputs[0].value = value[0].toString();
        this.#inputs[1].value = value[1].toString();
        this.#inputs[2].value = value[2].toString();
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
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        switch (name) {
            case attrDisabled: this.#disabledChanged(newValue !== null);
            case attrValue: this.#valueChanged(newValue);
        }
    }

    // formAssociatedCallback(form): void {}
    // formDisabledCallback(disabled: boolean): void {}
    // formResetCallback(): void {}
    // formStateRestoreCallback(state: string | File | FormData, mode: "autocomplete" | "restore"): void {}

    // Attribute change handlers

    #disabledChanged(value: boolean) {
        for (const input of this.#inputs) input.disabled = value;
    }

    #valueChanged(newValue: string | null) {
            var parts = newValue?.split(",") ?? [];
            this.#inputs[0].value = parts[0] ?? "";
            this.#inputs[1].value = parts[1] ?? "";
            this.#inputs[2].value = parts[2] ?? "";
    }

    // Event handlers

    #onInput() {
        if (this.#validate())
            this.#internals.setFormValue(`[${this.#inputs[0].value},${this.#inputs[1].value},${this.#inputs[2].value}]`);
    }

    // Other private methods

    #validate() {
        if (this.required && !this.#hasValue())
        {
            this.#internals.setValidity({ valueMissing: true }, "This value is required", this);
            return false;
        }
        else {
            this.#internals.setValidity({});
            return true;
        }

    }

    #hasValue() {
        for(const i of this.#inputs) {
            if (i.value === null || i.value.trim() === "") return false;
        }

        return true;
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
