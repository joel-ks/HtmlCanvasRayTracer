import Camera from "./Camera";
import { HittableList, IHittable, Sphere } from "./hittable";
import ImageStream from "./ImageStream";
import { rand } from "./numberUtils";
import Ray from "./Ray";
import { add, lerp, normalise, scale, subtract, Vec3 } from "./vec3";

export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {

    // Image
    const aspectRatio = width / height;
    const samplesPerPixel = 100;

    // World
    const world = new HittableList();
    world.add(new Sphere({ x: 0, y: 0, z: -1 }, 0.5));
    world.add(new Sphere({ x: 0, y: -100.5, z: -1 }, 100));

    // Camera
    const camera = new Camera(aspectRatio);

    // Render
    const imageStream = new ImageStream(data);

    // We're filling the buffer from the top line down but our coordinate space is y-up
    for (let y = height-1; y >= 0; --y) {
        statusUpdate(`Progress: ${Math.floor(((height - 1 - y) / height) * 100)}%`);

        for (let x = 0; x < width; ++x) {
            let pixelColour: Vec3 = { x: 0, y: 0, z: 0 };

            for (let s = 0; s < samplesPerPixel; ++s)
            {
                const u = (x + rand()) / (width - 1);
                const v = (y + rand()) / (height - 1);

                const ray = camera.getRay(u, v);
                pixelColour = add(pixelColour, rayColour(ray, world));
            }
            
            imageStream.putRgba(scale(pixelColour, 1.0 / samplesPerPixel), 1);
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
