import { Result } from '../../../shared/core/Result';
import { ValueObject } from '../../../shared/domain/ValueObject';
import { Guard } from '../../../shared/core/Guard';

interface UserNameProps {
    name: string;
}

export class UserName extends ValueObject<UserNameProps> {
    public static maxLength = 35;
    public static minLength = 2;

    get value(): string {
        return this.props.name;
    }

    private constructor(props: UserNameProps) {
        super(props);
    }

    public static create(props: UserNameProps): Result<UserName> {
        const usernameResult = Guard.againstNullOrUndefined(props.name, 'fullName');
        if (!usernameResult.succeeded) {
            return Result.fail(usernameResult.message as string);
        }

        const minLengthResult = Guard.againstAtLeast(this.minLength, props.name);
        if (!minLengthResult.succeeded) {
            return Result.fail(minLengthResult.message as string);
        }

        const maxLengthResult = Guard.againstAtMost(this.maxLength, props.name);
        if (!maxLengthResult.succeeded) {
            return Result.fail(minLengthResult.message as string);
        }

        return Result.ok(new UserName(props));
    }
}
