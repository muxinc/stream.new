export enum RecordState {
  IDLE,
  PREPARING,
  RECORDING
}

export interface HTMLVideoElementWithPlyr extends HTMLVideoElement {
  plyr: Plyr
}

export type ModerationScores = {
  adult?: number;
  violent?: number;
  suggestive?: number;
}

