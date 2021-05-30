import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { EmailVerificationToken } from '../domain/emailTokenVerification';

export interface IEmailTokenVerificationRepo {
    getTokenByEmail(email: string): Promise<EmailVerificationToken | undefined>;
    insert(emailTokenVerification: EmailVerificationToken): Promise<void>;
    save(emailTokenVerification: EmailVerificationToken): Promise<void>;
    deleteByTokenId(tokenId: UniqueEntityID): Promise<void>;
}
