import { WorkerRequest, WorkerUpdate } from "../worker/workerMessageTypes";

const canvas = document.getElementById("output") as HTMLCanvasElement;
const btnRender = document.getElementById("btn-render") as HTMLButtonElement;
const info = document.getElementById("info") as HTMLSpanElement;

let renderRunning = false;

onload = function () {
    if (!isSecureContext) throw new Error("Must be running in a secure context. See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts");
    if (!crossOriginIsolated) throw new Error("Must be running in a cross-origin isolated context. See https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated");

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {
        btnRender.disabled = true;
        info.textContent = "Could not get 2D rendering context from canvas";
        return;
    }

    if (!window.Worker) {
        btnRender.disabled = true;
        info.textContent = "Web workers not supported in this browser";
        return;
    }

    // Worker { type: "module" } isn't yet supported in Firefox - https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
    const renderWorker = new Worker("./js/worker/worker.js", { type: "module" });

    renderWorker.addEventListener('message', (e: MessageEvent<WorkerUpdate>) => {
        if (info) info.textContent = e.data.message;
        renderRunning = !e.data.completed;
        btnRender.disabled = !e.data.completed;
    });

    renderWorker.addEventListener('error', () => {
        if (info) info.textContent = "An error occurred while rendering. Check the console for details.";
        renderRunning = false;
        btnRender.disabled = false;
    });

    btnRender.addEventListener('click', () => {
        try {
            btnRender.disabled = true;

            const width = canvas.width, height = canvas.height;
            const request: WorkerRequest = {
                width,
                height,
                data: new SharedArrayBuffer(width * height * 4)
            };

            renderWorker.postMessage(request);
            renderRunning = true;
            startUpdatingRenderView(new Uint8ClampedArray(request.data), width, height, ctx2d);
        } catch (e) {
            btnRender.disabled = false;
            throw e;
        }
    });
};

function startUpdatingRenderView(sabView: Uint8ClampedArray, width: number, height: number, ctx2d: CanvasRenderingContext2D) {
    const imageData = ctx2d.createImageData(width, height);
    const updateRenderView = () => {
        imageData.data.set(sabView);
        ctx2d.putImageData(imageData, 0, 0);
        if (renderRunning) requestAnimationFrame(updateRenderView);
    };

    requestAnimationFrame(updateRenderView);
}
