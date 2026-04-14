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

// Robots job hook payload — the webhook handler uses this purely as a status signal.
// The workflow always retrieves the full job via the Mux API to get authoritative outputs,
// rather than trusting the webhook body shape.
export type RobotsJobHookPayload =
  | { status: 'completed' }
  | { status: 'errored'; errorMessage: string }
  | { status: 'cancelled' };
