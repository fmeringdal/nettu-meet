import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Resource } from '../domain/resource';
import { ResourceDTO } from '../dtos/resourceDTO';

export interface ResourcePersistenceRaw {
    _id: string;
    publicURL: string;
    name: string;
    contentType: string;
    canvasId?: string;
    storage: {
        key: string;
        bucketName: string;
    };
}

export class ResourceMap {
    public static toDTO(resource: Resource): ResourceDTO {
        return {
            id: resource.resourceId.toString(),
            contentType: resource.contentType,
            name: resource.name,
            publicURL: resource.publicURL,
            canvasId: resource.canvasId ? resource.canvasId.toString() : undefined,
        };
    }

    public static toDomain(raw: ResourcePersistenceRaw): Resource {
        return {
            name: raw.name,
            contentType: raw.contentType,
            publicURL: raw.publicURL,
            resourceId: new UniqueEntityID(raw._id),
            canvasId: raw.canvasId ? UniqueEntityID.createFromString(raw.canvasId) : undefined,
            storage: raw.storage,
        };
    }

    public static toPersistence(resource: Resource): ResourcePersistenceRaw {
        return {
            _id: resource.resourceId.toValue(),
            name: resource.name,
            publicURL: resource.publicURL,
            storage: resource.storage,
            contentType: resource.contentType,
            canvasId: resource.canvasId ? resource.canvasId.toString() : undefined,
        };
    }
}
