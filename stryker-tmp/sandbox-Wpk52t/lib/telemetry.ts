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
export type ChunkInfo = {
  size: number;
  uploadStarted: number;
  uploadFinished?: number;
};
export type UploadTelemetry = {
  uploadId?: string;
  message?: string;
  fileSize?: number;
  uploadStarted?: number;
  uploadFinished?: number;
  uploadErrored?: boolean;
  dynamicChunkSize?: boolean;
  chunkSize?: number;
  chunks: ChunkInfo[];
};
export function reportUploadTelemetry(data: UploadTelemetry) {
  if (stryMutAct_9fa48("783")) {
    {}
  } else {
    stryCov_9fa48("783");
    fetch(stryMutAct_9fa48("784") ? "" : (stryCov_9fa48("784"), '/api/telemetry'), stryMutAct_9fa48("785") ? {} : (stryCov_9fa48("785"), {
      method: stryMutAct_9fa48("786") ? "" : (stryCov_9fa48("786"), 'POST'),
      headers: stryMutAct_9fa48("787") ? {} : (stryCov_9fa48("787"), {
        'Content-Type': stryMutAct_9fa48("788") ? "" : (stryCov_9fa48("788"), 'application/json')
      }),
      body: JSON.stringify(stryMutAct_9fa48("789") ? {} : (stryCov_9fa48("789"), {
        type: stryMutAct_9fa48("790") ? "" : (stryCov_9fa48("790"), 'upload'),
        data
      }))
    }));
  }
}