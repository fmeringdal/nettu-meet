import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { BaseRepo } from '../../../../shared/infra/db/BaseRepo';
import { _db_connect_promise } from '../../../../shared/infra/db/connection';
import { EmailVerificationToken } from '../../domain/emailTokenVerification';
import { EmailVerificationTokenMap } from '../../mappers/emailVerificationTokenMap';
import { IEmailTokenVerificationRepo } from '../emailTokenVerificationRepo';

export class MongoEmailTokenVerificationRepoRepo extends BaseRepo implements IEmailTokenVerificationRepo {
    constructor() {
        super(_db_connect_promise, 'emailTokens');
    }

    async getTokenByEmail(email: string): Promise<EmailVerificationToken | undefined> {
        const emailToken = await this.collection.findOne({
            email,
        });
        return emailToken ? EmailVerificationTokenMap.toDomain(emailToken) : undefined;
    }

    async insert(emailTokenVerification: EmailVerificationToken): Promise<void> {
        const raw = EmailVerificationTokenMap.toPersistence(emailTokenVerification);
        await this.collection.insertOne(raw);
    }

    async save(emailTokenVerification: EmailVerificationToken): Promise<void> {
        const raw = EmailVerificationTokenMap.toPersistence(emailTokenVerification);
        await this.collection.updateOne({ _id: raw._id }, { $set: { ...raw } });
    }

    async deleteByTokenId(tokenId: UniqueEntityID): Promise<void> {
        await this.collection.deleteOne({ _id: tokenId.toValue() });
    }
}
