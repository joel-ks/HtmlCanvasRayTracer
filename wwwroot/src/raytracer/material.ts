import { HitRecord } from "./hittable";
import Ray from "./Ray";
import { add, multiply, nearZero, normalise, randomVec3InHemisphere, randomVec3InUnitSphere, reflect, scale, Vec3 } from "./vec3";

export interface IMaterial {
    get attenuation(): Vec3;
    scatter(rayIn: Ray, hitRecord: HitRecord): Ray;
}

export class LambertianMaterial implements IMaterial {
    #albedo: Vec3;
    
    constructor(albedo: Vec3) {
        this.#albedo = albedo;
    }

    get attenuation(): Vec3 {
        return this.#albedo;
    }
    
    scatter(_: Ray, hitRecord: HitRecord): Ray {
        let scatterDir = add(hitRecord.normal, normalise(randomVec3InUnitSphere()));

        // Catch degenerate scatter
        if (nearZero(scatterDir)) scatterDir = hitRecord.normal;

        const rayOut = new Ray(hitRecord.point, scatterDir);
        return rayOut;
    }
}

export class HemisphericalMaterial implements IMaterial {
    #albedo: Vec3;
    
    constructor(albedo: Vec3) {
        this.#albedo = albedo;
    }

    get attenuation(): Vec3 {
        return this.#albedo;
    }
    
    scatter(_: Ray, hitRecord: HitRecord): Ray {
        let scatterDir = randomVec3InHemisphere(hitRecord.normal);

        // Catch degenerate scatter
        if (nearZero(scatterDir)) scatterDir = hitRecord.normal;

        const rayOut = new Ray(hitRecord.point, scatterDir);
        return rayOut;
    }
}

export class MetalMaterial implements IMaterial {
    #albedo: Vec3;
    #fuzz: number;

    constructor(albedo: Vec3)
    constructor(albedo: Vec3, fuzz: number)
    constructor(albedo: Vec3, fuzz?: number) {
        this.#albedo = albedo;
        this.#fuzz = fuzz ?? 0;
    }
    
    get attenuation(): Vec3 {
        return this.#albedo;
    }

    scatter(rayIn: Ray, hitRecord: HitRecord): Ray {
        const reflected = reflect(normalise(rayIn.direction), hitRecord.normal);
        const perturbation = this.#fuzz === 0 ? { x: 0, y: 0, z: 0 } : scale(randomVec3InUnitSphere(), this.#fuzz);

        return new Ray(hitRecord.point, add(reflected, perturbation)); // TODO: need to handle front/back face?
    }
}
