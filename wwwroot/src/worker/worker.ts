import { render as renderJs } from "../raytracer/rayTracer";
import Raytracer from "../raytracer_rust/main";
import type { WorkerRequest, WorkerUpdate } from "./workerMessageTypes";

declare const self: DedicatedWorkerGlobalScope;

const statusUpdate = (message: string) => {
    const update: WorkerUpdate = {
        message,
        completed: false
    };
    postMessage(update);
}

self.addEventListener('message', async (e: MessageEvent<WorkerRequest>) => {
    const startTime = performance.now();

    if (e.data.renderer === "js") {
        renderJs(e.data.width, e.data.height, e.data.data, statusUpdate);
    } else if (e.data.renderer === "wasm") {
        await Raytracer.init(e.data.width, e.data.height);
        const raytracer = new Raytracer(e.data.width, e.data.height);
        try {
            raytracer.render(e.data.data, statusUpdate);
        } finally {
            raytracer.dispose();
        }
    }

    const timeElapsed = performance.now() - startTime;
    const update: WorkerUpdate = {
        message: `Completed in ${Math.round(timeElapsed)}ms`,
        completed: true
    }
    postMessage(update);
});
