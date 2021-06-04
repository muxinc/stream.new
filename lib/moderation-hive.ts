import got from 'got';
import { ModerationScores } from '../types';
import { getThumbnailUrls } from './moderation-utils';

const client = got.extend({
  prefixUrl: 'https://api.thehive.ai/api/v2',
  headers: {
    accept: 'application/json',
    authorization: `token ${process.env.HIVE_AI_KEY}`
  },
});

type HiveClass = {
  class: string;
  score: number;
};

type HiveOutput = {
  time: number,
  classes: HiveClass[],
}

type HiveResponse = {
  response: {
    output: HiveOutput[];
  };
}

type HiveResult = {
  code: number;
  status: HiveResponse[];
}

async function fetchOutputForUrl (url: string): Promise<HiveOutput|null> {
  let result: HiveResult;

  try {
    result = (await client.post('task/sync', { json: { url }, responseType: 'json' })).body as HiveResult;
  } catch (e) {
    console.error('Error with client.post in hive-moderation', e);
    return null;
  }

  if (result.code !== 200) {
    console.error('Error detecting scores', result.code, url);
    return null;
  }

  if (!(result.status[0].response.output)) {
    console.error('Got a 200, but no status.response.output', result.status, url);
    return null;
  }

  return result.status[0].response.output[0];
}

function roundedScore (score: number) {
  return +score.toFixed(6);
}

export function mergeAnnotations (outputs: HiveOutput[]): ModerationScores {
  const adultScores: number[] = [];
  const suggestiveScores: number[] = [];

  outputs.forEach((output) => {
    const nsfwScore = (output.classes.find((cls => cls.class === "general_nsfw")) as HiveClass).score;
    adultScores.push(roundedScore(nsfwScore));
  });

  outputs.forEach((output) => {
    const suggestiveScore = (output.classes.find((cls => cls.class === "general_suggestive")) as HiveClass).score;
    suggestiveScores.push(roundedScore(suggestiveScore));
  });

  const combined: ModerationScores = {
    adult: adultScores.length ? Math.max(...adultScores) : undefined,
    suggestive: suggestiveScores.length ? Math.max(...suggestiveScores) : undefined,
  };

  return combined;
}

export async function getScores ({ playbackId, duration }: { playbackId: string, duration: number }): Promise<ModerationScores> {
  const files = getThumbnailUrls({ playbackId, duration });
  const outputs = await Promise.all(files.map((file) => fetchOutputForUrl(file)));
  /*
   * Filter out nulls to make typescript happy
   */
  const outputsFiltered = outputs.filter(a => !!a) as HiveOutput[];

  return mergeAnnotations(outputsFiltered);
}
