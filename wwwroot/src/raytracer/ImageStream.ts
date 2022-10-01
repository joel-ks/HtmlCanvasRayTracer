import { Vec3 } from "./vec3";

export default class ImageStream {
    #data: Uint8ClampedArray;
    #index: number = -1;

    constructor(buffer: SharedArrayBuffer) {
        this.#data = new Uint8ClampedArray(buffer);
    }

    putRgba(colour: Vec3, alpha: number) {
        this.#data[++this.#index] = colour.x * 256;
        this.#data[++this.#index] = colour.y * 256;
        this.#data[++this.#index] = colour.z * 256;
        this.#data[++this.#index] = alpha * 256;
    }
}
