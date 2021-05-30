interface IUseCaseError {
    message: string;
}

export abstract class UseCaseError implements IUseCaseError {
    public readonly message: string;

    constructor(message: string) {
        this.message = message;
    }
}
