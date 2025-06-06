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
import { getImageDimensions } from './image-dimensions';
//  no types yet
import { createBlurUp } from '@mux/blurup';
import { getImageBaseUrl, getStreamBaseUrl } from './urlutils';
import { HOST_URL } from '../constants';
import type { PlayerTypes } from '../constants';
export type Props = {
  blurDataURL?: string;
  playbackId: string;
  shareUrl: string;
  poster: string;
  aspectRatio?: number;
  videoExists: boolean;
  playerType?: PlayerTypes;
};
const getVideoExistsAsync = async (playbackId: string) => {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    // NOTE: Would prefer to use a HEAD method request, but these appear to be not allowed (status 405) from Mux Video (CJP)
    return fetch(stryMutAct_9fa48("1") ? `` : (stryCov_9fa48("1"), `${getStreamBaseUrl()}/${playbackId}.m3u8`)).then(resp => {
      if (stryMutAct_9fa48("2")) {
        {}
      } else {
        stryCov_9fa48("2");
        return stryMutAct_9fa48("5") ? resp.status >= 200 || resp.status <= 399 : stryMutAct_9fa48("4") ? false : stryMutAct_9fa48("3") ? true : (stryCov_9fa48("3", "4", "5"), (stryMutAct_9fa48("8") ? resp.status < 200 : stryMutAct_9fa48("7") ? resp.status > 200 : stryMutAct_9fa48("6") ? true : (stryCov_9fa48("6", "7", "8"), resp.status >= 200)) && (stryMutAct_9fa48("11") ? resp.status > 399 : stryMutAct_9fa48("10") ? resp.status < 399 : stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9", "10", "11"), resp.status <= 399)));
      }
    });
  }
};
export async function getPropsFromPlaybackId(playbackId: string): Promise<Props> {
  if (stryMutAct_9fa48("12")) {
    {}
  } else {
    stryCov_9fa48("12");
    const poster = stryMutAct_9fa48("13") ? `` : (stryCov_9fa48("13"), `${getImageBaseUrl()}/${playbackId}/thumbnail.jpg`);
    const shareUrl = stryMutAct_9fa48("14") ? `` : (stryCov_9fa48("14"), `${HOST_URL}/v/${playbackId}`);
    const dimensions = await getImageDimensions(playbackId);
    let blurDataURL;
    try {
      if (stryMutAct_9fa48("15")) {
        {}
      } else {
        stryCov_9fa48("15");
        blurDataURL = (await createBlurUp(playbackId, {})).blurDataURL;
      }
    } catch (e) {
      if (stryMutAct_9fa48("16")) {
        {}
      } else {
        stryCov_9fa48("16");
        console.error(stryMutAct_9fa48("17") ? "" : (stryCov_9fa48("17"), 'Error fetching blurup'), e);
      }
    }
    const videoExists = await getVideoExistsAsync(playbackId);
    const props: Props = stryMutAct_9fa48("18") ? {} : (stryCov_9fa48("18"), {
      blurDataURL,
      playbackId,
      shareUrl,
      poster,
      videoExists
    });
    if (stryMutAct_9fa48("21") ? dimensions.aspectRatio : stryMutAct_9fa48("20") ? false : stryMutAct_9fa48("19") ? true : (stryCov_9fa48("19", "20", "21"), dimensions?.aspectRatio)) {
      if (stryMutAct_9fa48("22")) {
        {}
      } else {
        stryCov_9fa48("22");
        props.aspectRatio = dimensions.aspectRatio;
      }
    }
    return props;
  }
}