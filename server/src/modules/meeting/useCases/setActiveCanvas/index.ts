import { meetingRepo } from '../../repos';
import { SetActiveCanvasController } from './SetActiveCanvasController';
import { SetActiveCanvasUseCase } from './SetActiveCanvasUseCase';

const setActiveCanvasUseCase = new SetActiveCanvasUseCase(meetingRepo);
const setActiveCanvasController = new SetActiveCanvasController(setActiveCanvasUseCase);

export { setActiveCanvasController };
