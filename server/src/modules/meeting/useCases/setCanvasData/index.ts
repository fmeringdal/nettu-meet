import { canvasRepo } from '../../repos';
import { SetCanvasDataController } from './SetCanvasDataController';
import { SetCanvasDataUseCase } from './SetCanvasDataUseCase';

const setCanvasDataUseCase = new SetCanvasDataUseCase(canvasRepo);
const setCanvasDataController = new SetCanvasDataController(setCanvasDataUseCase);

export { setCanvasDataController };
