import { Result } from "../../../shared/core/Result";
import { BaseAPI } from "../../../shared/infra/services/BaseAPI";
import { Meeting } from "../domain/meeting";
import { Resource } from "../domain/resource";

interface CreatedCanvasResponse {
  canvasId: string;
  meetingId: string;
}

interface MeetingEntrypoint {
  url: string;
}

interface CreatedDemoMeetingResponse {
  meetingId: string;
  entrypoint: MeetingEntrypoint;
}

export interface CreatedResourceResponse {
  signedUploadURL: string;
  resource: Resource;
}

export interface GetCanvasResponse {
  id: string;
  data: string;
}

export interface CreateResourceRequest {
  name: string;
  contentType: string;
  meetingId: string;
  canvasId?: string;
}

export interface IMeetingService {
  getMeetingById(meetingId: string): Promise<Meeting | undefined>;
  createCanvas(meetingId: string): Promise<Result<CreatedCanvasResponse>>;
  getCanvas(canvasId: string): Promise<Result<GetCanvasResponse>>;
  createResource(
    req: CreateResourceRequest
  ): Promise<Result<CreatedResourceResponse>>;
  deleteResource(meetingId: string, resourceId: string): Promise<Result<void>>;
  createDemoMeeting(): Promise<Result<CreatedDemoMeetingResponse>>;
}

export class MeetingService extends BaseAPI implements IMeetingService {
  async getMeetingById(meetingId: string): Promise<Meeting | undefined> {
    const res = await this.get(`/meeting/${meetingId}`);
    if (
      res.status !== 200 ||
      res.data == null ||
      res.data.meeting == null ||
      res.data.account == null
    ) {
      return;
    }
    const { meeting, account } = res.data;
    return res.status === 200 && res.data != null
      ? {
          ...meeting,
          activeCanvasId: meeting.activeCanvasId
            ? meeting.activeCanvasId
            : meeting.canvasIds[0],
          account: account,
        }
      : undefined;
  }

  async createCanvas(
    meetingId: string
  ): Promise<Result<CreatedCanvasResponse>> {
    const res = await this.post(`/meeting/${meetingId}/canvas`);
    if (res.status !== 201) {
      return Result.fail("Invalid response code");
    }
    return Result.ok(res.data);
  }

  async createDemoMeeting(): Promise<Result<CreatedDemoMeetingResponse>> {
    const res = await this.post(`/meeting/demo`);
    if (res.status !== 201) {
      return Result.fail("Invalid response code");
    }
    return Result.ok(res.data);
  }

  async getCanvas(canvasId: string): Promise<Result<GetCanvasResponse>> {
    const res = await this.get(`/meeting/canvas/${canvasId}`);
    if (res.status !== 200) {
      return Result.fail("Invalid response code");
    }
    return Result.ok(res.data);
  }

  async createResource(
    req: CreateResourceRequest
  ): Promise<Result<CreatedResourceResponse>> {
    const res = await this.post(`/meeting/${req.meetingId}/resource`, {
      canvasId: req.canvasId,
      contentType: req.contentType,
      name: req.name,
    });
    if (res.status !== 201) {
      return Result.fail("Invalid response code");
    }
    return Result.ok(res.data);
  }

  async deleteResource(
    meetingId: string,
    resourceId: string
  ): Promise<Result<void>> {
    const res = await this.delete(
      `/meeting/${meetingId}/resource/${resourceId}`
    );
    if (res.status !== 200) {
      return Result.fail("Invalid response code");
    }
    return Result.ok();
  }
}
