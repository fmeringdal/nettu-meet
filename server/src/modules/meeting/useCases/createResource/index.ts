import { fileStorage } from '../../../../shared/services';
import { meetingRepo } from '../../repos';
import { CreateResourceController } from './CreateResourceController';
import { CreateResourceUseCase } from './CreateResourceUseCase';

const createResourceUseCase = new CreateResourceUseCase(meetingRepo, fileStorage);
const createResourceController = new CreateResourceController(createResourceUseCase);

export { createResourceUseCase, createResourceController };
