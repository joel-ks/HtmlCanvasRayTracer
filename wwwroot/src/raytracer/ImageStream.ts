import { clamp } from "./numberUtils";
import type { Vec3 } from "./vec3";

export default class ImageStream {
    #data: Uint8ClampedArray;
    #index: number = -1;

    constructor(buffer: SharedArrayBuffer) {
        this.#data = new Uint8ClampedArray(buffer);
    }

    putRgba(colour: Vec3, alpha: number) {
        this.#data[++this.#index] = clamp(colour.x) * 255;
        this.#data[++this.#index] = clamp(colour.y) * 255;
        this.#data[++this.#index] = clamp(colour.z) * 255;
        this.#data[++this.#index] = clamp(alpha) * 255;
    }
}
