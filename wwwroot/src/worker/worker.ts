import { render as renderJs } from "../raytracer";
import Raytracer from "../raytracer_rust";
import type { WorkerRequest, WorkerUpdate } from "../workerTypes";

self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => render(e.data));

const statusUpdate = (message: string) => {
    const update: WorkerUpdate = {
        message,
        completed: false
    };
    postMessage(update);
}

async function render(request: WorkerRequest) {
    const startTime = performance.now();

    if (request.rendererType === "js") renderJs(request.width, request.height, request.data, statusUpdate);
    else if (request.rendererType === "wasm") await renderWasm(request.width, request.height, request.data, statusUpdate);

    const timeElapsed = performance.now() - startTime;
    const update: WorkerUpdate = {
        message: `Completed in ${Math.round(timeElapsed)}ms`,
        completed: true
    }
    postMessage(update);
}

async function renderWasm(width: number, height: number, data: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
    await Raytracer.init(); // Can call every time as it's a no-op after the first call

    const raytracer = new Raytracer(width, height);
    try {
        raytracer.render(data, statusUpdate);
    } finally {
        raytracer.dispose();
    }
}
