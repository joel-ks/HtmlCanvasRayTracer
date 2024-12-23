import Ray from "./Ray";
import { type Vec3, add, cross, normalise, randomVec3InUnitDisk, scale, subtract } from "./vec3";

export default class Camera {
    #position: Vec3;
    #lowerLeft: Vec3;
    #horizontal: Vec3;
    #vertical: Vec3;
    #u: Vec3;
    #v: Vec3;
    #w: Vec3;
    #lensRadius: number;

    constructor(position: Vec3, lookAt: Vec3, up: Vec3,
        vfovRadians: number, aspectRatio: number,
        aperture: number, focalLength: number) {
        const h = Math.tan(vfovRadians / 2);

        const viewportHeight = 2 * h;
        const viewportWidth = aspectRatio * viewportHeight;

        this.#w = normalise(subtract(position, lookAt));
        this.#u = normalise(cross(up, this.#w));
        this.#v = cross(this.#w, this.#u);

        this.#position = position;
        this.#horizontal = scale(this.#u, focalLength * viewportWidth);
        this.#vertical = scale(this.#v, focalLength * viewportHeight);
        this.#lowerLeft = subtract(this.#position, add(
            scale(this.#horizontal, 1/2),
            add(
                scale(this.#vertical, 1/2),
                scale(this.#w, focalLength)
            )
        ));

        this.#lensRadius = aperture / 2.0;
    }

    getRay(s: number, t: number): Ray {
        const rd = scale(randomVec3InUnitDisk(), this.#lensRadius);
        const offset = add(scale(this.#u, rd.x), scale(this.#v, rd.y));

        const origin = add(this.#position, offset);

        const direction = subtract(
            add(
                add(this.#lowerLeft, scale(this.#horizontal, s)),
                scale(this.#vertical, t)
            ), origin
        );

        return new Ray(origin, direction);
    }
}
