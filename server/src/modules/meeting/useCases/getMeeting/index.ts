import { accountRepo } from '../../../account/repos';
import { meetingRepo } from '../../repos';
import { GetMeetingController } from './GetMeetingController';
import { GetMeetingUseCase } from './GetMeetingUseCase';

const getMeetingUseCase = new GetMeetingUseCase(meetingRepo, accountRepo);
const getMeetingController = new GetMeetingController(getMeetingUseCase);

export { getMeetingController };
