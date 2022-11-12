import Camera from "./Camera";
import { HittableList, IHittable, Sphere } from "./hittable";
import ImageStream from "./ImageStream";
import { LambertianMaterial, MetalMaterial } from "./material";
import { rand } from "./numberUtils";
import Ray from "./Ray";
import { add, lerp, multiply, normalise, randomVec3InHemisphere, randomVec3InUnitSphere, scale, Vec3 } from "./vec3";

export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {

    // Image
    const aspectRatio = width / height;
    const samplesPerPixel = 100;
    const maxBounces = 50;

    // World
    const world = new HittableList();

    const groundMaterial = new LambertianMaterial({ x: 0.8, y: 0.8, z: 0.0 });
    const centreMaterial = new LambertianMaterial({ x: 0.7, y: 0.3, z: 0.3 });
    const leftMaterial = new MetalMaterial({x: 0.8, y: 0.8, z: 0.8 }, 0.3);
    const rightMaterial = new MetalMaterial({x: 0.8, y: 0.6, z: 0.2 }, 1.0);

    world.add(new Sphere({ x: 0, y: -100.5, z: -1 }, 100, groundMaterial));
    world.add(new Sphere({ x: 0, y: 0, z: -1 }, 0.5, centreMaterial));
    world.add(new Sphere({ x: -1, y: 0, z: -1 }, 0.5, leftMaterial));
    world.add(new Sphere({ x: 1, y: 0, z: -1 }, 0.5, rightMaterial));

    // Camera
    const camera = new Camera(aspectRatio);

    // Render
    const imageStream = new ImageStream(data);

    // We're filling the buffer from the top line down but our coordinate space is y-up
    for (let y = height - 1; y >= 0; --y) {
        statusUpdate(`Progress: ${Math.floor(((height - 1 - y) / height) * 100)}%`);

        for (let x = 0; x < width; ++x) {
            let pixelColour: Vec3 = { x: 0, y: 0, z: 0 };

            for (let s = 0; s < samplesPerPixel; ++s) {
                const u = (x + rand()) / (width - 1);
                const v = (y + rand()) / (height - 1);

                const ray = camera.getRay(u, v);
                pixelColour = add(pixelColour, rayColour(ray, world, maxBounces));
            }

            const scaled = scale(pixelColour, 1.0 / samplesPerPixel);
            imageStream.putRgba(gammaCorrect(scaled), 1);
        }
    }
}

function gammaCorrect(colour: Vec3) {
    // Gamma-correct for gamma=2.0
    return {
        x: Math.sqrt(colour.x),
        y: Math.sqrt(colour.y),
        z: Math.sqrt(colour.z)
    };
}

const bgColour1 = { x: 1.0, y: 1.0, z: 1.0 };
const bgColour2 = { x: 0.5, y: 0.7, z: 1.0 };

function rayColour(ray: Ray, world: IHittable, maxBounces: number): Vec3 {
    // If we've exceeded the bounce limit no more light is gathered
    if (maxBounces < 0) return { x: 0, y: 0, z: 0 };

    const hitRecord = world.hit(ray, 0.001, Number.MAX_SAFE_INTEGER);

    if (hitRecord) {
        const scattered = hitRecord.material.scatter(ray, hitRecord)
        return multiply(rayColour(scattered, world, maxBounces - 1), hitRecord.material.attenuation);
    }

    const normalisedDirection = normalise(ray.direction);
    return lerp(bgColour1, bgColour2, 0.5 * (normalisedDirection.y + 1.0));
}
