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
    render(e.data.width, e.data.height, e.data.data, statusUpdate);

    const update: WorkerUpdate = {
        message: "Done",
        completed: true
    }
    postMessage(update);
});
