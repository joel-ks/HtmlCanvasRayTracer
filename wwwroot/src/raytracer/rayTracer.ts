export function render(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
    const imageDataView = new Uint8ClampedArray(data);

    let imageDataIndex = -1;
    for (let y = 0; y < height; ++y) {
        statusUpdate(`Progress: ${Math.floor((y / height) * 100)}%`);

        for (let x = 0; x < width; ++x) {
            imageDataView[++imageDataIndex] = (x / width) * 255;
            imageDataView[++imageDataIndex] = ((width - x) / width) * 255;
            imageDataView[++imageDataIndex] = (y / height) * 255;
            imageDataView[++imageDataIndex] = 255;
        }

        // Spin for a while so we can see the progress
        for (let i = 0; i < 9_999_999; ++i);
    }
}
