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
import { getThumbnailUrls } from './moderation-utils';
test(stryMutAct_9fa48("736") ? "" : (stryCov_9fa48("736"), 'gets 3 urls that are within the duration range'), async () => {
  if (stryMutAct_9fa48("737")) {
    {}
  } else {
    stryCov_9fa48("737");
    const duration = 30;
    const files = getThumbnailUrls(stryMutAct_9fa48("738") ? {} : (stryCov_9fa48("738"), {
      playbackId: stryMutAct_9fa48("739") ? "" : (stryCov_9fa48("739"), '123'),
      duration
    }));
    expect(files.length).toEqual(5);
    const urls = files.map(stryMutAct_9fa48("740") ? () => undefined : (stryCov_9fa48("740"), file => new URL(file)));
    urls.forEach(url => {
      if (stryMutAct_9fa48("741")) {
        {}
      } else {
        stryCov_9fa48("741");
        const time = stryMutAct_9fa48("742") ? -(url.searchParams.get('time') as string) : (stryCov_9fa48("742"), +(url.searchParams.get('time') as string));
        expect(time).toBeGreaterThan(0);
        expect(time).toBeLessThan(duration);
      }
    });
    const [url1, url2, url3, url4, url5] = urls;
    expect(stryMutAct_9fa48("743") ? -(url1.searchParams.get('time') as string) : (stryCov_9fa48("743"), +(url1.searchParams.get('time') as string))).toBeLessThan(stryMutAct_9fa48("744") ? -(url2.searchParams.get('time') as string) : (stryCov_9fa48("744"), +(url2.searchParams.get('time') as string)));
    expect(stryMutAct_9fa48("745") ? -(url2.searchParams.get('time') as string) : (stryCov_9fa48("745"), +(url2.searchParams.get('time') as string))).toBeLessThan(stryMutAct_9fa48("746") ? -(url3.searchParams.get('time') as string) : (stryCov_9fa48("746"), +(url3.searchParams.get('time') as string)));
    expect(stryMutAct_9fa48("747") ? -(url3.searchParams.get('time') as string) : (stryCov_9fa48("747"), +(url3.searchParams.get('time') as string))).toBeLessThan(stryMutAct_9fa48("748") ? -(url4.searchParams.get('time') as string) : (stryCov_9fa48("748"), +(url4.searchParams.get('time') as string)));
    expect(stryMutAct_9fa48("749") ? -(url4.searchParams.get('time') as string) : (stryCov_9fa48("749"), +(url4.searchParams.get('time') as string))).toBeLessThan(stryMutAct_9fa48("750") ? -(url5.searchParams.get('time') as string) : (stryCov_9fa48("750"), +(url5.searchParams.get('time') as string)));
  }
});