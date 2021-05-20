import client from './google-vision-client';
import { ModerationScores } from '../types';

/*
 * https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#google.cloud.vision.v1.Likelihood
 *
 * Enums
UNKNOWN	Unknown likelihood.
VERY_UNLIKELY	It is very unlikely.
UNLIKELY	It is unlikely.
POSSIBLE	It is possible.
LIKELY	It is likely.
VERY_LIKELY	It is very likely.
 */

export enum Likelihood {
  UNKNOWN = 'UNKNOWN',
  VERY_UNLIKELY = 'VERY_UNLIKELY',
  UNLIKELY = 'UNLIKELY',
  POSSIBLE = 'POSSIBLE',
  LIKELY = 'LIKELY',
  VERY_LIKELY = 'VERY_LIKELY',
}

type SafeSearchAnnotation = {
  adult?: Likelihood | null, 
  spoof?: Likelihood | null, 
  medical?: Likelihood | null, 
  violence?: Likelihood | null, 
  racy?: Likelihood | null, 
}

const ENUM_TO_VAL = {
  UNKNOWN: null,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5,
};

async function fetchAnnotationsForUrl (url: string): Promise<SafeSearchAnnotation|null> {
  const [result] = await client.safeSearchDetection(url);
  if (result.error) {
    console.error('Error detecting scores', url);
    return null;
  }
  const detections = result.safeSearchAnnotation;
  if (!detections) {
    console.error('No detections', url);
    return null;
  }

  console.log('debug detections for url', detections, url);
  return detections as SafeSearchAnnotation;
}

export function mergeAnnotations (annotations: SafeSearchAnnotation[]): ModerationScores {
  const adultScores: number[] = [];
  const violenceScores: number[] = [];
  const racyScores: number[] = [];

  annotations.forEach((annotation) => {
    if (annotation.adult) {
      adultScores.push(ENUM_TO_VAL[annotation.adult] as number);
    }
    if (annotation.violence) {
      violenceScores.push(ENUM_TO_VAL[annotation.violence] as number);
    }
    if (annotation.racy) {
      racyScores.push(ENUM_TO_VAL[annotation.racy] as number);
    }
  });

  const combined: ModerationScores = {
    adult: adultScores.length ? Math.max(...adultScores) : undefined,
    violence: violenceScores.length ? Math.max(...violenceScores) : undefined,
    racy: racyScores.length ? Math.max(...racyScores) : undefined,
  };

  return combined;
}

export async function getScores ({ playbackId, duration }: { playbackId: string, duration: number }): Promise<ModerationScores> {
  /*
   * Get 3 thumbnails based on the duration
   */
  const timestamps = [(duration * 0.25),  (duration * 0.5), (duration * 0.75)];
  // const timestamps = [duration * 0.5];
  const files = timestamps.map((time) => `https://image.mux.com/${playbackId}/thumbnail.png?time=${time}`);
  const annotations = await Promise.all(files.map((file) => fetchAnnotationsForUrl(file)));
  /*
   * Filter out nulls to make typescript happy
   */
  const annotationsFiltered = annotations.filter(a => !!a) as SafeSearchAnnotation[];

  return mergeAnnotations(annotationsFiltered);
}
