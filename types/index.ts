import type MuxPlayerElement from '@mux/mux-player';
import type MuxVideoElement from '@mux/mux-video';
import type { ModerateJobOutputs } from '@mux/mux-node/resources/robots/jobs/moderate';
import type { SummarizeJobOutputs } from '@mux/mux-node/resources/robots/jobs/summarize';
import type { AskQuestionsJobOutputs } from '@mux/mux-node/resources/robots/jobs/ask-questions';

export enum RecordState {
  IDLE,
  PREPARING,
  RECORDING
}

export interface HTMLVideoElementWithPlyr extends HTMLVideoElement {
  plyr?: Plyr
}

export type PlayerElement = HTMLVideoElementWithPlyr | MuxVideoElement | MuxPlayerElement

export type RobotsJobHookPayload<T> =
  | { status: 'completed'; outputs: T }
  | { status: 'errored'; errorMessage: string }
  | { status: 'cancelled' };

export type ModerationHookPayload = RobotsJobHookPayload<ModerateJobOutputs>;
export type SummarizeHookPayload = RobotsJobHookPayload<SummarizeJobOutputs>;
export type AskQuestionsHookPayload = RobotsJobHookPayload<AskQuestionsJobOutputs>;
