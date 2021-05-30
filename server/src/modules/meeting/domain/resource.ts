import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';

export interface Resource {
    resourceId: UniqueEntityID;
    publicURL: string;
    name: string;
    contentType: string;
    canvasId?: UniqueEntityID;
    storage: {
        key: string;
        bucketName: string;
    };
}
