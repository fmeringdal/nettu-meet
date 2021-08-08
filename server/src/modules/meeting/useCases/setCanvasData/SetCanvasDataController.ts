import { Socket } from 'socket.io';
import { BaseWSController } from '../../../../shared/infra/http/models/BaseWSController';
import { PayloadSchema, SetCanvasDataDTO, payloadSchema } from './SetCanvasDataDTO';
import { SetCanvasDataUseCase } from './SetCanvasDataUseCase';
import {logger} from "../../../../logger"

export class SetCanvasDataController extends BaseWSController {
    private useCase: SetCanvasDataUseCase;

    constructor(useCase: SetCanvasDataUseCase) {
        super(payloadSchema);
        this.useCase = useCase;
    }

    async executeImpl(socket: Socket, req: PayloadSchema): Promise<void> {
        const dto: SetCanvasDataDTO = {
            meetingId: req.meetingId,
            canvasId: req.canvasId,
            canvasJSON: req.event.canvasJSON,
        };

        try {
            // Just passing forward
            // TODO: Make a canvas service
            socket.to(dto.meetingId).emit('canvas-update', {
                meetingId: dto.meetingId,
                canvasId: dto.canvasId,
                event: {
                    action: req.event.action,
                    actionData: req.event.actionData,
                },
            });

            const result = await this.useCase.execute(dto);

            //   if (result.isLeft()) {
            //     const error = result.value;

            //     switch (error.constructor) {
            //       case SetCanvasDataUseCaseErrors.InvalidPropertyError:
            //         return this.forbidden(res, error.errorValue().message);
            //       default:
            //         const e = error.errorValue();
            //         return this.fail(res, typeof e === "string" ? e : e.message);
            //     }
            //   } else {
            //     const dto: SetCanvasDataResponseDTO = result.value;
            //     return this.created<SetCanvasDataResponseDTO>(res, dto);
            //   }
        } catch (err) {
            //   return this.fail(res, err)o
            logger.error({error : err}, err);
        }
    }
}
