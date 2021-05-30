import { v4 as uuid } from 'uuid';
import { Identifier } from './Identifier';

const isUUID = (uuid: string): boolean => {
    return uuid.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') != null;
};

export class UniqueEntityID extends Identifier<string> {
    constructor(id?: string) {
        super(id ? id : uuid());
    }

    static createFromString(id: string) {
        if (!UniqueEntityID.isValid(id)) {
            throw new Error('Invalid entity id provided: ' + id);
        }
        return new UniqueEntityID(id);
    }

    static isValid(id: any) {
        if (typeof id === 'string') {
            return isUUID(id);
        } else if (id instanceof UniqueEntityID) {
            return true;
        }
        return false;
    }
}
