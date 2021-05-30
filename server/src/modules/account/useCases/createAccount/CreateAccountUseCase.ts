import { AppError } from '../../../../shared/core/AppError';
import { Either, left, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { IEmailTokenVerificationRepo } from '../../../user/repos/emailTokenVerificationRepo';
import { ValidateEmailVerificationCodeUseCase } from '../../../user/useCases/validateEmailVerificationCode/ValidateEmailVerificationCodeUseCase';
import { Account } from '../../domain/account';
import { IAccountRepo } from '../../repos/accountRepo';
import { CreateAccountDTO, CreateAccountResponseDTO } from './CreateAccountDTO';
import { CreateAccountUseCaseErrors } from './CreateAccountErrors';

type Response = Either<
    | CreateAccountUseCaseErrors.AccountNameAlreadyInUseError
    | CreateAccountUseCaseErrors.InvalidPropertyError
    | CreateAccountUseCaseErrors.InvalidEmailTokenError
    | AppError.UnexpectedError,
    CreateAccountResponseDTO
>;

export class CreateAccountUseCase implements UseCase<CreateAccountDTO, Promise<Response>> {
    private emailVerificationUseCase: ValidateEmailVerificationCodeUseCase;
    private accountRepo: IAccountRepo;
    private emailTokenRepo: IEmailTokenVerificationRepo;

    constructor(
        emailVerificationUseCase: ValidateEmailVerificationCodeUseCase,
        accountRepo: IAccountRepo,
        emailTokenRepo: IEmailTokenVerificationRepo,
    ) {
        this.emailVerificationUseCase = emailVerificationUseCase;
        this.accountRepo = accountRepo;
        this.emailTokenRepo = emailTokenRepo;
    }

    public async execute(request: CreateAccountDTO): Promise<Response> {
        let account: Account | undefined;

        try {
            const validatedOrErr = await this.emailVerificationUseCase.execute({
                code: request.emailToken.code,
                email: request.emailToken.email,
            });
            if (validatedOrErr.isLeft()) {
                return left(new CreateAccountUseCaseErrors.InvalidEmailTokenError());
            }
            const emailToken = validatedOrErr.value;

            account = await this.accountRepo.getAccountByAccountName(request.name);
            if (account !== undefined) {
                return left(new CreateAccountUseCaseErrors.AccountNameAlreadyInUseError(request.name));
            }

            const accountOrErr = Account.create({
                label: request.label,
                name: request.name,
                redirectURIs: typeof request.redirectURIs == 'object' ? request.redirectURIs : [],
                defaultRedirectURI: request.defaultRedirectURI,
            });

            if (accountOrErr.isFailure) {
                return left(new CreateAccountUseCaseErrors.InvalidPropertyError(accountOrErr.error as string));
            }
            account = accountOrErr.getValue();

            await this.accountRepo.insert(account);
            await this.emailTokenRepo.deleteByTokenId(emailToken.tokenId);

            return right({
                secretKey: account.secretKey!,
            });
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
