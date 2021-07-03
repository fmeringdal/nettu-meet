import SES from 'aws-sdk/clients/ses';
import fetch from 'node-fetch';
import { awsConfig } from '../../../config';
import { getEmailConfirmationTemplate, IEmailVerificationCodeParams } from './htmlTemplates/getTemplate';

export interface IEmailService {
    sendEmailVerificationCode(toEmail: string, params: IEmailVerificationCodeParams): Promise<void>;
    isDisposable(email: string): Promise<boolean>;
}

interface SESMessage {
    Body: {
        Text: {
            Charset: string;
            Data: string;
        };
        Html: {
            Charset: string;
            Data: string;
        };
    };
    Subject: {
        Charset: string;
        Data: string;
    };
}

interface SESParams {
    Destination: { ToAddresses: string[] };
    Message: SESMessage;
    Source: string;
}

const Charset = 'UTF-8';

export class EmailService implements IEmailService {
    private ses: SES;

    constructor() {
        this.ses = new SES({
            apiVersion: '2010-12-01',
            credentials: {
                accessKeyId: awsConfig.accessKeyId,
                secretAccessKey: awsConfig.secretKey,
            },
            region: awsConfig.region,
        });
    }

    private async sendMail(params: SESParams) {
        // Create the promise and SES service object
        const res = await this.ses.sendEmail(params).promise();
        return res;
    }

    async sendEmailVerificationCode(toEmail: string, params: IEmailVerificationCodeParams) {
        this.sendMail({
            Destination: {
                ToAddresses: [toEmail],
            },
            Message: {
                Body: {
                    Html: {
                        Charset,
                        Data: getEmailConfirmationTemplate(params),
                    },
                    Text: {
                        Charset,
                        Data: `Email verification code for Nettu Meet is: ${params.code}`,
                    },
                },
                Subject: {
                    Charset,
                    Data: 'Email verification code for Nettu Meet',
                },
            },
            Source: awsConfig.sesEmailSource,
        });
    }

    async isDisposable(email: string) {
        try {
            const domain = email.split("@").pop();
            const res = await fetch(`https://open.kickbox.com/v1/disposable/${domain}`);
            const data = await res.json();
            const disposable = data.disposable;
            return disposable;
        } catch (e) {
            // ! Might want to change this ???
            return false;
        }
    }
}
