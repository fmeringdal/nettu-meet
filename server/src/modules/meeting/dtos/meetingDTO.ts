import { OpeningTime } from '../domain/meeting';
import { ResourceDTO } from './resourceDTO';

export interface MeetingDTO {
    id: string;
    title: string;
    canvasIds: string[];
    activeCanvasId: string;
    chatId: string;
    type: string;
    redirectURI: string;
    openingTime?: OpeningTime;
    account: {
        id: string;
        label: string;
        iconURL?: string;
    };
    resources: ResourceDTO[];
}
