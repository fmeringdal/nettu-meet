import { meetingRepo } from '../../repos';
import { DeleteMeetingController } from './DeleteMeetingController';
import { DeleteMeetingUseCase } from './DeleteMeetingUseCase';

const deleteMeetingUseCase = new DeleteMeetingUseCase(meetingRepo);
const deleteMeetingController = new DeleteMeetingController(deleteMeetingUseCase);

export { deleteMeetingController };
