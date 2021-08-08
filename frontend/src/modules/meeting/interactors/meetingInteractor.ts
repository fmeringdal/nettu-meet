import axios from "axios";
import { Result } from "../../../shared/core/Result";
import { signalingChannel } from "../../../shared/services/theme/signalling";
import { Meeting } from "../domain/meeting";
import { Resource } from "../domain/resource";
import {
  GetCanvasResponse,
  IMeetingService,
  CreatedResourceResponse,
} from "../services/meetingService";
import { updateMeetingState } from "../state/meeting";
import { useResourceDrawer } from "../state/resourceDrawer";
import { logger } from "../../../logger";

export interface IMeetingInteractor {
  getMeetingById(meetingId: string): Promise<Meeting | undefined>;
  createCanvas(meetingId: string): Promise<void>;
  getCanvas(canvasId: string): Promise<GetCanvasResponse>;
  createResource(
    file: any,
    meetingId: string,
    canvasId?: string
  ): Promise<Result<CreatedResourceResponse>>;
  deleteResource(meetingId: string, resourceId: string): Promise<Result<void>>;
  moveToMeetingLobby(): void;
  moveToMeetingRoom(): void;
}

interface ActiveCanvasChangeEvent {
  meetingId: string;
  canvasId: string;
}

export class MeetingInteractor implements IMeetingInteractor {
  private meetingService: IMeetingService;

  constructor(meetingService: IMeetingService) {
    this.meetingService = meetingService;
    this.setupListeners();
  }

  private setupListeners() {
    signalingChannel.on(
      "active-canvas-change",
      (e: ActiveCanvasChangeEvent) => {
        this.setActiveCanvas(e.canvasId, false);
      }
    );

    signalingChannel.on("new-canvas", (e: ActiveCanvasChangeEvent) => {
      this.onCanvasCreated(e.canvasId);
    });

    signalingChannel.on("new-resource", (e: string) => {
      logger.info({e : e}, "on resource controller");
      const resource = JSON.parse(e) as Resource;
      this.onResourceCreated(resource);
    });

    signalingChannel.on("deleted-resource", (resourceId: string) => {
      this.onResourceDeleted(resourceId);
    });
  }

  async getMeetingById(meetingId: string) {
    let meeting: undefined | Meeting;
    try {
      meeting = await this.meetingService.getMeetingById(meetingId);
    } catch (error) {}
    logger.info({meeting : meeting}, "meeting got");
    updateMeetingState((s) => ({
      ...s,
      isLoadingMeeting: false,
      meeting,
    }));

    return meeting;
  }

  async createCanvas(meetingId: string) {
    try {
      await this.meetingService.createCanvas(meetingId);
    } catch (error) {}
  }

  async deleteResource(meetingId: string, resourceId: string) {
    return await this.meetingService.deleteResource(meetingId, resourceId);
  }

  async createResource(
    file: any,
    meetingId: string,
    canvasId?: string
  ): Promise<Result<CreatedResourceResponse>> {
    let name = file.name;
    let type = file.type;
    if (file.file) {
      file = file.file;
    }

    const res = await this.meetingService.createResource({
      contentType: type,
      name,
      meetingId,
      canvasId,
    });
    if (res.isFailure) return Result.fail("fail");

    const { signedUploadURL, resource } = res.getValue();

    // Upload the file
    try {
      let uploadRes = await axios.put(signedUploadURL, file, {
        headers: {
          "Content-Type": type,
          "Access-Control-Allow-Origin": "*",
        },
      });
      if (uploadRes.status !== 200) {
        throw new Error("Invalid status code received");
      }
    } catch (e) {
      return Result.fail("fail");
    }

    signalingChannel.emit("new-resource", JSON.stringify(resource));

    return res;
  }

  private onCanvasCreated(canvasId: string) {
    updateMeetingState((s) => ({
      ...s,
      meeting: {
        ...s.meeting!,
        canvasIds: [...s.meeting!.canvasIds, canvasId],
        activeCanvasId: canvasId,
      },
    }));
  }

  private onResourceCreated(resource: Resource) {
    updateMeetingState((s) => {
      return {
        ...s,
        meeting: {
          ...s.meeting!,
          resources: [...s.meeting!.resources, resource],
        },
      };
    });

    const resourceState = { ...useResourceDrawer.getState() };
    if (!resourceState.visible && resource.canvasId == null) {
      resourceState.unseenCount += 1;
      useResourceDrawer.setState(resourceState);
    }
  }

  private onResourceDeleted(resourceId: string) {
    updateMeetingState((s) => {
      return {
        ...s,
        meeting: {
          ...s.meeting!,
          resources: [...s.meeting!.resources].filter(
            (r) => r.id !== resourceId
          ),
        },
      };
    });
  }

  async getCanvas(canvasId: string): Promise<GetCanvasResponse> {
    return (await this.meetingService.getCanvas(canvasId)).getValue();
  }

  async setActiveCanvas(canvasId: string, notify: boolean = true) {
    try {
      if (notify) {
        signalingChannel.emit("active-canvas-change", canvasId);
      }

      updateMeetingState((s) => ({
        ...s,
        meeting: {
          ...s.meeting!,
          activeCanvasId: canvasId,
        },
      }));
    } catch (error) {}
  }

  moveToMeetingLobby() {
    updateMeetingState((s) => ({
      ...s,
      inLoadingPage: false,
      inLobbyPage: true,
    }));
  }

  moveToMeetingRoom() {
    updateMeetingState((s) => ({
      ...s,
      inLoadingPage: false,
      inLobbyPage: false,
    }));
  }
}
