import { chatRepo } from '../../../chat/repos';
import { canvasRepo, meetingRepo } from '../../repos';
import { CreateMeetingController } from './CreateMeetingController';
import { CreateMeetingUseCase } from './CreateMeetingUseCase';

const createMeetingUseCase = new CreateMeetingUseCase(meetingRepo, canvasRepo, chatRepo);
const createMeetingController = new CreateMeetingController(createMeetingUseCase);

export { createMeetingUseCase, createMeetingController };
