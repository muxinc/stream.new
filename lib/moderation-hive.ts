import got from './got-client';
import { ModerationScores } from '../types';
import { getThumbnailUrls } from './moderation-utils';

const client = got.extend({
  prefixUrl: 'https://api.thehive.ai/api/v2',
  headers: {
    accept: 'application/json',
    authorization: `token ${process.env.HIVE_AI_KEY}`
  },
});

const isEnabled = () => !!(process.env.HIVE_AI_KEY?.length);

type HiveClass = {
  class: string;
  score: number;
};

type HiveOutput = {
  taskId: string;
  time: number,
  classes: HiveClass[],
}

type HiveResponse = {
  response: {
    output: HiveOutput[];
  };
}

type HiveResult = {
  id: string;
  code: number;
  status: HiveResponse[];
}

type HiveModerationResult = {
  taskIds: string[];
  scores: ModerationScores;
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
    console.error('Error detecting scores for hive', result.code, url);
    return null;
  }

  if (!(result.status[0].response.output)) {
    console.error('Got a 200, but no status.response.output', result.status, url);
    return null;
  }

  return { ...result.status[0].response.output[0], taskId: result.id };
}

function roundedScore (score: number) {
  return +score.toFixed(6);
}

export function mergeAnnotations (outputs: HiveOutput[]): HiveModerationResult {
  const adultScores: number[] = [];
  const suggestiveScores: number[] = [];
  const violentScores: number[] = [];
  const taskIds: string[] = [];

  outputs.forEach((output) => {
    taskIds.push(output.taskId);

    const nsfwScore = (output.classes.find((cls => cls.class === "general_nsfw")) as HiveClass).score;
    if (nsfwScore) {
      adultScores.push(roundedScore(nsfwScore));
    }

    const suggestiveScore = (output.classes.find((cls => cls.class === "general_suggestive")) as HiveClass).score;
    if (suggestiveScore) {
      suggestiveScores.push(roundedScore(suggestiveScore));
    }

    const bloodyScore = (output.classes.find((cls => cls.class === "very_bloody")) as HiveClass).score;
    if (bloodyScore) {
      violentScores.push(roundedScore(bloodyScore));
    }
  });

  const combined: ModerationScores = {
    adult: adultScores.length ? Math.max(...adultScores) : undefined,
    suggestive: suggestiveScores.length ? Math.max(...suggestiveScores) : undefined,
    violent: violentScores.length ? Math.max(...violentScores) : undefined,
  };

  return { taskIds: taskIds, scores: combined };
}

export async function getScores ({ playbackId, duration }: { playbackId: string, duration: number }): Promise<HiveModerationResult|undefined> {
  if (!isEnabled()) {
    console.log('Skipping moderation-hive, no key enabled');
    return undefined;
  }
  const files = getThumbnailUrls({ playbackId, duration });
  const outputs = await Promise.all(files.map((file) => fetchOutputForUrl(file)));
  /*
   * Filter out nulls to make typescript happy
   */
  const outputsFiltered = outputs.filter(a => !!a) as HiveOutput[];

  return mergeAnnotations(outputsFiltered);
}
