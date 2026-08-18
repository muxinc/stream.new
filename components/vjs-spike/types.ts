export type SpikeEngine = 'spf' | 'hlsjs';

export type SpikePlayerProps = {
  playbackId: string;
  engine: SpikeEngine;
};
