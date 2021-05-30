import { createHash, randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';
import { Guard } from '../../../shared/core/Guard';
import { Result } from '../../../shared/core/Result';
import { Entity } from '../../../shared/domain/Entity';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Validators } from '../../../shared/domain/Validator';

export interface AccountProps {
    name: string;
    label: string;
    iconURL?: string;
    secretKey?: string;
    redirectURIs: string[];
    defaultRedirectURI?: string;
}

export class Account extends Entity<AccountProps> {
    get accountId(): UniqueEntityID {
        return this._id;
    }

    get name(): string {
        return this.props.name;
    }

    get label(): string {
        return this.props.label;
    }

    get secretKey(): string | undefined {
        return this.props.secretKey;
    }

    get iconURL(): string | undefined {
        return this.props.iconURL;
    }

    get redirectURIs(): string[] {
        return this.props.redirectURIs;
    }

    get defaultRedirectURI(): string | undefined {
        return this.props.defaultRedirectURI;
    }

    private static generateSecretKey(): string {
        const key = createHash('sha256').update(uuid()).update(randomBytes(256)).digest('hex');
        return `sk_live_${key}`;
    }

    public static create(props: AccountProps, id?: UniqueEntityID): Result<Account> {
        const guardResult = Guard.againstNullOrUndefinedBulk([
            { argument: props.name, argumentName: 'name' },
            { argument: props.label, argumentName: 'label' },
        ]);

        if (!guardResult.succeeded) {
            return Result.fail(guardResult.message as string);
        }

        if (props.iconURL) {
            if (!Validators.isValidURL(props.iconURL)) {
                return Result.fail('Given icon url is not a valid url: ' + props.iconURL);
            }
        }

        for (const url of props.redirectURIs) {
            if (!Validators.isValidURL(url)) {
                return Result.fail('Given redirect url is not a valid url: ' + url);
            }
        }
        if (props.defaultRedirectURI && !props.redirectURIs.includes(props.defaultRedirectURI)) {
            return Result.fail(
                `Given default redirect url: ${props.defaultRedirectURI} is not valid url as it is not registered as a redirect uri`,
            );
        }

        const isNewAccount = !!id === false;
        const account = new Account(
            {
                ...props,
                secretKey: isNewAccount ? Account.generateSecretKey() : props.secretKey!,
            },
            id,
        );

        return Result.ok(account);
    }
}
