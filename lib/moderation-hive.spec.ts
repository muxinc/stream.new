/**
 * @jest-environment node
 */

import { getScores } from './moderation-hive';
import nock from 'nock';

beforeEach(() => {
  nock.disableNetConnect();
});

function nockNsfwScore ({ adult, suggestive, veryBloody } : { adult: number, suggestive: number, veryBloody: number }) {
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
                {
                  class: "very_bloody",
                  score: veryBloody
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
  const scopeUrl1 = nockNsfwScore({ adult: 0.9925124, suggestive: 0.1123, veryBloody: 0.123 });
  const scopeUrl2 = nockNsfwScore({ adult: 0.881235, suggestive: 0.79251, veryBloody: 0.134 });
  const scopeUrl3 = nockNsfwScore({ adult: 0.0389421, suggestive: 0.00482, veryBloody: 0.456 });
  const scopeUrl4 = nockNsfwScore({ adult: 0.0389421, suggestive: 0.00482, veryBloody: 0.456 });
  const scopeUrl5 = nockNsfwScore({ adult: 0.0389421, suggestive: 0.00482, veryBloody: 0.456 });
  const scores = await getScores({ playbackId: '123', duration: 30 });

  expect(scores?.scores.adult).toEqual(0.992512);
  expect(scores?.scores.suggestive).toEqual(0.79251);
  expect(scores?.scores.violent).toEqual(0.456);
  expect(scopeUrl1.isDone()).toEqual(true);
  expect(scopeUrl2.isDone()).toEqual(true);
  expect(scopeUrl3.isDone()).toEqual(true);
  expect(scopeUrl4.isDone()).toEqual(true);
  expect(scopeUrl5.isDone()).toEqual(true);
});
