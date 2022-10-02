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

export function length(v: Vec3): number {
    return Math.sqrt(dot(v));
}

export function normalise(v: Vec3): Vec3 {
    return scale(v, 1 / length(v));
}

export function lerp(v1: Vec3, v2: Vec3, t: number): Vec3 {
    return add(scale(v1, (1.0 - t)), scale(v2, t))
}

export function toString(v: Vec3) {
    return `(${v.x}, ${v.y}, ${v.z})`;
}
