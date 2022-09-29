export interface WorkerRequest {
    width: number;
    height: number;
    data: SharedArrayBuffer;
}

export interface WorkerUpdate {
    message: string;
    completed: boolean;
}
