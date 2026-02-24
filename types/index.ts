import type MuxPlayerElement from '@mux/mux-player';
import type MuxVideoElement from '@mux/mux-video';

export enum RecordState {
  IDLE,
  PREPARING,
  RECORDING
}

export interface HTMLVideoElementWithPlyr extends HTMLVideoElement {
  plyr?: Plyr
}

export type PlayerElement = HTMLVideoElementWithPlyr | MuxVideoElement | MuxPlayerElement

export interface CaptionHookPayload {
  includeTranscript: boolean;
}

export interface CaptionStatus {
  done: boolean;
  includeTranscript: boolean;
}

