import { accountRepo } from '../../../account/repos';
import { createMeetingUseCase } from '../createMeeting';
import { CreateDemoMeetingController } from './CreateDemoMeetingController';
import { CreateDemoMeetingUseCase } from './CreateDemoMeetingUseCase';

const createDemoMeetingUseCase = new CreateDemoMeetingUseCase(createMeetingUseCase, accountRepo);
const createDemoMeetingController = new CreateDemoMeetingController(createDemoMeetingUseCase);

export { createDemoMeetingController };
