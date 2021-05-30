import { meetingService } from "../services";
import { MeetingInteractor } from "./meetingInteractor";

const meetingInteractor = new MeetingInteractor(meetingService);

export { meetingInteractor };
