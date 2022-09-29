import { render } from "../rayTracer";
import { WorkerRequest, WorkerUpdate } from "./workerMessageTypes";

const statusUpdate = (message: string) => {
    const update: WorkerUpdate = {
        message,
        completed: false
    };
    postMessage(update);
}

onmessage = (e: MessageEvent<WorkerRequest>) => {
    render(e.data, statusUpdate);

    const update: WorkerUpdate = {
        message: "Done",
        completed: true
    }
    postMessage(update);
};
