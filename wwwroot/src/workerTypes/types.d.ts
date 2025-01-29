import type { rendererTypes } from "./rendererTypes";

export type RendererType = typeof rendererTypes[number];

export interface WorkerRequest {
    rendererType: RendererType;
    width: number;
    height: number;
    data: SharedArrayBuffer;
}

export interface WorkerUpdate {
    message: string;
    completed: boolean;
}
