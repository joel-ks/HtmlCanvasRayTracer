import { add, scale, Vec3 } from "./vec3";

export default class Ray {
    #origin: Vec3;
    #direction: Vec3;

    constructor();
    constructor(origin: Vec3, direction: Vec3);
    constructor(origin?: Vec3, direction?: Vec3) {
        this.#origin = origin ?? { x: 0, y: 0, z: 0 };
        this.#direction = direction ?? { x: 0, y: 0, z: 0 };
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
