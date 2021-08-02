import { CreateDefaultAccountUseCase } from './CreateDefaultAccountUseCase';
import { createDefaultAccountBodySchema, CreateDefaultAccountDTO } from './CreateDefaultAccountDTO';
import {logger} from "../../../../logger"

export class CreateDefaultAccountController {
    private useCase: CreateDefaultAccountUseCase;

    constructor(useCase: CreateDefaultAccountUseCase) {
        this.useCase = useCase;
    }

    async execute(): Promise<void> {
        const data = createDefaultAccountBodySchema.validate({
            name: process.env['ACCOUNT_NAME'],
            label: process.env['ACCOUNT_LABEL'],
            secretKey: process.env['ACCOUNT_SECRET_KEY'],
            iconURL: process.env['ACCOUNT_ICON_URL'],
            redirectURI: process.env['ACCOUNT_REDIRECT_URI'],
            redirectURIs: process.env['ACCOUNT_REDIRECT_URIS']?.split(',').filter((url) => url.length > 0),
        });
        if (data.error) {
            return;
        }
        const dto: CreateDefaultAccountDTO = data.value;

        try {
            const result = await this.useCase.execute(dto);

            if (result.isLeft()) {
                logger.error({error : result.value.errorValue()}, 'Unable to create default account');
            } else {
                logger.info('Default account created or already exists');
            }
        } catch (err) {
            logger.error({error : err},'Unable to create default account');
        }
    }
}
