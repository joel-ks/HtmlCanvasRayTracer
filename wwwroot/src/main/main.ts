import type { WorkerRequest, WorkerUpdate } from "../worker/workerMessageTypes";

const canvas = document.getElementById("output") as HTMLCanvasElement;
const btnRenderJs = document.getElementById("btn-render-js") as HTMLButtonElement;
const btnRenderWasm = document.getElementById("btn-render-wasm") as HTMLButtonElement;
const info = document.getElementById("info") as HTMLSpanElement;

let renderRunning = false;
start();

async function start() {
    console.log("Starting app...");

    if (!isSecureContext) throw new Error("Must be running in a secure context. See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts");
    if (!crossOriginIsolated) throw new Error("Must be running in a cross-origin isolated context. See https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated");

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {
        btnRenderJs.disabled = true;
        btnRenderWasm.disabled = true;
        info.textContent = "Could not get 2D rendering context from canvas";
        return;
    }

    if (!window.Worker) {
        btnRenderJs.disabled = true;
        btnRenderWasm.disabled = true;
        info.textContent = "Web workers not supported in this browser";
        return;
    }

    const renderWorker = new Worker("./js/worker/worker.js", { type: "module" });

    renderWorker.addEventListener('message', (e: MessageEvent<WorkerUpdate>) => {
        if (info) info.textContent = e.data.message;
        renderRunning = !e.data.completed;
        btnRenderJs.disabled = !e.data.completed;
        btnRenderWasm.disabled = !e.data.completed;
    });

    renderWorker.addEventListener('error', () => {
        if (info) info.textContent = "An error occurred while rendering. Check the console for details.";
        renderRunning = false;
        btnRenderJs.disabled = false;
        btnRenderWasm.disabled = false;
    });

    btnRenderJs.addEventListener('click', () => render("js", ctx2d, renderWorker));
    btnRenderWasm.addEventListener('click', () => render("wasm", ctx2d, renderWorker));
};

function render(renderer: "js" | "wasm", ctx2d: CanvasRenderingContext2D, renderWorker: Worker) {
    try {
        btnRenderJs.disabled = true;
        btnRenderWasm.disabled = true;

        const width = canvas.width, height = canvas.height;
        const request: WorkerRequest = {
            renderer,
            width,
            height,
            data: new SharedArrayBuffer(width * height * 4)
        };

        renderWorker.postMessage(request);
        renderRunning = true;
        startUpdatingRenderView(new Uint8ClampedArray(request.data), width, height, ctx2d);
    } catch (e) {
        btnRenderJs.disabled = false;
        btnRenderWasm.disabled = false;
        throw e;
    }
}

function startUpdatingRenderView(sabView: Uint8ClampedArray, width: number, height: number, ctx2d: CanvasRenderingContext2D) {
    const imageData = ctx2d.createImageData(width, height);
    const updateRenderView = () => {
        imageData.data.set(sabView);
        ctx2d.putImageData(imageData, 0, 0);
        if (renderRunning) requestAnimationFrame(updateRenderView);
    };

    requestAnimationFrame(updateRenderView);
}
