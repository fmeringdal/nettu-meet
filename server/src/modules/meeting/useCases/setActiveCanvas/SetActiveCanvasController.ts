import { Socket } from 'socket.io';
import { BaseWSController } from '../../../../shared/infra/http/models/BaseWSController';
import { payloadSchema } from '../../../chat/useCases/sendChatMessage/SendChatMessageDTO';
import { SetActiveCanvasDTO } from './SetActiveCanvasDTO';
import { SetActiveCanvasUseCase } from './SetActiveCanvasUseCase';
import {logger} from "../../../../logger"

export class SetActiveCanvasController extends BaseWSController {
    private useCase: SetActiveCanvasUseCase;

    constructor(useCase: SetActiveCanvasUseCase) {
        super(payloadSchema);
        this.useCase = useCase;
    }

    async executeImpl(socket: Socket, dto: SetActiveCanvasDTO): Promise<any> {
        try {
            // Just passing forward
            // TODO: Make a canvas service
            socket.to(dto.meetingId).emit('active-canvas-change', {
                meetingId: dto.meetingId,
                canvasId: dto.canvasId,
            });

            await this.useCase.execute(dto);
        } catch (err) {
            logger.error({error : err}, err);
        }
    }
}
