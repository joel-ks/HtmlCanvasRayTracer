import Ray from "./Ray";
import { dot, scale, subtract, Vec3 } from "./vec3";

export interface HitRecord {
    point: Vec3;
    normal: Vec3;
    t: number;
    frontFace: boolean;
}

export interface IHittable {
    hit(ray: Ray, tMin: number, tMax: number): HitRecord | null;
}

export class HittableList implements IHittable {
    #hittables: Array<IHittable> = [];

    clear() {
        this.#hittables = [];
    }

    add(hittable: IHittable) {
        this.#hittables.push(hittable);
    }

    hit(ray: Ray, tMin: number, tMax: number): HitRecord | null {
        let closestHit: HitRecord | null = null;

        for (const h of this.#hittables) {
            const hit = h.hit(ray, tMin, closestHit?.t ?? tMax);
            closestHit = hit ?? closestHit;
        }

        return closestHit;
    }
}

export class Sphere implements IHittable {
    #centre: Vec3;
    #radius: number;

    constructor()
    constructor(centre: Vec3, radius: number)
    constructor(centre?: Vec3, radius?: number) {
        this.#centre = centre ?? { x: 0, y: 0, z: 0 };
        this.#radius = radius ?? 0;
    }

    hit(ray: Ray, tMin: number, tMax: number): HitRecord | null {
        // Equation for ray(O,D) intersects sphere(C,r):
        // => t^2*(D⋅D)+2*t*(D⋅(O-C))+((O-C)⋅(O-C)-r^2)=0
        // Solve for t to determine if ray intersects at any point
        // => Quadratic formula: (-b +- sqrt(b^2 - 4*a*c)) / 2*a where
        //      - a = (D⋅D)
        //      - b = 2*(D⋅(O-C))
        //      - c = ((O-C)⋅(O-C))−r^2
        // => b is a multiple of 2 so divide through to simplify (h = b/2 = D⋅(O-C)): (-h +- sqrt(h^2 - a*c)) / a
        const oc = subtract(ray.origin, this.#centre);
        const a = dot(ray.direction);
        const halfB = dot(oc, ray.direction);
        const c = dot(oc) - this.#radius * this.#radius;
        const discriminant = halfB * halfB - a * c;

        if (discriminant < 0) return null; // Imaginary solution - no hit

        const sqrtd = Math.sqrt(discriminant);

        // Find the nearest root that lies in the acceptable range.
        let t = (-halfB - sqrtd) / a; // Try smallest root
        if (t <= tMin || t >= tMax) {
            t = (-halfB + sqrtd) / a; // Try largest root
            if (t <= tMin || t >= tMax) return null;
        }

        // Hit point and surface normal at hit point
        const point = ray.at(t);
        const [normal, frontFace] = correctNormalForFace(ray, scale(subtract(point, this.#centre), 1 / this.#radius));

        return { point, normal, t, frontFace };
    }
}

function correctNormalForFace(ray: Ray, normal: Vec3): [correctedNormal: Vec3, frontFace: boolean] {
    const frontFace = dot(ray.direction, normal) < 0;
    const correctedNormal = frontFace ? normal : scale(normal, -1);
    return [correctedNormal, frontFace];
}
