/**
 * @jest-environment node
 */
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
import { getScores } from './moderation-hive';
import nock from 'nock';
beforeEach(() => {
  if (stryMutAct_9fa48("648")) {
    {}
  } else {
    stryCov_9fa48("648");
    nock.disableNetConnect();
  }
});
function nockNsfwScore({
  adult,
  suggestive,
  veryBloody
}: {
  adult: number;
  suggestive: number;
  veryBloody: number;
}) {
  if (stryMutAct_9fa48("649")) {
    {}
  } else {
    stryCov_9fa48("649");
    return nock(stryMutAct_9fa48("650") ? "" : (stryCov_9fa48("650"), 'https://api.thehive.ai/api/v2')).post(stryMutAct_9fa48("651") ? "" : (stryCov_9fa48("651"), '/task/sync')).reply(200, stryMutAct_9fa48("652") ? {} : (stryCov_9fa48("652"), {
      code: 200,
      status: stryMutAct_9fa48("653") ? [] : (stryCov_9fa48("653"), [stryMutAct_9fa48("654") ? {} : (stryCov_9fa48("654"), {
        response: stryMutAct_9fa48("655") ? {} : (stryCov_9fa48("655"), {
          output: stryMutAct_9fa48("656") ? [] : (stryCov_9fa48("656"), [stryMutAct_9fa48("657") ? {} : (stryCov_9fa48("657"), {
            time: 0,
            classes: stryMutAct_9fa48("658") ? [] : (stryCov_9fa48("658"), [stryMutAct_9fa48("659") ? {} : (stryCov_9fa48("659"), {
              class: stryMutAct_9fa48("660") ? "" : (stryCov_9fa48("660"), "general_nsfw"),
              score: adult
            }), stryMutAct_9fa48("661") ? {} : (stryCov_9fa48("661"), {
              class: stryMutAct_9fa48("662") ? "" : (stryCov_9fa48("662"), "general_suggestive"),
              score: suggestive
            }), stryMutAct_9fa48("663") ? {} : (stryCov_9fa48("663"), {
              class: stryMutAct_9fa48("664") ? "" : (stryCov_9fa48("664"), "very_bloody"),
              score: veryBloody
            })])
          })])
        })
      })])
    }));
  }
}
test(stryMutAct_9fa48("665") ? "" : (stryCov_9fa48("665"), 'gets a combined score for 3 files'), async () => {
  if (stryMutAct_9fa48("666")) {
    {}
  } else {
    stryCov_9fa48("666");
    const scopeUrl1 = nockNsfwScore(stryMutAct_9fa48("667") ? {} : (stryCov_9fa48("667"), {
      adult: 0.9925124,
      suggestive: 0.1123,
      veryBloody: 0.123
    }));
    const scopeUrl2 = nockNsfwScore(stryMutAct_9fa48("668") ? {} : (stryCov_9fa48("668"), {
      adult: 0.881235,
      suggestive: 0.79251,
      veryBloody: 0.134
    }));
    const scopeUrl3 = nockNsfwScore(stryMutAct_9fa48("669") ? {} : (stryCov_9fa48("669"), {
      adult: 0.0389421,
      suggestive: 0.00482,
      veryBloody: 0.456
    }));
    const scopeUrl4 = nockNsfwScore(stryMutAct_9fa48("670") ? {} : (stryCov_9fa48("670"), {
      adult: 0.0389421,
      suggestive: 0.00482,
      veryBloody: 0.456
    }));
    const scopeUrl5 = nockNsfwScore(stryMutAct_9fa48("671") ? {} : (stryCov_9fa48("671"), {
      adult: 0.0389421,
      suggestive: 0.00482,
      veryBloody: 0.456
    }));
    const scores = await getScores(stryMutAct_9fa48("672") ? {} : (stryCov_9fa48("672"), {
      playbackId: stryMutAct_9fa48("673") ? "" : (stryCov_9fa48("673"), '123'),
      duration: 30
    }));
    expect(stryMutAct_9fa48("674") ? scores.scores.adult : (stryCov_9fa48("674"), scores?.scores.adult)).toEqual(0.992512);
    expect(stryMutAct_9fa48("675") ? scores.scores.suggestive : (stryCov_9fa48("675"), scores?.scores.suggestive)).toEqual(0.79251);
    expect(stryMutAct_9fa48("676") ? scores.scores.violent : (stryCov_9fa48("676"), scores?.scores.violent)).toEqual(0.456);
    expect(scopeUrl1.isDone()).toEqual(stryMutAct_9fa48("677") ? false : (stryCov_9fa48("677"), true));
    expect(scopeUrl2.isDone()).toEqual(stryMutAct_9fa48("678") ? false : (stryCov_9fa48("678"), true));
    expect(scopeUrl3.isDone()).toEqual(stryMutAct_9fa48("679") ? false : (stryCov_9fa48("679"), true));
    expect(scopeUrl4.isDone()).toEqual(stryMutAct_9fa48("680") ? false : (stryCov_9fa48("680"), true));
    expect(scopeUrl5.isDone()).toEqual(stryMutAct_9fa48("681") ? false : (stryCov_9fa48("681"), true));
  }
});