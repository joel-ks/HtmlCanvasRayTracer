import type { WorkerRequest, WorkerUpdate } from "../workerTypes";

interface RayTracerApp {
    canvas: HTMLCanvasElement;
    info: HTMLSpanElement;
    renderButton: HTMLButtonElement;
}

let renderRunning = false;
const controls = findControls();

try {
    if (!window.isSecureContext) throw new Error("Must be running in a secure context. See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts");
    if (!window.crossOriginIsolated) throw new Error("Must be running in a cross-origin isolated context. See https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated");

    const ctx2d = controls.canvas.getContext("2d");
    if (!ctx2d) throw new Error("Could not get 2D rendering context from canvas");

    const renderWorker = createRenderWorker();

    controls.renderButton.addEventListener('click', () => render(ctx2d, renderWorker));
} catch (e) {
    if (e instanceof Error) {
        console.error(e);

        controls.renderButton.classList.add("hidden");
        controls.info.textContent = e.message;
    } else throw e;
}

function findControls(): RayTracerApp {

    return {
        canvas: document.getElementById("output") as HTMLCanvasElement,
        info: document.getElementById("info") as HTMLSpanElement,
        renderButton: document.getElementById("btn-render-wasm") as HTMLButtonElement
    };
}

function createRenderWorker(): Worker {
    if (!window.Worker) throw new Error("Web workers not supported in this browser");
    const renderWorker = new Worker("./js/worker/worker.js", { type: "module" });

    renderWorker.addEventListener('message', (e: MessageEvent<WorkerUpdate>) => {
        controls.info.textContent = e.data.message;
        renderRunning = !e.data.completed;
        controls.renderButton.disabled = !e.data.completed;
    });

    renderWorker.addEventListener('error', () => {
        controls.info.textContent = "An error occurred while rendering. Check the console for details.";
        renderRunning = false;
        controls.renderButton.disabled = false;
    });

    renderWorker.addEventListener('messageerror', (e) => console.error("Worker could not read message", e));

    return renderWorker;
}

function render(ctx2d: CanvasRenderingContext2D, renderWorker: Worker) {
    try {
        controls.renderButton.disabled = true;

        const width = controls.canvas.width, height = controls.canvas.height;
        const request: WorkerRequest = {
            width,
            height,
            data: new SharedArrayBuffer(width * height * 4)
        };

        renderWorker.postMessage(request);
        renderRunning = true;
        startUpdatingRenderView(new Uint8ClampedArray(request.data), width, height, ctx2d);
    } catch (e) {
        controls.renderButton.disabled = false;
        throw e;
    }
}

function startUpdatingRenderView(
    sabView: Uint8ClampedArray, width: number, height: number, ctx2d: CanvasRenderingContext2D
) {
    const imageData = ctx2d.createImageData(width, height);

    function updateRenderView() {
        imageData.data.set(sabView);
        ctx2d.putImageData(imageData, 0, 0);
        if (renderRunning) requestAnimationFrame(updateRenderView);
    };

    requestAnimationFrame(updateRenderView);
}
