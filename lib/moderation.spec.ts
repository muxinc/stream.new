import { Likelihood, mergeAnnotations } from './moderation';

test('merges a collection of scores based on the max values and leaves out any keys it does not have', async () => {
  const combined = mergeAnnotations([
    {adult: Likelihood.LIKELY, violence: Likelihood.POSSIBLE},
    {adult: Likelihood.VERY_UNLIKELY, violence: Likelihood.VERY_LIKELY},
  ]);
  expect(combined).toEqual({ adult: 4, violence: 5 });
});

test('merges a collection of scores based on the max values', async () => {
  const combined = mergeAnnotations([
    {adult: Likelihood.LIKELY, violence: Likelihood.POSSIBLE},
    {adult: Likelihood.VERY_UNLIKELY, violence: Likelihood.VERY_LIKELY, racy: Likelihood.POSSIBLE},
  ]);
  expect(combined).toEqual({ adult: 4, violence: 5, racy: 3 });
});
