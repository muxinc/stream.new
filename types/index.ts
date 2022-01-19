export enum RecordState {
  IDLE,
  PREPARING,
  RECORDING
}

export type ModerationScores = {
  adult?: number;
  violent?: number;
  suggestive?: number;
}

