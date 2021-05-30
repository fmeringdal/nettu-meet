import { Meeting } from '../domain/meeting';

export interface IMeetingRepo {
    getMeetingByMeetingId(id: string): Promise<Meeting | undefined>;
    setMeetingActiveCanvas(id: string, canvasId: string): Promise<void>;
    deleteMeetingByMeetingId(id: string): Promise<void>;
    insert(meeting: Meeting): Promise<void>;
    save(meeting: Meeting): Promise<void>;
}
