import { Collection, Db } from 'mongodb';
import { UniqueEntityID } from '../../domain/UniqueEntityID';

export interface BaseRepoEntity {
    _id: UniqueEntityID;
    [key: string]: any;
}

export abstract class BaseRepo {
    protected db!: Db;
    protected collection!: Collection;

    constructor(db: Promise<Db>, collectionName: string) {
        db.then((_db) => {
            this.db = _db;
            this.collection = _db.collection(collectionName);
        });
    }
}
