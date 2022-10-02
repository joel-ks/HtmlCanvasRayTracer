import ImageStream from "./ImageStream";
import Ray from "./Ray";
import { add, dot, lerp, normalise, scale, subtract, Vec3 } from "./vec3";

export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
    const aspectRatio = width / height;
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
            
            imageStream.putRgba(rayColour(ray), 1);
        }
    }
}

/**
 * @returns the location on the ray that intersects with the sphere, or -1 if no intersection occurs
 */
function hitSphere(centre: Vec3, radius: number, ray: Ray): number {
    // Equation for ray(O,D) intersects sphere(C,r):
    // => t^2*(D⋅D)+2*t*(D⋅(O-C))+((O-C)⋅(O-C)-r^2)=0
    // Solve for t to determine if ray intersects at any point
    // => Quadratic formula: (-b +- sqrt(b^2 - 4*a*c)) / 2*a where
    //      - a = (D⋅D)
    //      - b = 2*(D⋅(O-C))
    //      - c = ((O-C)⋅(O-C))−r^2
    // => b is a multiple of 2 so divide through to simplify (h = b/2 = D⋅(O-C)): (-h +- sqrt(h^2 - a*c)) / a
    const oc = subtract(ray.origin, centre);
    const a = dot(ray.direction, ray.direction);
    const halfB = dot(ray.direction, oc);
    const c = dot(oc) - radius*radius;
    const discriminant = halfB*halfB - a*c;

    if (discriminant < 0) return -1; // Imaginary solution - no hit
    else return (-halfB - Math.sqrt(discriminant)) / (a); // Only taking the nearest solution?
}

const spherePos = { x: 0, y: 0, z: -1 };
const sphereRadius = 0.5;

const colour1 = { x: 1.0, y: 1.0, z: 1.0 };
const colour2 = { x: 0.5, y: 0.7, z: 1.0 };

function rayColour(ray: Ray): Vec3 {
    let t = hitSphere(spherePos, sphereRadius, ray);

    if (t > 0) {
        // Use the normal vector of the sphere at the intersection point as the colour
        // but transformed so all components are in [0,1)
        const normal = normalise(subtract(ray.at(t), spherePos));
        return scale(add(normal, { x: 1, y: 1, z: 1 }), 0.5);
    }

    const normalisedDirection = normalise(ray.direction);
    t = 0.5 * (normalisedDirection.y + 1.0);
    return lerp(colour1, colour2, t);
}
