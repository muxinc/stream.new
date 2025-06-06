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
import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';
const mux = new Mux();
export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (stryMutAct_9fa48("791")) {
    {}
  } else {
    stryCov_9fa48("791");
    const {
      method
    } = req;
    switch (method) {
      case stryMutAct_9fa48("793") ? "" : (stryCov_9fa48("793"), 'POST'):
        if (stryMutAct_9fa48("792")) {} else {
          stryCov_9fa48("792");
          try {
            if (stryMutAct_9fa48("794")) {
              {}
            } else {
              stryCov_9fa48("794");
              const upload = await mux.video.uploads.create(stryMutAct_9fa48("795") ? {} : (stryCov_9fa48("795"), {
                new_asset_settings: stryMutAct_9fa48("796") ? {} : (stryCov_9fa48("796"), {
                  playback_policy: stryMutAct_9fa48("797") ? [] : (stryCov_9fa48("797"), [stryMutAct_9fa48("798") ? "" : (stryCov_9fa48("798"), 'public')])
                }),
                cors_origin: stryMutAct_9fa48("799") ? "" : (stryCov_9fa48("799"), '*')
              }));
              res.json(stryMutAct_9fa48("800") ? {} : (stryCov_9fa48("800"), {
                id: upload.id,
                url: upload.url
              }));
            }
          } catch (e) {
            if (stryMutAct_9fa48("801")) {
              {}
            } else {
              stryCov_9fa48("801");
              res.statusCode = 500;
              console.error(stryMutAct_9fa48("802") ? "" : (stryCov_9fa48("802"), 'Request error'), e); // eslint-disable-line no-console
              res.json(stryMutAct_9fa48("803") ? {} : (stryCov_9fa48("803"), {
                error: stryMutAct_9fa48("804") ? "" : (stryCov_9fa48("804"), 'Error creating upload')
              }));
            }
          }
          break;
        }
      default:
        if (stryMutAct_9fa48("805")) {} else {
          stryCov_9fa48("805");
          res.setHeader(stryMutAct_9fa48("806") ? "" : (stryCov_9fa48("806"), 'Allow'), stryMutAct_9fa48("807") ? [] : (stryCov_9fa48("807"), [stryMutAct_9fa48("808") ? "" : (stryCov_9fa48("808"), 'POST')]));
          res.status(405).end(stryMutAct_9fa48("809") ? `` : (stryCov_9fa48("809"), `Method ${method} Not Allowed`));
        }
    }
  }
};