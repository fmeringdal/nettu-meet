import { Account } from '../domain/account';

export interface IAccountRepo {
    getAccountByAccountId(id: string): Promise<Account | undefined>;
    getAccountByAccountName(name: string): Promise<Account | undefined>;
    getAccountBySecretKey(key: string): Promise<Account | undefined>;
    insert(account: Account): Promise<void>;
    save(account: Account): Promise<void>;
}
