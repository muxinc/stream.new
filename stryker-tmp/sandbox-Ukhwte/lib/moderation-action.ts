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
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    if (stryMutAct_9fa48("3") ? process.env.AIRTABLE_KEY || process.env.AIRTABLE_BASE_ID : stryMutAct_9fa48("2") ? false : stryMutAct_9fa48("1") ? true : (stryCov_9fa48("1", "2", "3"), process.env.AIRTABLE_KEY && process.env.AIRTABLE_BASE_ID)) {
      if (stryMutAct_9fa48("4")) {
        {}
      } else {
        stryCov_9fa48("4");
        try {
          if (stryMutAct_9fa48("5")) {
            {}
          } else {
            stryCov_9fa48("5");
            await got.post(stryMutAct_9fa48("6") ? `` : (stryCov_9fa48("6"), `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Auto Deleted`), stryMutAct_9fa48("7") ? {} : (stryCov_9fa48("7"), {
              headers: stryMutAct_9fa48("8") ? {} : (stryCov_9fa48("8"), {
                Authorization: stryMutAct_9fa48("9") ? `` : (stryCov_9fa48("9"), `Bearer ${process.env.AIRTABLE_KEY}`)
              }),
              json: stryMutAct_9fa48("10") ? {} : (stryCov_9fa48("10"), {
                records: stryMutAct_9fa48("11") ? [] : (stryCov_9fa48("11"), [stryMutAct_9fa48("12") ? {} : (stryCov_9fa48("12"), {
                  fields: stryMutAct_9fa48("13") ? {} : (stryCov_9fa48("13"), {
                    assetId,
                    notes
                  })
                })])
              })
            }));
          }
        } catch (e) {
          if (stryMutAct_9fa48("14")) {
            {}
          } else {
            stryCov_9fa48("14");
            const err = e as RequestError;
            console.error(stryMutAct_9fa48("15") ? "" : (stryCov_9fa48("15"), 'Error reporting to airtable'), stryMutAct_9fa48("16") ? err.response.body : (stryCov_9fa48("16"), err.response?.body), e); // eslint-disable-line no-console
          }
        }
      }
    }
  }
}
function shouldAutoDeleteContent(hiveScores?: ModerationScores): boolean {
  if (stryMutAct_9fa48("17")) {
    {}
  } else {
    stryCov_9fa48("17");
    const isAdult = stryMutAct_9fa48("20") ? hiveScores && hiveScores.adult && hiveScores.adult >= ADULT_SCORE_THRESHHOLD && false : stryMutAct_9fa48("19") ? false : stryMutAct_9fa48("18") ? true : (stryCov_9fa48("18", "19", "20"), (stryMutAct_9fa48("22") ? hiveScores && hiveScores.adult || hiveScores.adult >= ADULT_SCORE_THRESHHOLD : stryMutAct_9fa48("21") ? false : (stryCov_9fa48("21", "22"), (stryMutAct_9fa48("24") ? hiveScores || hiveScores.adult : stryMutAct_9fa48("23") ? true : (stryCov_9fa48("23", "24"), hiveScores && hiveScores.adult)) && (stryMutAct_9fa48("27") ? hiveScores.adult < ADULT_SCORE_THRESHHOLD : stryMutAct_9fa48("26") ? hiveScores.adult > ADULT_SCORE_THRESHHOLD : stryMutAct_9fa48("25") ? true : (stryCov_9fa48("25", "26", "27"), hiveScores.adult >= ADULT_SCORE_THRESHHOLD)))) || (stryMutAct_9fa48("28") ? true : (stryCov_9fa48("28"), false)));
    const isViolent = stryMutAct_9fa48("31") ? hiveScores && hiveScores.violent && hiveScores.violent >= VIOLENCE_SCORE_THRESHHOLD && false : stryMutAct_9fa48("30") ? false : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30", "31"), (stryMutAct_9fa48("33") ? hiveScores && hiveScores.violent || hiveScores.violent >= VIOLENCE_SCORE_THRESHHOLD : stryMutAct_9fa48("32") ? false : (stryCov_9fa48("32", "33"), (stryMutAct_9fa48("35") ? hiveScores || hiveScores.violent : stryMutAct_9fa48("34") ? true : (stryCov_9fa48("34", "35"), hiveScores && hiveScores.violent)) && (stryMutAct_9fa48("38") ? hiveScores.violent < VIOLENCE_SCORE_THRESHHOLD : stryMutAct_9fa48("37") ? hiveScores.violent > VIOLENCE_SCORE_THRESHHOLD : stryMutAct_9fa48("36") ? true : (stryCov_9fa48("36", "37", "38"), hiveScores.violent >= VIOLENCE_SCORE_THRESHHOLD)))) || (stryMutAct_9fa48("39") ? true : (stryCov_9fa48("39"), false)));
    return stryMutAct_9fa48("42") ? isAdult && isViolent : stryMutAct_9fa48("41") ? false : stryMutAct_9fa48("40") ? true : (stryCov_9fa48("40", "41", "42"), isAdult || isViolent);
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
  if (stryMutAct_9fa48("43")) {
    {}
  } else {
    stryCov_9fa48("43");
    if (stryMutAct_9fa48("45") ? false : stryMutAct_9fa48("44") ? true : (stryCov_9fa48("44", "45"), shouldAutoDeleteContent(hiveScores))) {
      if (stryMutAct_9fa48("46")) {
        {}
      } else {
        stryCov_9fa48("46");
        await mux.video.assets.deletePlaybackId(assetId, playbackId);
        await saveDeletionRecordInAirtable(stryMutAct_9fa48("47") ? {} : (stryCov_9fa48("47"), {
          assetId,
          notes: JSON.stringify(hiveScores)
        }));
        return stryMutAct_9fa48("48") ? false : (stryCov_9fa48("48"), true);
      }
    }
    return stryMutAct_9fa48("49") ? true : (stryCov_9fa48("49"), false);
  }
}