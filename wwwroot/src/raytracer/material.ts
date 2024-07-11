import { HitRecord } from "./hittable";
import { rand } from "./numberUtils";
import Ray from "./Ray";
import { add, dot, nearZero, normalise, randomVec3InHemisphere, randomVec3InUnitSphere, reflect, refract, scale, Vec3 } from "./vec3";

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

        return new Ray(hitRecord.point, add(reflected, perturbation));
    }
}

export class DielectricMaterial implements IMaterial {
    #refractionIndex: number;

    constructor(refractionIndex: number) {
        this.#refractionIndex = refractionIndex;
    }

    get attenuation(): Vec3 {
        return { x: 1.0, y: 1.0, z: 1.0 };
    }

    scatter(rayIn: Ray, hitRecord: HitRecord): Ray {
        const refractionIndexRatio = hitRecord.frontFace ? (1.0 / this.#refractionIndex) : this.#refractionIndex;
        const unitDirection = normalise(rayIn.direction);

        const cosTheta = Math.min(dot(scale(unitDirection, -1), hitRecord.normal), 1.0);
        const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);

        const direction: Vec3 = refractionIndexRatio * sinTheta > 1.0 || this.#reflectance(cosTheta, refractionIndexRatio) > rand()
            ? reflect(unitDirection, hitRecord.normal)
            : refract(unitDirection, hitRecord.normal, refractionIndexRatio);

        return new Ray(hitRecord.point, direction);
    }

    #reflectance(cosTheta: number, refractionIndexRatio: number) {
        // Use Schlick's approximation for reflectance.
        let r0 = (1 - refractionIndexRatio) / (1 + refractionIndexRatio);
        r0 *= r0;
        return r0 + (1 - r0) * Math.pow(1 - cosTheta, 5);
    }
}
