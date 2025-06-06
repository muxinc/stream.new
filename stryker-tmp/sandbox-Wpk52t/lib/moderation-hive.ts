// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import got from './got-client';
import { ModerationScores } from '../types';
import { getThumbnailUrls } from './moderation-utils';
const client = got.extend(stryMutAct_9fa48("682") ? {} : (stryCov_9fa48("682"), {
  prefixUrl: stryMutAct_9fa48("683") ? "" : (stryCov_9fa48("683"), 'https://api.thehive.ai/api/v2'),
  headers: stryMutAct_9fa48("684") ? {} : (stryCov_9fa48("684"), {
    accept: stryMutAct_9fa48("685") ? "" : (stryCov_9fa48("685"), 'application/json'),
    authorization: stryMutAct_9fa48("686") ? `` : (stryCov_9fa48("686"), `token ${process.env.HIVE_AI_KEY}`)
  })
}));
const isEnabled = stryMutAct_9fa48("687") ? () => undefined : (stryCov_9fa48("687"), (() => {
  const isEnabled = () => stryMutAct_9fa48("688") ? !process.env.HIVE_AI_KEY?.length : (stryCov_9fa48("688"), !(stryMutAct_9fa48("689") ? process.env.HIVE_AI_KEY?.length : (stryCov_9fa48("689"), !(stryMutAct_9fa48("690") ? process.env.HIVE_AI_KEY.length : (stryCov_9fa48("690"), process.env.HIVE_AI_KEY?.length)))));
  return isEnabled;
})());
type HiveClass = {
  class: string;
  score: number;
};
type HiveOutput = {
  taskId: string;
  time: number;
  classes: HiveClass[];
};
type HiveResponse = {
  response: {
    output: HiveOutput[];
  };
};
type HiveResult = {
  id: string;
  code: number;
  status: HiveResponse[];
};
type HiveModerationResult = {
  taskIds: string[];
  scores: ModerationScores;
};
async function fetchOutputForUrl(url: string): Promise<HiveOutput | null> {
  if (stryMutAct_9fa48("691")) {
    {}
  } else {
    stryCov_9fa48("691");
    let result: HiveResult;
    try {
      if (stryMutAct_9fa48("692")) {
        {}
      } else {
        stryCov_9fa48("692");
        result = (await client.post('task/sync', {
          json: {
            url
          },
          responseType: 'json'
        })).body as HiveResult;
      }
    } catch (e) {
      if (stryMutAct_9fa48("693")) {
        {}
      } else {
        stryCov_9fa48("693");
        console.error(stryMutAct_9fa48("694") ? "" : (stryCov_9fa48("694"), 'Error with client.post in hive-moderation'), e);
        return null;
      }
    }
    if (stryMutAct_9fa48("697") ? result.code === 200 : stryMutAct_9fa48("696") ? false : stryMutAct_9fa48("695") ? true : (stryCov_9fa48("695", "696", "697"), result.code !== 200)) {
      if (stryMutAct_9fa48("698")) {
        {}
      } else {
        stryCov_9fa48("698");
        console.error(stryMutAct_9fa48("699") ? "" : (stryCov_9fa48("699"), 'Error detecting scores for hive'), result.code, url);
        return null;
      }
    }
    if (stryMutAct_9fa48("702") ? false : stryMutAct_9fa48("701") ? true : stryMutAct_9fa48("700") ? result.status[0].response.output : (stryCov_9fa48("700", "701", "702"), !result.status[0].response.output)) {
      if (stryMutAct_9fa48("703")) {
        {}
      } else {
        stryCov_9fa48("703");
        console.error(stryMutAct_9fa48("704") ? "" : (stryCov_9fa48("704"), 'Got a 200, but no status.response.output'), result.status, url);
        return null;
      }
    }
    return stryMutAct_9fa48("705") ? {} : (stryCov_9fa48("705"), {
      ...result.status[0].response.output[0],
      taskId: result.id
    });
  }
}
function roundedScore(score: number) {
  if (stryMutAct_9fa48("706")) {
    {}
  } else {
    stryCov_9fa48("706");
    return stryMutAct_9fa48("707") ? -score.toFixed(6) : (stryCov_9fa48("707"), +score.toFixed(6));
  }
}
export function mergeAnnotations(outputs: HiveOutput[]): HiveModerationResult {
  if (stryMutAct_9fa48("708")) {
    {}
  } else {
    stryCov_9fa48("708");
    const adultScores: number[] = stryMutAct_9fa48("709") ? ["Stryker was here"] : (stryCov_9fa48("709"), []);
    const suggestiveScores: number[] = stryMutAct_9fa48("710") ? ["Stryker was here"] : (stryCov_9fa48("710"), []);
    const violentScores: number[] = stryMutAct_9fa48("711") ? ["Stryker was here"] : (stryCov_9fa48("711"), []);
    const taskIds: string[] = stryMutAct_9fa48("712") ? ["Stryker was here"] : (stryCov_9fa48("712"), []);
    outputs.forEach(output => {
      if (stryMutAct_9fa48("713")) {
        {}
      } else {
        stryCov_9fa48("713");
        taskIds.push(output.taskId);
        const nsfwScore = (output.classes.find(cls => cls.class === "general_nsfw") as HiveClass).score;
        if (stryMutAct_9fa48("715") ? false : stryMutAct_9fa48("714") ? true : (stryCov_9fa48("714", "715"), nsfwScore)) {
          if (stryMutAct_9fa48("716")) {
            {}
          } else {
            stryCov_9fa48("716");
            adultScores.push(roundedScore(nsfwScore));
          }
        }
        const suggestiveScore = (output.classes.find(cls => cls.class === "general_suggestive") as HiveClass).score;
        if (stryMutAct_9fa48("718") ? false : stryMutAct_9fa48("717") ? true : (stryCov_9fa48("717", "718"), suggestiveScore)) {
          if (stryMutAct_9fa48("719")) {
            {}
          } else {
            stryCov_9fa48("719");
            suggestiveScores.push(roundedScore(suggestiveScore));
          }
        }
        const bloodyScore = (output.classes.find(cls => cls.class === "very_bloody") as HiveClass).score;
        if (stryMutAct_9fa48("721") ? false : stryMutAct_9fa48("720") ? true : (stryCov_9fa48("720", "721"), bloodyScore)) {
          if (stryMutAct_9fa48("722")) {
            {}
          } else {
            stryCov_9fa48("722");
            violentScores.push(roundedScore(bloodyScore));
          }
        }
      }
    });
    const combined: ModerationScores = stryMutAct_9fa48("723") ? {} : (stryCov_9fa48("723"), {
      adult: adultScores.length ? stryMutAct_9fa48("724") ? Math.min(...adultScores) : (stryCov_9fa48("724"), Math.max(...adultScores)) : undefined,
      suggestive: suggestiveScores.length ? stryMutAct_9fa48("725") ? Math.min(...suggestiveScores) : (stryCov_9fa48("725"), Math.max(...suggestiveScores)) : undefined,
      violent: violentScores.length ? stryMutAct_9fa48("726") ? Math.min(...violentScores) : (stryCov_9fa48("726"), Math.max(...violentScores)) : undefined
    });
    return stryMutAct_9fa48("727") ? {} : (stryCov_9fa48("727"), {
      taskIds: taskIds,
      scores: combined
    });
  }
}
export async function getScores({
  playbackId,
  duration
}: {
  playbackId: string;
  duration: number;
}): Promise<HiveModerationResult | undefined> {
  if (stryMutAct_9fa48("728")) {
    {}
  } else {
    stryCov_9fa48("728");
    if (stryMutAct_9fa48("731") ? false : stryMutAct_9fa48("730") ? true : stryMutAct_9fa48("729") ? isEnabled() : (stryCov_9fa48("729", "730", "731"), !isEnabled())) {
      if (stryMutAct_9fa48("732")) {
        {}
      } else {
        stryCov_9fa48("732");
        console.log(stryMutAct_9fa48("733") ? "" : (stryCov_9fa48("733"), 'Skipping moderation-hive, no key enabled'));
        return undefined;
      }
    }
    const files = getThumbnailUrls(stryMutAct_9fa48("734") ? {} : (stryCov_9fa48("734"), {
      playbackId,
      duration
    }));
    const outputs = await Promise.all(files.map(stryMutAct_9fa48("735") ? () => undefined : (stryCov_9fa48("735"), file => fetchOutputForUrl(file))));
    /*
     * Filter out nulls to make typescript happy
     */
    const outputsFiltered = outputs.filter(a => !!a) as HiveOutput[];
    return mergeAnnotations(outputsFiltered);
  }
}