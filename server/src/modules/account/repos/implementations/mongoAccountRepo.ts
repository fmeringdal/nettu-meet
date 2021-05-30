import { BaseRepo } from '../../../../shared/infra/db/BaseRepo';
import { _db_connect_promise } from '../../../../shared/infra/db/connection';
import { Account } from '../../domain/account';
import { AccountMap } from '../../mappers/accountMap';
import { IAccountRepo } from '../accountRepo';

export class MongoAccountRepo extends BaseRepo implements IAccountRepo {
    constructor() {
        super(_db_connect_promise, 'accounts');
    }

    async getAccountByAccountId(id: string): Promise<Account | undefined> {
        const account = await this.collection.findOne({
            _id: id,
        });
        return account ? AccountMap.toDomain(account) : undefined;
    }

    async getAccountByAccountName(name: string): Promise<Account | undefined> {
        const account = await this.collection.findOne({
            name,
        });
        return account ? AccountMap.toDomain(account) : undefined;
    }

    async getAccountBySecretKey(key: string): Promise<Account | undefined> {
        const account = await this.collection.findOne({
            secretKey: key,
        });
        return account ? AccountMap.toDomain(account) : undefined;
    }

    async insert(account: Account): Promise<void> {
        const raw = AccountMap.toPersistence(account);
        await this.collection.insertOne(raw);
    }

    async save(account: Account): Promise<void> {
        const raw = AccountMap.toPersistence(account);
        await this.collection.updateOne({ _id: raw._id }, { $set: { ...raw } });
    }
}
