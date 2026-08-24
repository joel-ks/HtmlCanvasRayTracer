import Raytracer from "./raytracer";
import type { WorkerRequest, WorkerUpdate } from "../workerTypes";

self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => render(e.data));
await Raytracer.init();

const statusUpdate = (message: string) => {
    const update: WorkerUpdate = {
        message,
        completed: false
    };
    postMessage(update);
}

async function render(request: WorkerRequest) {
    const startTime = performance.now();

    await renderWasm(request.width, request.height, request.data, statusUpdate);

    const timeElapsed = performance.now() - startTime;
    const update: WorkerUpdate = {
        message: `Completed in ${Math.round(timeElapsed)}ms`,
        completed: true
    }
    postMessage(update);
}

async function renderWasm(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
    const raytracer = new Raytracer(width, height);
    try {
        raytracer.render(data, statusUpdate);
    } finally {
        raytracer.dispose();
    }
}
