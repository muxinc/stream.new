import type MuxPlayerElement from '@mux/mux-player';

export enum RecordState {
  IDLE,
  PREPARING,
  RECORDING
}

export interface HTMLVideoElementWithPlyr extends HTMLVideoElement {
  plyr?: Plyr
}

export type PlayerElement = HTMLVideoElementWithPlyr | MuxPlayerElement

export type ModerationScores = {
  adult?: number;
  violent?: number;
  suggestive?: number;
}

