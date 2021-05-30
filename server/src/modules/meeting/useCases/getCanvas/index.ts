import { canvasRepo } from '../../repos';
import { GetCanvasController } from './GetCanvasController';
import { GetCanvasUseCase } from './GetCanvasUseCase';

const getCanvasUseCase = new GetCanvasUseCase(canvasRepo);
const getCanvasController = new GetCanvasController(getCanvasUseCase);

export { getCanvasController };
