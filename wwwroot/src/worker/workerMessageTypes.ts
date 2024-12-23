export interface WorkerRequest {
    renderer: "js" | "wasm";
    width: number;
    height: number;
    data: SharedArrayBuffer;
}

export interface WorkerUpdate {
    message: string;
    completed: boolean;
}
