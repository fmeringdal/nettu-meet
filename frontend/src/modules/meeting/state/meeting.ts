import create from "zustand";
import { Meeting } from "../domain/meeting";

export type MeetingState = {
  meeting?: Meeting;
  isLoadingMeeting: boolean;

  inLoadingPage: boolean;
  inLobbyPage: boolean;
};

export const meetingState = create<MeetingState>((set) => ({
  isLoadingMeeting: true,
  inLoadingPage: true,
  inLobbyPage: false,
}));

export const updateMeetingState = (
  state: MeetingState | ((state: MeetingState) => MeetingState)
) => {
  const updatedState =
    typeof state === "function" ? state(meetingState.getState()) : state;
  meetingState.setState(updatedState);
};
