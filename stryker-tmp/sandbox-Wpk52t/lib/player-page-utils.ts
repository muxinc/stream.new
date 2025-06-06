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
  if (stryMutAct_9fa48("760")) {
    {}
  } else {
    stryCov_9fa48("760");
    // NOTE: Would prefer to use a HEAD method request, but these appear to be not allowed (status 405) from Mux Video (CJP)
    return fetch(stryMutAct_9fa48("761") ? `` : (stryCov_9fa48("761"), `${getStreamBaseUrl()}/${playbackId}.m3u8`)).then(resp => {
      if (stryMutAct_9fa48("762")) {
        {}
      } else {
        stryCov_9fa48("762");
        return stryMutAct_9fa48("765") ? resp.status >= 200 || resp.status <= 399 : stryMutAct_9fa48("764") ? false : stryMutAct_9fa48("763") ? true : (stryCov_9fa48("763", "764", "765"), (stryMutAct_9fa48("768") ? resp.status < 200 : stryMutAct_9fa48("767") ? resp.status > 200 : stryMutAct_9fa48("766") ? true : (stryCov_9fa48("766", "767", "768"), resp.status >= 200)) && (stryMutAct_9fa48("771") ? resp.status > 399 : stryMutAct_9fa48("770") ? resp.status < 399 : stryMutAct_9fa48("769") ? true : (stryCov_9fa48("769", "770", "771"), resp.status <= 399)));
      }
    });
  }
};
export async function getPropsFromPlaybackId(playbackId: string): Promise<Props> {
  if (stryMutAct_9fa48("772")) {
    {}
  } else {
    stryCov_9fa48("772");
    const poster = stryMutAct_9fa48("773") ? `` : (stryCov_9fa48("773"), `${getImageBaseUrl()}/${playbackId}/thumbnail.jpg`);
    const shareUrl = stryMutAct_9fa48("774") ? `` : (stryCov_9fa48("774"), `${HOST_URL}/v/${playbackId}`);
    const dimensions = await getImageDimensions(playbackId);
    let blurDataURL;
    try {
      if (stryMutAct_9fa48("775")) {
        {}
      } else {
        stryCov_9fa48("775");
        blurDataURL = (await createBlurUp(playbackId, {})).blurDataURL;
      }
    } catch (e) {
      if (stryMutAct_9fa48("776")) {
        {}
      } else {
        stryCov_9fa48("776");
        console.error(stryMutAct_9fa48("777") ? "" : (stryCov_9fa48("777"), 'Error fetching blurup'), e);
      }
    }
    const videoExists = await getVideoExistsAsync(playbackId);
    const props: Props = stryMutAct_9fa48("778") ? {} : (stryCov_9fa48("778"), {
      blurDataURL,
      playbackId,
      shareUrl,
      poster,
      videoExists
    });
    if (stryMutAct_9fa48("781") ? dimensions.aspectRatio : stryMutAct_9fa48("780") ? false : stryMutAct_9fa48("779") ? true : (stryCov_9fa48("779", "780", "781"), dimensions?.aspectRatio)) {
      if (stryMutAct_9fa48("782")) {
        {}
      } else {
        stryCov_9fa48("782");
        props.aspectRatio = dimensions.aspectRatio;
      }
    }
    return props;
  }
}