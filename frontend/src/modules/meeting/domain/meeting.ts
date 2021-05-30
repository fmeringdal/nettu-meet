import { Resource } from "./resource";

export type Meeting = {
  id: string;
  title: string;
  type: string;
  canvasIds: string[];
  activeCanvasId: string;
  redirectURI: string;
  resources: Resource[];
  chatId: string;
  openingTime?: {
    startTS: number;
    endTS: number;
  };
  account: {
    id: string;
    label: string;
    iconURL?: string;
  };
};
