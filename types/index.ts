import type MuxPlayerElement from '@mux-elements/mux-player';
import type MuxVideoElement from '@mux-elements/mux-video';

export enum RecordState {
  IDLE,
  PREPARING,
  RECORDING
}

export interface HTMLVideoElementWithPlyr extends HTMLVideoElement {
  plyr?: Plyr
}

export type PlayerElement = HTMLVideoElementWithPlyr | MuxVideoElement | MuxPlayerElement

export type ModerationScores = {
  adult?: number;
  violent?: number;
  suggestive?: number;
}

