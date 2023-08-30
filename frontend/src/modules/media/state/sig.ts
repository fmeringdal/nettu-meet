//
// our "signaling" function -- just an http fetch

import { apiConfig } from "../../../config/api";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import { useRoomStore } from "./state";
import { logger } from "../../../logger"
//
export const sig = async (endpoint: string, data: any) => {
    if (!data.roomId) {
        const roomId = useRoomStore.getState().roomId;
        data.roomId = roomId;
    }
    try {
        const headers = { 'Content-Type': 'application/json' },
            body = JSON.stringify({ ...data, peerId: signalingChannel.id });

        const response = await fetch(
            apiConfig.baseUrl + '/signaling/' + endpoint, { method: 'POST', body, headers }
        );
        return await response.json();
    } catch (e) {
        logger.error({error : e}, e);
        return { error: e };
    }
}