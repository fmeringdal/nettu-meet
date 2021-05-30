import { fileStorage } from '../../../../shared/services';
import { meetingRepo } from '../../repos';
import { DeleteResourceController } from './DeleteResourceController';
import { DeleteResourceUseCase } from './DeleteResourceUseCase';

const deleteResourceUseCase = new DeleteResourceUseCase(meetingRepo, fileStorage);
const deleteResourceController = new DeleteResourceController(deleteResourceUseCase);

export { deleteResourceUseCase, deleteResourceController };
