import Ray from "./Ray";
import { add, scale, subtract, Vec3 } from "./vec3";

export default class Camera {
    #origin: Vec3;
    #lowerLeft: Vec3;
    #horizontal: Vec3;
    #vertical: Vec3;

    constructor(aspectRatio: number) {
        const height = 2;
        const width = aspectRatio * height;
        const focalLength = 1;

        this.#origin = { x: 0, y: 0, z: 0 };
        this.#horizontal = { x: width, y: 0, z: 0 };
        this.#vertical = { x: 0, y: height, z: 0 };
        this.#lowerLeft = subtract(
            subtract(
                subtract(this.#origin, scale(this.#horizontal, 1.0 / 2.0)),
                scale(this.#vertical, 1.0 / 2.0)
            ), { x: 0, y: 0, z: focalLength }
        );
    }

    getRay(u: number, v: number): Ray {
        const direction = subtract(
            add(
                add(this.#lowerLeft, scale(this.#horizontal, u)),
                scale(this.#vertical, v)
            ), this.#origin
        );

        return new Ray(this.#origin, direction);
    }
}
