import { MongoCanvasRepo } from './implementations/mongoCanvasRepo';
import { MongoMeetingRepo } from './implementations/mongoMeetingRepo';

const meetingRepo = new MongoMeetingRepo();
const canvasRepo = new MongoCanvasRepo();

export { meetingRepo, canvasRepo };
