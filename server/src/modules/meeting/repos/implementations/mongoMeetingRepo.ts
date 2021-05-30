import { BaseRepo } from '../../../../shared/infra/db/BaseRepo';
import { _db_connect_promise } from '../../../../shared/infra/db/connection';
import { Meeting } from '../../domain/meeting';
import { MeetingMap } from '../../mappers/meetingMap';
import { IMeetingRepo } from '../meetingRepo';

export class MongoMeetingRepo extends BaseRepo implements IMeetingRepo {
    constructor() {
        super(_db_connect_promise, 'meetings');
    }

    async getMeetingByMeetingId(id: string): Promise<Meeting | undefined> {
        const meeting = await this.collection.findOne({
            _id: id,
        });
        return meeting ? MeetingMap.toDomain(meeting) : undefined;
    }

    async deleteMeetingByMeetingId(id: string): Promise<void> {
        await this.collection.findOneAndDelete({
            _id: id,
        });
    }

    async setMeetingActiveCanvas(id: string, canvasId: string): Promise<void> {
        // This also validates that canvasId is among the canvasIds
        await this.collection.updateOne({ _id: id, canvasIds: canvasId }, { $set: { activeCanvasId: canvasId } });
    }

    async insert(meeting: Meeting): Promise<void> {
        const raw = MeetingMap.toPersistence(meeting);
        await this.collection.insertOne(raw);
    }

    async save(meeting: Meeting): Promise<void> {
        const raw = MeetingMap.toPersistence(meeting);
        await this.collection.updateOne({ _id: raw._id }, { $set: { ...raw } });
    }
}
