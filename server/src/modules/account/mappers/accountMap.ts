import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Account } from '../domain/account';
import { AccountDTO } from '../dtos/accountDTO';

interface AccountPersistenceRaw {
    _id: string;
    name: string;
    label: string;
    secretKey: string;
    iconURL?: string;
    redirectURIs: string[];
    defaultRedirectURI?: string;
}

export class AccountMap {
    public static toDTO(account: Account): AccountDTO {
        return {
            id: account.accountId.toString(),
            label: account.label,
            name: account.name,
            iconURL: account.iconURL,
            redirectURIs: account.redirectURIs,
            defaultRedirectURI: account.defaultRedirectURI,
        };
    }

    public static toDomain(raw: AccountPersistenceRaw): Account {
        return Account.create(
            {
                label: raw.label,
                name: raw.name,
                iconURL: raw.iconURL,
                secretKey: raw.secretKey,
                redirectURIs: raw.redirectURIs,
                defaultRedirectURI: raw.defaultRedirectURI,
            },
            new UniqueEntityID(raw._id),
        ).getValue();
    }

    public static toPersistence(account: Account): AccountPersistenceRaw {
        return {
            _id: account.accountId.toValue(),
            label: account.label,
            name: account.name,
            iconURL: account.iconURL,
            secretKey: account.secretKey!,
            redirectURIs: account.redirectURIs,
            defaultRedirectURI: account.defaultRedirectURI,
        };
    }
}
