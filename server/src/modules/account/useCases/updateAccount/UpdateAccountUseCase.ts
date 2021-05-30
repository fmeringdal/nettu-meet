import { AppError } from '../../../../shared/core/AppError';
import { Either, left, Result, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Account } from '../../domain/account';
import { IAccountRepo } from '../../repos/accountRepo';
import { UpdateAccountDTO } from './UpdateAccountDTO';
import { UpdateAccountUseCaseErrors } from './UpdateAccountErrors';

type Response = Either<
    | UpdateAccountUseCaseErrors.AccountNameAlreadyInUseError
    | UpdateAccountUseCaseErrors.InvalidPropertyError
    | AppError.UnexpectedError,
    Result<void>
>;

export class UpdateAccountUseCase implements UseCase<UpdateAccountDTO, Promise<Response>> {
    private accountRepo: IAccountRepo;

    constructor(accountRepo: IAccountRepo) {
        this.accountRepo = accountRepo;
    }

    public async execute(request: UpdateAccountDTO): Promise<Response> {
        try {
            let account = request.account;

            if (request.name && account.name !== request.name) {
                const existingAccountWithName = await this.accountRepo.getAccountByAccountName(request.name);
                if (existingAccountWithName !== undefined) {
                    return left(new UpdateAccountUseCaseErrors.AccountNameAlreadyInUseError(request.name));
                }
            }

            const accountOrErr = Account.create(
                {
                    ...account.props,
                    ...request,
                },
                account.accountId,
            );

            if (accountOrErr.isFailure) {
                return left(new UpdateAccountUseCaseErrors.InvalidPropertyError(accountOrErr.error as string));
            }
            account = accountOrErr.getValue();

            await this.accountRepo.save(account);

            return right(Result.ok());
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
