import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { EmailVerificationToken } from '../domain/emailTokenVerification';
import { UserEmail } from '../domain/userEmail';

interface EmailVerificationTokenPersistenceRaw {
    _id: string;
    token: string;
    expiry: number;
    errorAttempts: number;
    email: string;
}

export class EmailVerificationTokenMap {
    public static toDomain(raw: EmailVerificationTokenPersistenceRaw): EmailVerificationToken {
        return EmailVerificationToken.create(
            {
                token: raw.token,
                expiry: new Date(raw.expiry),
                errorAttempts: raw.errorAttempts,
                email: UserEmail.create(raw.email).getValue(),
            },
            new UniqueEntityID(raw._id),
        ).getValue();
    }

    public static toPersistence(token: EmailVerificationToken): EmailVerificationTokenPersistenceRaw {
        return {
            _id: token.tokenId.toValue(),
            token: token.token,
            expiry: token.expiry.valueOf(),
            errorAttempts: token.errorAttempts,
            email: token.email.value,
        };
    }
}
