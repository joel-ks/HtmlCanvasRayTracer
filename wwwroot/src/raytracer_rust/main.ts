import init, { Renderer, type InitOutput } from "wasm-ray-tracer";

export default class Raytracer {
    #width: number;
    #height: number;
    #wasmRaytracer: Renderer;
    #disposed: boolean = false;
    
    constructor(width: number, height: number) {
        if (Raytracer.#wasmModule === null) throw new Error("Call Raytracer.init before constructing objects");

        this.#width = width;
        this.#height = height;
        this.#wasmRaytracer = Renderer.new(width, height);
    }

    render(sab: SharedArrayBuffer, statusUpdate: (msg: string) => void) {
        if (this.#disposed) throw new Error("Raytracer is already disposed");

        const output = new Uint8ClampedArray(sab);
        let i = -1;
        for (let y = this.#height-1; y >= 0; --y) {
            statusUpdate(`Progress: ${Math.floor(((this.#height - 1 - y) / this.#height) * 100)}%`);

            for (let x = 0; x < this.#width; ++x) {
                const p = this.#wasmRaytracer.render_pixel(x, y);
                output[++i] = p.r;
                output[++i] = p.g;
                output[++i] = p.b;
                output[++i] = p.a;
                p.free();
            }
        }
    }

    [Symbol.dispose]() {
        this.#wasmRaytracer.free();
        this.#disposed = true;
    }

    dispose() {
        this[Symbol.dispose]();
    }

    static #wasmModule: InitOutput | null = null;
    static async init(width: number, height: number) {
        if (this.#wasmModule == null) this.#wasmModule = await init();
    }
}
