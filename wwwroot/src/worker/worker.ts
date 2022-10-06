import { render } from "../raytracer/rayTracer";
import { WorkerRequest, WorkerUpdate } from "./workerMessageTypes";

declare const self: DedicatedWorkerGlobalScope;

const statusUpdate = (message: string) => {
    const update: WorkerUpdate = {
        message,
        completed: false
    };
    postMessage(update);
}

self.addEventListener('message', (e: MessageEvent<WorkerRequest>) => {
    const startTime = performance.now();
    render(e.data.width, e.data.height, e.data.data, statusUpdate);

    const timeElapsed = performance.now() - startTime;
    const update: WorkerUpdate = {
        message: `Completed in ${Math.round(timeElapsed)}ms`,
        completed: true
    }
    postMessage(update);
});
