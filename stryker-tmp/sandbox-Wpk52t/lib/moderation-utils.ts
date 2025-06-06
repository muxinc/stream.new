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
import { getImageBaseUrl } from './urlutils';
export function getThumbnailUrls({
  playbackId,
  duration
}: {
  playbackId: string;
  duration: number;
}): string[] {
  if (stryMutAct_9fa48("751")) {
    {}
  } else {
    stryCov_9fa48("751");
    /*
     * Get 5 thumbnails, weighted towards the middle of the content, based on the duration
     * TODO: Make this more dependent on the duration - this is wasteful for short video.
     */
    const timestamps = stryMutAct_9fa48("752") ? [] : (stryCov_9fa48("752"), [stryMutAct_9fa48("753") ? duration / 0.25 : (stryCov_9fa48("753"), duration * 0.25), stryMutAct_9fa48("754") ? duration / 0.33 : (stryCov_9fa48("754"), duration * 0.33), stryMutAct_9fa48("755") ? duration / 0.5 : (stryCov_9fa48("755"), duration * 0.5), stryMutAct_9fa48("756") ? duration / 0.66 : (stryCov_9fa48("756"), duration * 0.66), stryMutAct_9fa48("757") ? duration / 0.75 : (stryCov_9fa48("757"), duration * 0.75)]);
    const urls = timestamps.map(stryMutAct_9fa48("758") ? () => undefined : (stryCov_9fa48("758"), time => stryMutAct_9fa48("759") ? `` : (stryCov_9fa48("759"), `${getImageBaseUrl()}/${playbackId}/thumbnail.png?time=${time}`)));
    return urls;
  }
}