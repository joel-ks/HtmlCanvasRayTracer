export function rand(min: number = 0, max: number = 1): number {
    const lower = min ?? 0;
    const upper = max ?? 1;
    return Math.random() * (upper - lower) + lower;
}

export function clamp(x: number, min: number = 0, max: number = 1) {
    if (x > max) return max;
    if (x < min) return min;
    return x;
}
