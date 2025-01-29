import type { RendererType, WorkerRequest, WorkerUpdate } from "../workerTypes";
import { rendererTypes } from "../workerTypes";

interface RayTracerApp {
    canvas: HTMLCanvasElement;
    info: HTMLSpanElement;
    form: {
        renderButtons: Partial<Record<RendererType, HTMLButtonElement>>;
    }
}

let renderRunning = false;
const controls = findControls();

try {
    if (!window.isSecureContext) throw new Error("Must be running in a secure context. See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts");
    if (!window.crossOriginIsolated) throw new Error("Must be running in a cross-origin isolated context. See https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated");

    const ctx2d = controls.canvas.getContext("2d");
    if (!ctx2d) throw new Error("Could not get 2D rendering context from canvas");

    const renderWorker = createRenderWorker();

    for (const [rendererType, btn] of (Object.entries(controls.form.renderButtons) as Array<[RendererType, HTMLButtonElement]>)) {
        btn.addEventListener('click', () => render(rendererType, ctx2d, renderWorker));
    }
} catch (e) {
    if (e instanceof Error) {
        console.error(e);

        Object.values(controls.form.renderButtons).forEach(btn => btn.classList.add("hidden"));
        controls.info.textContent = e.message;
    } else throw e;
}

function findControls(): RayTracerApp {

    return {
        canvas: document.getElementById("output") as HTMLCanvasElement,
        info: document.getElementById("info") as HTMLSpanElement,
        form: {
            renderButtons: Object.fromEntries(
                rendererTypes.map(rt => [rt, document.getElementById(`btn-render-${rt}`) as HTMLButtonElement])
            )
        }
    };
}

function createRenderWorker(): Worker {
    if (!window.Worker) throw new Error("Web workers not supported in this browser");
    const renderWorker = new Worker("./js/worker/worker.js", { type: "module" });

    renderWorker.addEventListener('message', (e: MessageEvent<WorkerUpdate>) => {
        controls.info.textContent = e.data.message;
        renderRunning = !e.data.completed;
        Object.values(controls.form.renderButtons).forEach(btn => btn.disabled = !e.data.completed);
    });

    renderWorker.addEventListener('error', () => {
        controls.info.textContent = "An error occurred while rendering. Check the console for details.";
        renderRunning = false;
        Object.values(controls.form.renderButtons).forEach(btn => btn.disabled = false);
    });

    renderWorker.addEventListener('messageerror', (e) => console.error("Worker could not read message", e));

    return renderWorker;
}

function render(rendererType: RendererType, ctx2d: CanvasRenderingContext2D, renderWorker: Worker) {
    try {
        Object.values(controls.form.renderButtons).forEach(btn => btn.disabled = true);

        const width = controls.canvas.width, height = controls.canvas.height;
        const request: WorkerRequest = {
            rendererType,
            width,
            height,
            data: new SharedArrayBuffer(width * height * 4)
        };

        renderWorker.postMessage(request);
        renderRunning = true;
        startUpdatingRenderView(new Uint8ClampedArray(request.data), width, height, ctx2d);
    } catch (e) {
        Object.values(controls.form.renderButtons).forEach(btn => btn.disabled = false);
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
