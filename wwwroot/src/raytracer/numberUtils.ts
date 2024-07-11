export function rand(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min;
}

export function clamp(x: number, min: number = 0, max: number = 1) {
    if (x > max) return max;
    if (x < min) return min;
    return x;
}

export function degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180.0
}
