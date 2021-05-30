import s3 from 'aws-sdk/clients/s3';
import { awsConfig } from '../../../config';
import { Result } from '../../core/Result';

interface SignedUploadDescription {
    url: string;
    signedRequest: string;
    bucketName: string;
}

export type FileStorageBucket = 'media';

export interface IFileStorage {
    storePublicFile(contentType: string, bucket: FileStorageBucket, key: string): Promise<SignedUploadDescription>;
    delete(bucket: FileStorageBucket, key: string): Promise<Result<void>>;
}

export class FileStorage implements IFileStorage {
    private client: s3;

    constructor() {
        this.client = new s3({
            credentials: {
                accessKeyId: awsConfig.accessKeyId,
                secretAccessKey: awsConfig.secretKey,
            },
            region: awsConfig.region,
            signatureVersion: 'v4',
        });
    }

    async storePublicFile(
        contentType: string,
        bucket: FileStorageBucket,
        key: string,
    ): Promise<SignedUploadDescription> {
        let bucketName = '';
        if (bucket === 'media') {
            bucketName = awsConfig.mediaBucket;
        }

        const signedUrlExpireSeconds = 60 * 5;

        const signedRequest = this.client.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: key,
            Expires: signedUrlExpireSeconds,
            ContentType: contentType,
            ACL: 'public-read',
        });

        const url = `https://${bucketName}.s3.amazonaws.com/${key}`;

        return {
            url,
            signedRequest,
            bucketName,
        };
    }

    async delete(bucket: FileStorageBucket, key: string): Promise<Result<void>> {
        let bucketName = '';
        if (bucket === 'media') {
            bucketName = awsConfig.mediaBucket;
        }

        try {
            await new Promise((res, rej) => {
                this.client.deleteObject(
                    {
                        Bucket: bucketName,
                        Key: key,
                    },
                    (err, data) => {
                        if (err) {
                            return rej(err);
                        }
                        return res(data);
                    },
                );
            });
            return Result.ok();
        } catch (error) {
            return Result.fail(error);
        }
    }
}
