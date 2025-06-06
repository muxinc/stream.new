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
import client, { isEnabled } from './google-vision-client';
import { ModerationScores } from '../types';
import { getThumbnailUrls } from './moderation-utils';

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
  adult?: Likelihood | null;
  spoof?: Likelihood | null;
  medical?: Likelihood | null;
  violence?: Likelihood | null;
  racy?: Likelihood | null;
};
const ENUM_TO_VAL = stryMutAct_9fa48("608") ? {} : (stryCov_9fa48("608"), {
  UNKNOWN: null,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5
});
async function fetchAnnotationsForUrl(url: string): Promise<SafeSearchAnnotation | null> {
  if (stryMutAct_9fa48("609")) {
    {}
  } else {
    stryCov_9fa48("609");
    let result;
    try {
      if (stryMutAct_9fa48("610")) {
        {}
      } else {
        stryCov_9fa48("610");
        result = (await client.safeSearchDetection(url))[0];
      }
    } catch (e) {
      if (stryMutAct_9fa48("611")) {
        {}
      } else {
        stryCov_9fa48("611");
        console.error(stryMutAct_9fa48("612") ? "" : (stryCov_9fa48("612"), 'Error with client.safeSearchDetection'), e);
        return null;
      }
    }
    if (stryMutAct_9fa48("614") ? false : stryMutAct_9fa48("613") ? true : (stryCov_9fa48("613", "614"), result.error)) {
      if (stryMutAct_9fa48("615")) {
        {}
      } else {
        stryCov_9fa48("615");
        console.error(stryMutAct_9fa48("616") ? "" : (stryCov_9fa48("616"), 'Error detecting scores for google'), url);
        return null;
      }
    }
    const detections = result.safeSearchAnnotation;
    if (stryMutAct_9fa48("619") ? false : stryMutAct_9fa48("618") ? true : stryMutAct_9fa48("617") ? detections : (stryCov_9fa48("617", "618", "619"), !detections)) {
      if (stryMutAct_9fa48("620")) {
        {}
      } else {
        stryCov_9fa48("620");
        console.error(stryMutAct_9fa48("621") ? "" : (stryCov_9fa48("621"), 'No detections'), url);
        return null;
      }
    }
    return detections as SafeSearchAnnotation;
  }
}
export function mergeAnnotations(annotations: SafeSearchAnnotation[]): ModerationScores {
  if (stryMutAct_9fa48("622")) {
    {}
  } else {
    stryCov_9fa48("622");
    const adultScores: number[] = stryMutAct_9fa48("623") ? ["Stryker was here"] : (stryCov_9fa48("623"), []);
    const violenceScores: number[] = stryMutAct_9fa48("624") ? ["Stryker was here"] : (stryCov_9fa48("624"), []);
    const racyScores: number[] = stryMutAct_9fa48("625") ? ["Stryker was here"] : (stryCov_9fa48("625"), []);
    annotations.forEach(annotation => {
      if (stryMutAct_9fa48("626")) {
        {}
      } else {
        stryCov_9fa48("626");
        if (stryMutAct_9fa48("628") ? false : stryMutAct_9fa48("627") ? true : (stryCov_9fa48("627", "628"), annotation.adult)) {
          if (stryMutAct_9fa48("629")) {
            {}
          } else {
            stryCov_9fa48("629");
            adultScores.push(ENUM_TO_VAL[annotation.adult] as number);
          }
        }
        if (stryMutAct_9fa48("631") ? false : stryMutAct_9fa48("630") ? true : (stryCov_9fa48("630", "631"), annotation.violence)) {
          if (stryMutAct_9fa48("632")) {
            {}
          } else {
            stryCov_9fa48("632");
            violenceScores.push(ENUM_TO_VAL[annotation.violence] as number);
          }
        }
        if (stryMutAct_9fa48("634") ? false : stryMutAct_9fa48("633") ? true : (stryCov_9fa48("633", "634"), annotation.racy)) {
          if (stryMutAct_9fa48("635")) {
            {}
          } else {
            stryCov_9fa48("635");
            racyScores.push(ENUM_TO_VAL[annotation.racy] as number);
          }
        }
      }
    });
    const combined: ModerationScores = stryMutAct_9fa48("636") ? {} : (stryCov_9fa48("636"), {
      adult: adultScores.length ? stryMutAct_9fa48("637") ? Math.min(...adultScores) : (stryCov_9fa48("637"), Math.max(...adultScores)) : undefined,
      violent: violenceScores.length ? stryMutAct_9fa48("638") ? Math.min(...violenceScores) : (stryCov_9fa48("638"), Math.max(...violenceScores)) : undefined,
      suggestive: racyScores.length ? stryMutAct_9fa48("639") ? Math.min(...racyScores) : (stryCov_9fa48("639"), Math.max(...racyScores)) : undefined
    });
    return combined;
  }
}
export async function getScores({
  playbackId,
  duration
}: {
  playbackId: string;
  duration: number;
}): Promise<ModerationScores | undefined> {
  if (stryMutAct_9fa48("640")) {
    {}
  } else {
    stryCov_9fa48("640");
    if (stryMutAct_9fa48("643") ? false : stryMutAct_9fa48("642") ? true : stryMutAct_9fa48("641") ? isEnabled() : (stryCov_9fa48("641", "642", "643"), !isEnabled())) {
      if (stryMutAct_9fa48("644")) {
        {}
      } else {
        stryCov_9fa48("644");
        console.log(stryMutAct_9fa48("645") ? "" : (stryCov_9fa48("645"), 'Skipping moderation-google, no key enabled'));
        return;
      }
    }
    const files = getThumbnailUrls(stryMutAct_9fa48("646") ? {} : (stryCov_9fa48("646"), {
      playbackId,
      duration
    }));
    const annotations = await Promise.all(files.map(stryMutAct_9fa48("647") ? () => undefined : (stryCov_9fa48("647"), file => fetchAnnotationsForUrl(file))));
    /*
     * Filter out nulls to make typescript happy
     */
    const annotationsFiltered = annotations.filter(a => !!a) as SafeSearchAnnotation[];
    return mergeAnnotations(annotationsFiltered);
  }
}