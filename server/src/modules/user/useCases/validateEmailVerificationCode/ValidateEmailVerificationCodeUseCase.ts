import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { EmailVerificationToken } from '../../domain/emailTokenVerification';
import { IEmailTokenVerificationRepo } from '../../repos/emailTokenVerificationRepo';
import { ValidateEmailVerificationCodeDTO } from './ValidateEmailVerificationCodeDTO';
import { ValidateEmailVerificationCodeErrors } from './ValidateEmailVerificationCodeErrors';

type Response = Either<
    ValidateEmailVerificationCodeErrors.InvalidEmailTokenError | AppError.UnexpectedError,
    EmailVerificationToken
>;

export class ValidateEmailVerificationCodeUseCase
    implements UseCase<ValidateEmailVerificationCodeDTO, Promise<Response>>
{
    private emailTokenRepo: IEmailTokenVerificationRepo;

    constructor(emailTokenRepo: IEmailTokenVerificationRepo) {
        this.emailTokenRepo = emailTokenRepo;
    }

    public async execute(request: ValidateEmailVerificationCodeDTO): Promise<Response> {
        try {
            const emailToken = await this.emailTokenRepo.getTokenByEmail(request.email);
            if (!emailToken || !emailToken.canBeConsumed()) {
                return left(new ValidateEmailVerificationCodeErrors.InvalidEmailTokenError());
            }
            if (!emailToken.isCodeValid(request.code)) {
                emailToken.incErrorAttempts();
                await this.emailTokenRepo.save(emailToken);
                return left(new ValidateEmailVerificationCodeErrors.InvalidEmailTokenError());
            }

            return right(emailToken);
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
