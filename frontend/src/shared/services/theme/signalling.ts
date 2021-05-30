import { io } from "socket.io-client";
import { apiConfig } from "../../../config/api";

export const signalingChannel = io(apiConfig.url, {
  path: "/api/v1/ws",
});
