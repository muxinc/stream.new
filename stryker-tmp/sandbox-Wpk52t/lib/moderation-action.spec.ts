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
import { autoDelete } from './moderation-action';
import nock, { Scope } from 'nock';
const assetId = stryMutAct_9fa48("520") ? "" : (stryCov_9fa48("520"), 'asset-123');
const playbackId = stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), 'playback-123');
let scopeMux: Scope;
let scopeAirtable: Scope;
beforeEach(() => {
  if (stryMutAct_9fa48("522")) {
    {}
  } else {
    stryCov_9fa48("522");
    nock.disableNetConnect();
    scopeMux = nock(stryMutAct_9fa48("523") ? "" : (stryCov_9fa48("523"), 'https://api.mux.com/video/v1/')).delete(stryMutAct_9fa48("524") ? `` : (stryCov_9fa48("524"), `/assets/${assetId}/playback-ids/${playbackId}`)).reply(204);
    scopeAirtable = nock(stryMutAct_9fa48("525") ? "" : (stryCov_9fa48("525"), 'https://api.airtable.com/v0')).post(stryMutAct_9fa48("526") ? `` : (stryCov_9fa48("526"), `/${process.env.AIRTABLE_BASE_ID}/Auto%20Deleted`)).reply(200);
  }
});
test(stryMutAct_9fa48("527") ? "" : (stryCov_9fa48("527"), 'deletes the mux playback ID if adult >= 0.95'), async () => {
  if (stryMutAct_9fa48("528")) {
    {}
  } else {
    stryCov_9fa48("528");
    const hiveScores = stryMutAct_9fa48("529") ? {} : (stryCov_9fa48("529"), {
      adult: 0.99,
      suggestive: 0.11,
      violent: 0.234
    });
    const isDeleted = await autoDelete(stryMutAct_9fa48("530") ? {} : (stryCov_9fa48("530"), {
      assetId,
      playbackId,
      hiveScores
    }));
    expect(isDeleted).toEqual(stryMutAct_9fa48("531") ? false : (stryCov_9fa48("531"), true));
    expect(scopeMux.isDone()).toEqual(stryMutAct_9fa48("532") ? false : (stryCov_9fa48("532"), true));
    expect(scopeAirtable.isDone()).toEqual(stryMutAct_9fa48("533") ? false : (stryCov_9fa48("533"), true));
  }
});
test(stryMutAct_9fa48("534") ? "" : (stryCov_9fa48("534"), 'deletes the mux playback ID if violence >= 0.85'), async () => {
  if (stryMutAct_9fa48("535")) {
    {}
  } else {
    stryCov_9fa48("535");
    const hiveScores = stryMutAct_9fa48("536") ? {} : (stryCov_9fa48("536"), {
      adult: 0.78,
      suggestive: 0.11,
      violent: 0.91
    });
    const isDeleted = await autoDelete(stryMutAct_9fa48("537") ? {} : (stryCov_9fa48("537"), {
      assetId,
      playbackId,
      hiveScores
    }));
    expect(isDeleted).toEqual(stryMutAct_9fa48("538") ? false : (stryCov_9fa48("538"), true));
    expect(scopeMux.isDone()).toEqual(stryMutAct_9fa48("539") ? false : (stryCov_9fa48("539"), true));
    expect(scopeAirtable.isDone()).toEqual(stryMutAct_9fa48("540") ? false : (stryCov_9fa48("540"), true));
  }
});
test(stryMutAct_9fa48("541") ? "" : (stryCov_9fa48("541"), 'returns false if no autoDelete happened'), async () => {
  if (stryMutAct_9fa48("542")) {
    {}
  } else {
    stryCov_9fa48("542");
    const hiveScores = stryMutAct_9fa48("543") ? {} : (stryCov_9fa48("543"), {
      adult: 0.89,
      suggestive: 0.11,
      violent: 0.234
    });
    const isDeleted = await autoDelete(stryMutAct_9fa48("544") ? {} : (stryCov_9fa48("544"), {
      assetId,
      playbackId,
      hiveScores
    }));
    expect(isDeleted).toEqual(stryMutAct_9fa48("545") ? true : (stryCov_9fa48("545"), false));
  }
});