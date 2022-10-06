import { HittableList, IHittable, Sphere } from "./hittable";
import ImageStream from "./ImageStream";
import Ray from "./Ray";
import { add, lerp, normalise, scale, subtract, Vec3 } from "./vec3";

export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
    const aspectRatio = width / height;

    // World
    
    const world = new HittableList();
    world.add(new Sphere({ x: 0, y: 0, z: -1 }, 0.5));
    world.add(new Sphere({ x: 0, y: -100.5, z: -1 }, 100));

    // Camera

    const origin: Vec3 = { x: 0, y: 0, z: 0 };
    const viewportHeight = 2.0;
    const viewportWidth = aspectRatio * viewportHeight;
    const focalLength = 1.0;

    const horizontal: Vec3 = { x: viewportWidth, y: 0, z: 0 };
    const vertical: Vec3 = { x: 0, y: viewportHeight, z: 0 };
    const lowerLeft = subtract(
        subtract(
            subtract(origin, scale(horizontal, 1/2)),
            scale(vertical, 1/2)
        ), { x: 0, y: 0, z: focalLength }
    );

    // Render

    const imageStream = new ImageStream(data);

    for (let y = height-1; y >= 0; --y) { // We're filling the buffer from the top line down
        statusUpdate(`Progress: ${Math.floor((y / height) * 100)}%`);

        for (let x = 0; x < width; ++x) {
            const u = x / (width - 1);
            const v = y / (height - 1);

            const rayDir = subtract(
                add(
                    add(lowerLeft, scale(horizontal, u)),
                    scale(vertical, v)
                ), origin
            );
            const ray = new Ray(origin, rayDir);
            
            imageStream.putRgba(rayColour(ray, world), 1);
        }
    }
}

const colour1 = { x: 1.0, y: 1.0, z: 1.0 };
const colour2 = { x: 0.5, y: 0.7, z: 1.0 };

function rayColour(ray: Ray, hittable: IHittable): Vec3 {
    const hitRecord = hittable.hit(ray, 0, Number.MAX_SAFE_INTEGER);

    if (hitRecord) {
        // Use the normal vector of the hit object as the colour
        // but transformed so all components are in [0,1)
        return scale(add(hitRecord.normal, { x: 1, y: 1, z: 1 }), 0.5);
    }

    const normalisedDirection = normalise(ray.direction);
    return lerp(colour1, colour2, 0.5 * (normalisedDirection.y + 1.0));
}
