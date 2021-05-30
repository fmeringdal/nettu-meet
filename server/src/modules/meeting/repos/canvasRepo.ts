import { Canvas } from '../domain/canvas';

export interface ICanvasRepo {
    getCanvasByCanvasId(id: string): Promise<Canvas | undefined>;
    setCanvasData(id: string, meetingId: string, data: string): Promise<void>;
    insert(canvas: Canvas): Promise<void>;
    save(canvas: Canvas): Promise<void>;
}
