import { rand } from "./numberUtils";

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export function add(v1: Vec3, v2: Vec3): Vec3 {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}

export function subtract(v1: Vec3, v2: Vec3): Vec3 {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };
}

export function multiply(v1: Vec3, v2: Vec3): Vec3 {
    return {
        x: v1.x * v2.x,
        y: v1.y * v2.y,
        z: v1.z * v2.z,
    }
}

export function scale(v: Vec3, scale: number): Vec3 {
    return {
        x: v.x * scale,
        y: v.y * scale,
        z: v.z * scale
    }
}

export function dot(v1: Vec3): number
export function dot(v1: Vec3, v2: Vec3): number
export function dot(v1: Vec3, v2?: Vec3): number {
    if (!v2) v2 = v1;

    return v1.x * v2.x +
        v1.y * v2.y +
        v1.z * v2.z;
}

export function cross(v1: Vec3, v2: Vec3): Vec3 {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };
}

export function reflect(v: Vec3, normal: Vec3): Vec3 {
    return subtract(v, scale(normal, 2 * dot(v, normal)));
}

export function refract(v: Vec3, normal: Vec3, refractionIndexRatio: number) {
    const cosTheta = Math.min(dot(scale(v, -1), normal), 1.0);
    const perpendicular = scale(add(v, scale(normal, cosTheta)), refractionIndexRatio);
    const parallel = scale(normal, -Math.sqrt(Math.abs(1.0 - dot(perpendicular))));
    return add(perpendicular, parallel);
}

export function length(v: Vec3): number {
    return Math.sqrt(dot(v));
}

export function normalise(v: Vec3): Vec3 {
    return scale(v, 1 / length(v));
}

export function nearZero(v: Vec3): boolean {
    const epsilon = 1e-8;
    return Math.abs(v.x) < epsilon
        && Math.abs(v.y) < epsilon
        && Math.abs(v.z) < epsilon;
}

export function lerp(v1: Vec3, v2: Vec3, t: number): Vec3 {
    return add(scale(v1, (1.0 - t)), scale(v2, t))
}

export function toString(v: Vec3) {
    return `(${v.x}, ${v.y}, ${v.z})`;
}

export function randomVec3(min?: number, max?: number) {
    return {
        x: rand(min, max),
        y: rand(min, max),
        z: rand(min, max)
    };
}

export function randomVec3InUnitSphere() {
    while (true) {
        const v = randomVec3(-1, 1);
        if (dot(v) < 1) return v;
    }
}

export function randomVec3InHemisphere(normal: Vec3) {
    const inUnitSphere = randomVec3InUnitSphere();
    if (dot(inUnitSphere, normal) >= 0.0) return inUnitSphere;
    else return scale(inUnitSphere, -1);
}
