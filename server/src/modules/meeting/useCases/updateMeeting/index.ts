import { meetingRepo } from '../../repos';
import { UpdateMeetingController } from './UpdateMeetingController';
import { UpdateMeetingUseCase } from './UpdateMeetingUseCase';

const updateMeetingUseCase = new UpdateMeetingUseCase(meetingRepo);
const updateMeetingController = new UpdateMeetingController(updateMeetingUseCase);

export { updateMeetingController };
