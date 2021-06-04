import { getScores } from './moderation-hive';
import nock from 'nock';

beforeEach(() => {
  process.env.HIVE_AI_KEY = process.env.HIVE_AI_KEY || 'test-api-key';
  nock.disableNetConnect();
});

function nockNsfwScore ({ adult, suggestive } : { adult: number, suggestive: number }) {
  return nock('https://api.thehive.ai/api/v2').post('/task/sync').reply(200, {
    code: 200,
    status: [
      {
        response: {
          output: [
            {
              time: 0,
              classes: [
                {
                  class: "general_nsfw",
                  score: adult
                },
                {
                  class: "general_suggestive",
                  score: suggestive
                },
              ]
            }
          ]
        }
      }
    ],
  });
}

test('gets a combined score for 3 files', async () => {
  const scopeUrl1 = nockNsfwScore({ adult: 0.9925124, suggestive: 0.1123 });
  const scopeUrl2 = nockNsfwScore({ adult: 0.881235, suggestive: 0.79251 });
  const scopeUrl3 = nockNsfwScore({ adult: 0.0389421, suggestive: 0.00482 });
  const scores = await getScores({ playbackId: '123', duration: 30 });

  expect(scores?.adult).toEqual(0.992512);
  expect(scores?.suggestive).toEqual(0.79251);
  expect(scopeUrl1.isDone()).toEqual(true);
  expect(scopeUrl2.isDone()).toEqual(true);
  expect(scopeUrl3.isDone()).toEqual(true);
});
