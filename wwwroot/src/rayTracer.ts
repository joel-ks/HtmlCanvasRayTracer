import { WorkerRequest } from "./worker/workerMessageTypes";

export function render(imageData: WorkerRequest, statusUpdate: (msg: string) => void) {
    const imageDataView = new Uint8ClampedArray(imageData.data);

    let imageDataIndex = -1;
    for (let y = 0; y < imageData.height; ++y) {
        statusUpdate(`Progress: ${Math.floor((y / imageData.height) * 100)}%`);

        for (let x = 0; x < imageData.width; ++x) {
            imageDataView[++imageDataIndex] = (x / imageData.width) * 255;
            imageDataView[++imageDataIndex] = ((imageData.width - x) / imageData.width) * 255;
            imageDataView[++imageDataIndex] = (y / imageData.height) * 255;
            imageDataView[++imageDataIndex] = 255;
        }

        // Spin for a while so we can see the progress
        for (let i = 0; i < 9_999_999; ++i);
    }
}
