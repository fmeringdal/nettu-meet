import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

export interface Canvas {
    canvasId: UniqueEntityID;
    meetingId: UniqueEntityID;
    data: string;
}
