import { Result } from '../../../shared/core/Result';
import { Entity } from '../../../shared/domain/Entity';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { UserEmail } from './userEmail';

interface IEmailTokenProps {
    token: string;
    expiry: Date;
    errorAttempts: number;
    email: UserEmail;
}

export class EmailVerificationToken extends Entity<IEmailTokenProps> {
    private static numberDigits = 6;
    private static tokenExpiryHours = 6;
    private static maxErrorAttempts = 10;

    get tokenId(): UniqueEntityID {
        return this._id;
    }

    get token(): string {
        return this.props.token;
    }

    get expiry(): Date {
        return this.props.expiry;
    }

    get errorAttempts(): number {
        return this.props.errorAttempts;
    }

    get email(): UserEmail {
        return this.props.email;
    }

    public isCodeExpired(): boolean {
        const date = new Date();
        return date > this.expiry;
    }

    public isCodeValid(code: string): boolean {
        return this.token.toUpperCase() === code.toUpperCase() && !this.isCodeExpired();
    }

    public hasExceededErrorAttempts(): boolean {
        return this.errorAttempts >= EmailVerificationToken.maxErrorAttempts;
    }

    public incErrorAttempts(): void {
        this.props.errorAttempts += 1;
    }

    public renewExpiry(): void {
        this.props.expiry = EmailVerificationToken.createExpiry();
    }

    public canBeConsumed(): boolean {
        return !this.hasExceededErrorAttempts() && !this.isCodeExpired();
    }

    private static createExpiry(): Date {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + this.tokenExpiryHours);
        return expiry;
    }

    private constructor(props: IEmailTokenProps, id?: UniqueEntityID) {
        super(props, id);
    }

    public static create(props: Partial<IEmailTokenProps>, id?: UniqueEntityID): Result<EmailVerificationToken> {
        if (!props.email) {
            return Result.fail('Cannot create email verification code when email is empty');
        }

        let token = props.token;
        let expiry = props.expiry;
        const email = props.email;
        const errorAttempts = props.errorAttempts || 0;
        if (!token) {
            // create random 6 character token
            const chars = '0123456789';
            token = '';
            for (let i = this.numberDigits; i > 0; --i) {
                token += chars[Math.round(Math.random() * (chars.length - 1))];
            }
        }
        if (!expiry) {
            // create expiration date
            expiry = this.createExpiry();
        }

        return Result.ok<EmailVerificationToken>(
            new EmailVerificationToken(
                {
                    token,
                    expiry,
                    errorAttempts,
                    email,
                },
                id,
            ),
        );
    }
}
