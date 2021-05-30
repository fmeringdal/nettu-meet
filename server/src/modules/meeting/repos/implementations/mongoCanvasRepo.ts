import { BaseRepo } from '../../../../shared/infra/db/BaseRepo';
import { _db_connect_promise } from '../../../../shared/infra/db/connection';
import { Canvas } from '../../domain/canvas';
import { CanvasMap } from '../../mappers/canvasMap';
import { ICanvasRepo } from '../canvasRepo';

export class MongoCanvasRepo extends BaseRepo implements ICanvasRepo {
    constructor() {
        super(_db_connect_promise, 'canvas');
    }

    async setCanvasData(id: string, meetingId: string, data: string): Promise<void> {
        await this.collection.updateOne({ _id: id, meetingId }, { $set: { data } });
    }

    async getCanvasByCanvasId(id: string): Promise<Canvas | undefined> {
        const canvas = await this.collection.findOne({
            _id: id,
        });
        return canvas ? CanvasMap.toDomain(canvas) : undefined;
    }

    async insert(canvas: Canvas): Promise<void> {
        const raw = CanvasMap.toPersistence(canvas);
        await this.collection.insertOne(raw);
    }

    async save(canvas: Canvas): Promise<void> {
        const raw = CanvasMap.toPersistence(canvas);
        await this.collection.updateOne({ _id: raw._id }, { $set: { ...raw } });
    }
}
