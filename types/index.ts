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
  violence?: number;
  racy?: number;
}

