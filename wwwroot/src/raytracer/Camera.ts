import Ray from "./Ray";
import { add, cross, normalise, scale, subtract, Vec3 } from "./vec3";

export default class Camera {
    #origin: Vec3;
    #lowerLeft: Vec3;
    #horizontal: Vec3;
    #vertical: Vec3;

    constructor(position: Vec3, lookAt: Vec3, up: Vec3, vfovRadians: number, aspectRatio: number) {
        const h = Math.tan(vfovRadians / 2);

        const viewportHeight = 2 * h;
        const viewportWidth = aspectRatio * viewportHeight;

        const w = normalise(subtract(position, lookAt));
        const u = normalise(cross(up, w));
        const v = cross(w, u);

        this.#origin = position;
        this.#horizontal = scale(u, viewportWidth);
        this.#vertical = scale(v, viewportHeight);
        this.#lowerLeft = subtract(this.#origin, add(
            scale(this.#horizontal, 1/2),
            add(scale(this.#vertical, 1/2), w)
        ));
    }

    getRay(s: number, t: number): Ray {
        const direction = subtract(
            add(
                add(this.#lowerLeft, scale(this.#horizontal, s)),
                scale(this.#vertical, t)
            ), this.#origin
        );

        return new Ray(this.#origin, direction);
    }
}
