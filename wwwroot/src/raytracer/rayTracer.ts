import ImageStream from "./ImageStream";
import { Vec3 } from "./vec3";

export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
    const imageStream = new ImageStream(data);

    let imageDataIndex = -1;
    for (let y = 0; y < height; ++y) {
        statusUpdate(`Progress: ${Math.floor((y / height) * 100)}%`);

        for (let x = 0; x < width; ++x) {
            const pixelColour: Vec3 = {
                x: x / width,
                y: (width - x - 1) / width,
                z: y / height
            }
            
            imageStream.putRgba(pixelColour, 255);
        }

        // Spin for a while so we can see the progress
        for (let i = 0; i < 9_999_999; ++i);
    }
}
