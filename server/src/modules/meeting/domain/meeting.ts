import { Guard } from '../../../shared/core/Guard';
import { Result } from '../../../shared/core/Result';
import { Entity } from '../../../shared/domain/Entity';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Resource } from './resource';

export type MeetingType = 'open';

export interface OpeningTime {
    startTS: number;
    endTS: number;
}

export interface MeetingProps {
    title: string;
    type: MeetingType;
    canvasIds: UniqueEntityID[];
    activeCanvasId: UniqueEntityID;
    chatId: UniqueEntityID;
    redirectURI: string;
    // participants: MeetingParticipant[];
    openingTime?: OpeningTime;
    account: {
        accountId: string;
        label: string;
        iconURL?: string;
    };
    resources: Resource[];
}

export class Meeting extends Entity<MeetingProps> {
    get meetingId(): UniqueEntityID {
        return this._id;
    }

    get title(): string {
        return this.props.title;
    }

    get type(): MeetingType {
        return this.props.type;
    }

    get canvasIds(): UniqueEntityID[] {
        return this.props.canvasIds;
    }

    get chatId(): UniqueEntityID {
        return this.props.chatId;
    }

    get activeCanvasId(): UniqueEntityID {
        return this.props.activeCanvasId;
    }

    get redirectURI(): string {
        return this.props.redirectURI;
    }

    get account() {
        return this.props.account;
    }

    get openingTime() {
        return this.props.openingTime;
    }

    get resources(): Resource[] {
        return this.props.resources;
    }

    public addCanvas(canvasId: UniqueEntityID) {
        this.canvasIds.push(canvasId);
    }

    public addResource(resource: Resource) {
        this.resources.push(resource);
    }

    public removeResource(resourceId: string) {
        this.props.resources = this.props.resources.filter((r) => r.resourceId.toString() !== resourceId);
    }

    public setActiveCanvas(canvasId: UniqueEntityID) {
        this.props.activeCanvasId = canvasId;
    }

    public static create(props: MeetingProps, id?: UniqueEntityID): Result<Meeting> {
        const guardResult = Guard.againstNullOrUndefinedBulk([{ argument: props.title, argumentName: 'title' }]);

        if (!guardResult.succeeded) {
            return Result.fail(guardResult.message as string);
        }

        const meeting = new Meeting(
            {
                ...props,
            },
            id,
        );

        return Result.ok(meeting);
    }
}
