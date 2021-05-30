import { AppError } from '../../../../shared/core/AppError';
import { Either, left, right } from '../../../../shared/core/Result';
import { UseCase } from '../../../../shared/core/UseCase';
import { Account } from '../../domain/account';
import { IAccountRepo } from '../../repos/accountRepo';
import { CreateDefaultAccountDTO } from './CreateDefaultAccountDTO';
import { CreateDefaultAccountUseCaseErrors } from './CreateDefaultAccountErrors';

type Response = Either<CreateDefaultAccountUseCaseErrors.InvalidPropertyError | AppError.UnexpectedError, string>;

export class CreateDefaultAccountUseCase implements UseCase<CreateDefaultAccountDTO, Promise<Response>> {
    private accountRepo: IAccountRepo;

    constructor(accountRepo: IAccountRepo) {
        this.accountRepo = accountRepo;
    }

    public async execute(request: CreateDefaultAccountDTO): Promise<Response> {
        let account: Account | undefined;

        try {
            account = await this.accountRepo.getAccountByAccountName(request.name);
            if (account !== undefined) {
                return right('Account already created');
            }
            const accountWithKey = await this.accountRepo.getAccountBySecretKey(request.secretKey);
            if (accountWithKey !== undefined) {
                return right('Account already created');
            }
            const redirectURIs = new Set(
                request.redirectURIs ? [...request.redirectURIs, request.redirectURI] : [request.redirectURI],
            );

            const accountOrErr = Account.create({
                label: request.label,
                name: request.name,
                iconURL: request.iconURL,
                redirectURIs: [...redirectURIs],
                defaultRedirectURI: request.redirectURI,
            });

            if (accountOrErr.isFailure) {
                return left(new CreateDefaultAccountUseCaseErrors.InvalidPropertyError(accountOrErr.error as string));
            }
            account = accountOrErr.getValue();
            account.props.secretKey = request.secretKey;

            await this.accountRepo.insert(account);

            return right('Account created');
        } catch (err) {
            return left(new AppError.UnexpectedError(err.toString()));
        }
    }
}
