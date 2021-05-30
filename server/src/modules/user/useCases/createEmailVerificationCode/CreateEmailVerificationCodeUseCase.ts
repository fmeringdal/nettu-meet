import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { IEmailService } from '../../../../shared/services/email/email';
import { EmailVerificationToken } from '../../domain/emailTokenVerification';
import { UserEmail } from '../../domain/userEmail';
import { IEmailTokenVerificationRepo } from '../../repos/emailTokenVerificationRepo';
import { CreateEmailVerificationCodeDTO } from './CreateEmailVerificationCodeDTO';
import { CreateEmailVerificationCodeErrors } from './CreateEmailVerificationCodeErrors';

type Response = Either<
    | CreateEmailVerificationCodeErrors.EmailBlacklistedError
    | CreateEmailVerificationCodeErrors.InvalidEmailError
    | AppError.UnexpectedError,
    Result<void>
>;

export class CreateEmailVerificationCodeUseCase implements UseCase<CreateEmailVerificationCodeDTO, Promise<Response>> {
    private emailTokenVerificationRepo: IEmailTokenVerificationRepo;
    private emailService: IEmailService;

    constructor(emailTokenVerificationRepo: IEmailTokenVerificationRepo, emailService: IEmailService) {
        this.emailTokenVerificationRepo = emailTokenVerificationRepo;
        this.emailService = emailService;
    }

    public async execute(request: CreateEmailVerificationCodeDTO): Promise<Response> {
        try {
            const emailOrErr = UserEmail.create(request.email);
            if (emailOrErr.isFailure) {
                return left(new CreateEmailVerificationCodeErrors.InvalidEmailError(request.email));
            }
            const isDisposableEmail = await this.emailService.isDisposable(request.email);
            if (isDisposableEmail) {
                return left(new CreateEmailVerificationCodeErrors.InvalidEmailError(request.email));
            }

            const existingEmailToken = await this.emailTokenVerificationRepo.getTokenByEmail(request.email);
            let code;
            if (existingEmailToken) {
                if (existingEmailToken.hasExceededErrorAttempts()) {
                    return left(new CreateEmailVerificationCodeErrors.EmailBlacklistedError(request.email));
                }
                existingEmailToken.renewExpiry();
                code = existingEmailToken.token;
                await this.emailTokenVerificationRepo.save(existingEmailToken);
            } else {
                const emailToken = EmailVerificationToken.create({
                    email: emailOrErr.getValue(),
                }).getValue();
                code = emailToken.token;
                await this.emailTokenVerificationRepo.insert(emailToken);
            }

            await this.emailService.sendEmailVerificationCode(request.email, {
                code,
            });

            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
