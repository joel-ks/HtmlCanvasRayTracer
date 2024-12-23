import { type Vec3, add, scale } from "./vec3";

export default class Ray {
    #origin: Vec3;
    #direction: Vec3;

    constructor(origin: Vec3, direction: Vec3) {
        this.#origin = origin;
        this.#direction = direction;
    }

    get origin() {
        return this.#origin;
    }

    get direction() {
        return this.#direction;
    }

    at(t: number): Vec3 {
        return add(this.#origin, scale(this.#direction, t));
    }
}
