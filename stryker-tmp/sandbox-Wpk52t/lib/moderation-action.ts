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
import { ModerationScores } from '../types';
import Mux from '@mux/mux-node';
import { RequestError } from 'got';
import got from './got-client';
const mux = new Mux();
const ADULT_SCORE_THRESHHOLD = 0.95;
const VIOLENCE_SCORE_THRESHHOLD = 0.85;
async function saveDeletionRecordInAirtable({
  assetId,
  notes
}: {
  assetId: string;
  notes: string;
}) {
  if (stryMutAct_9fa48("546")) {
    {}
  } else {
    stryCov_9fa48("546");
    if (stryMutAct_9fa48("549") ? process.env.AIRTABLE_KEY || process.env.AIRTABLE_BASE_ID : stryMutAct_9fa48("548") ? false : stryMutAct_9fa48("547") ? true : (stryCov_9fa48("547", "548", "549"), process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID)) {
      if (stryMutAct_9fa48("550")) {
        {}
      } else {
        stryCov_9fa48("550");
        try {
          if (stryMutAct_9fa48("551")) {
            {}
          } else {
            stryCov_9fa48("551");
            await got.post(stryMutAct_9fa48("552") ? `` : (stryCov_9fa48("552"), `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Auto Deleted`), stryMutAct_9fa48("553") ? {} : (stryCov_9fa48("553"), {
              headers: stryMutAct_9fa48("554") ? {} : (stryCov_9fa48("554"), {
                Authorization: stryMutAct_9fa48("555") ? `` : (stryCov_9fa48("555"), `Bearer ${process.env.AIRTABLE_KEY}`)
              }),
              json: stryMutAct_9fa48("556") ? {} : (stryCov_9fa48("556"), {
                records: stryMutAct_9fa48("557") ? [] : (stryCov_9fa48("557"), [stryMutAct_9fa48("558") ? {} : (stryCov_9fa48("558"), {
                  fields: stryMutAct_9fa48("559") ? {} : (stryCov_9fa48("559"), {
                    assetId,
                    notes
                  })
                })])
              })
            }));
          }
        } catch (e) {
          if (stryMutAct_9fa48("560")) {
            {}
          } else {
            stryCov_9fa48("560");
            const err = e as RequestError;
            console.error(stryMutAct_9fa48("561") ? "" : (stryCov_9fa48("561"), 'Error reporting to airtable'), stryMutAct_9fa48("562") ? err.response.body : (stryCov_9fa48("562"), err.response?.body), e); // eslint-disable-line no-console
          }
        }
      }
    }
  }
}
function shouldAutoDeleteContent(hiveScores?: ModerationScores): boolean {
  if (stryMutAct_9fa48("563")) {
    {}
  } else {
    stryCov_9fa48("563");
    const isAdult = stryMutAct_9fa48("566") ? hiveScores && hiveScores.adult && hiveScores.adult >= ADULT_SCORE_THRESHHOLD && false : stryMutAct_9fa48("565") ? false : stryMutAct_9fa48("564") ? true : (stryCov_9fa48("564", "565", "566"), (stryMutAct_9fa48("568") ? hiveScores && hiveScores.adult || hiveScores.adult >= ADULT_SCORE_THRESHHOLD : stryMutAct_9fa48("567") ? false : (stryCov_9fa48("567", "568"), (stryMutAct_9fa48("570") ? hiveScores || hiveScores.adult : stryMutAct_9fa48("569") ? true : (stryCov_9fa48("569", "570"), hiveScores && hiveScores.adult)) && (stryMutAct_9fa48("573") ? hiveScores.adult < ADULT_SCORE_THRESHHOLD : stryMutAct_9fa48("572") ? hiveScores.adult > ADULT_SCORE_THRESHHOLD : stryMutAct_9fa48("571") ? true : (stryCov_9fa48("571", "572", "573"), hiveScores.adult >= ADULT_SCORE_THRESHHOLD)))) || (stryMutAct_9fa48("574") ? true : (stryCov_9fa48("574"), false)));
    const isViolent = stryMutAct_9fa48("577") ? hiveScores && hiveScores.violent && hiveScores.violent >= VIOLENCE_SCORE_THRESHHOLD && false : stryMutAct_9fa48("576") ? false : stryMutAct_9fa48("575") ? true : (stryCov_9fa48("575", "576", "577"), (stryMutAct_9fa48("579") ? hiveScores && hiveScores.violent || hiveScores.violent >= VIOLENCE_SCORE_THRESHHOLD : stryMutAct_9fa48("578") ? false : (stryCov_9fa48("578", "579"), (stryMutAct_9fa48("581") ? hiveScores || hiveScores.violent : stryMutAct_9fa48("580") ? true : (stryCov_9fa48("580", "581"), hiveScores && hiveScores.violent)) && (stryMutAct_9fa48("584") ? hiveScores.violent < VIOLENCE_SCORE_THRESHHOLD : stryMutAct_9fa48("583") ? hiveScores.violent > VIOLENCE_SCORE_THRESHHOLD : stryMutAct_9fa48("582") ? true : (stryCov_9fa48("582", "583", "584"), hiveScores.violent >= VIOLENCE_SCORE_THRESHHOLD)))) || (stryMutAct_9fa48("585") ? true : (stryCov_9fa48("585"), false)));
    return stryMutAct_9fa48("588") ? isAdult && isViolent : stryMutAct_9fa48("587") ? false : stryMutAct_9fa48("586") ? true : (stryCov_9fa48("586", "587", "588"), isAdult || isViolent);
  }
}
export async function autoDelete({
  assetId,
  playbackId,
  hiveScores
}: {
  assetId: string;
  playbackId: string;
  hiveScores: ModerationScores;
}): Promise<boolean> {
  if (stryMutAct_9fa48("589")) {
    {}
  } else {
    stryCov_9fa48("589");
    if (stryMutAct_9fa48("591") ? false : stryMutAct_9fa48("590") ? true : (stryCov_9fa48("590", "591"), shouldAutoDeleteContent(hiveScores))) {
      if (stryMutAct_9fa48("592")) {
        {}
      } else {
        stryCov_9fa48("592");
        await mux.video.assets.deletePlaybackId(assetId, playbackId);
        await saveDeletionRecordInAirtable(stryMutAct_9fa48("593") ? {} : (stryCov_9fa48("593"), {
          assetId,
          notes: JSON.stringify(hiveScores)
        }));
        return stryMutAct_9fa48("594") ? false : (stryCov_9fa48("594"), true);
      }
    }
    return stryMutAct_9fa48("595") ? true : (stryCov_9fa48("595"), false);
  }
}