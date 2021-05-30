import { io } from '../../../../shared/infra/http/app';
import { canvasRepo, meetingRepo } from '../../repos';
import { CreateCanvasController } from './CreateCanvasController';
import { CreateCanvasUseCase } from './CreateCanvasUseCase';

const createCanvasUseCase = new CreateCanvasUseCase(meetingRepo, canvasRepo);
const createCanvasController = new CreateCanvasController(createCanvasUseCase);

export { createCanvasUseCase, createCanvasController };
