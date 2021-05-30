import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Canvas } from '../domain/canvas';
import { CanvasDTO } from '../dtos/canvasDTO';

interface CanvasPersistenceRaw {
    _id: string;
    meetingId: string;
    data: string;
}

export class CanvasMap {
    public static toDTO(canvas: Canvas): CanvasDTO {
        return {
            id: canvas.canvasId.toString(),
            data: canvas.data,
        };
    }

    public static toDomain(raw: CanvasPersistenceRaw): Canvas {
        return {
            canvasId: new UniqueEntityID(raw._id),
            meetingId: UniqueEntityID.createFromString(raw.meetingId),
            data: raw.data,
        };
    }

    public static toPersistence(canvas: Canvas): CanvasPersistenceRaw {
        return {
            _id: canvas.canvasId.toValue(),
            meetingId: canvas.meetingId.toString(),
            data: canvas.data,
        };
    }
}
