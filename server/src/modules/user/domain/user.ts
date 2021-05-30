import { Guard } from '../../../shared/core/Guard';
import { Result } from '../../../shared/core/Result';
import { Entity } from '../../../shared/domain/Entity';
// import { UserCreated } from "./events/userCreated";
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { UserName } from './userName';

interface UserProps {
    fullName: UserName;
    profilePictureURL?: string;
}

export class User extends Entity<UserProps> {
    get userId(): UniqueEntityID {
        return this._id;
    }

    get profilePictureURL(): string | undefined {
        return this.props.profilePictureURL;
    }

    get fullName(): UserName {
        return this.props.fullName;
    }

    private constructor(props: UserProps, id?: UniqueEntityID) {
        super(props, id);
    }

    public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
        const guardResult = Guard.againstNullOrUndefinedBulk([{ argument: props.fullName, argumentName: 'fullName' }]);

        if (!guardResult.succeeded) {
            return Result.fail(guardResult.message as string);
        }

        const isNewUser = !!id === false;
        const user = new User(
            {
                ...props,
            },
            id,
        );

        if (isNewUser) {
            //   user.addDomainEvent(new UserCreated(user));
        }

        return Result.ok(user);
    }
}
