import Camera from "./Camera";
import { type IHittable, HittableList, Sphere } from "./hittable";
import ImageStream from "./ImageStream";
import { type IMaterial, DielectricMaterial, LambertianMaterial, MetalMaterial } from "./material";
import { degreesToRadians, rand } from "./numberUtils";
import Ray from "./Ray";
import { type Vec3, add, length, lerp, multiply, normalise, randomVec3, scale, subtract } from "./vec3";

export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {

    // Image
    const aspectRatio = width / height;
    const samplesPerPixel = 100;
    const maxBounces = 50;

    // World
    const world = buildRandomScene();

    // Camera
    const cameraPos = { x: 13, y: 2, z: 3 };
    const cameraLookAt = { x: 0, y: 0, z: 0 };
    const cameraUp = { x: 0, y: 1, z: 0 };
    const cameraFov = degreesToRadians(20.0);
    const cameraAperture = 0.1;
    const cameraFocalLength = 10.0;
    const camera = new Camera(cameraPos, cameraLookAt, cameraUp, cameraFov, aspectRatio, cameraAperture, cameraFocalLength);

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

function buildRandomScene() {
    const world = new HittableList();

    const groundMaterial = new LambertianMaterial({ x: 0.5, y: 0.5, z: 0.5 });
    world.add(new Sphere({ x: 0, y: -1000, z: 0 }, 1000, groundMaterial));

    for (let a = -11; a < 11; ++a) {
        for (let b = -11; b < 11; ++b) {
            const centre = {
                x: a + 0.9*rand(),
                y: 0.2,
                z: b + 0.9 * rand()
            };

            if (length(subtract(centre, { x: 4, y: 0.2, z: 0 })) > 0.9)
            {
                let material: IMaterial;
                const chooseMat = rand();

                if (chooseMat < 0.8) {
                    // diffuse
                    const albedo = multiply(randomVec3(), randomVec3());
                    material = new LambertianMaterial(albedo);
                } else if (chooseMat < 0.95) {
                    // metal
                    const albedo = randomVec3(0.5, 1);
                    const fuzz = rand(0, 0.5);
                    material = new MetalMaterial(albedo, fuzz);
                } else {
                    // glass
                    material = new DielectricMaterial(1.5);
                }

                world.add(new Sphere(centre, 0.2, material));
            }
        }
    }

    const material1 = new DielectricMaterial(1.5);
    world.add(new Sphere({ x: 0, y: 1, z: 0 }, 1.0, material1));

    const material2 = new LambertianMaterial({ x: 0.4, y: 0.2, z: 0.1 });
    world.add(new Sphere({ x: -4, y: 1, z: 0 }, 1.0, material2));

    const material3 = new MetalMaterial({ x: 0.7, y: 0.6, z: 0.5 }, 0.0);
    world.add(new Sphere({ x: 4, y: 1, z: 0 }, 1.0, material3));

    return world;
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
