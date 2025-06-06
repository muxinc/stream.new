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
import { ReactNode } from 'react';
import Layout from './layout';
import { MUX_HOME_PAGE_URL } from '../constants';
type Props = {
  children: ReactNode;
};
const UploadPage: React.FC<Props> = ({
  children
}) => {
  if (stryMutAct_9fa48("515")) {
    {}
  } else {
    stryCov_9fa48("515");
    return <Layout title="stream.new" description="Upload a video and share a URL">
      <div className="wrapper">
        <div className="about-mux">
          <p>
            <a href={MUX_HOME_PAGE_URL} target="_blank" rel="noopener noreferrer">
              Mux
            </a>{stryMutAct_9fa48("516") ? "" : (stryCov_9fa48("516"), ' ')}
            provides APIs for developers working with video.
          </p>
          <p>
            Uploading a video uses the Mux{stryMutAct_9fa48("517") ? "" : (stryCov_9fa48("517"), ' ')}
            <a href="https://docs.mux.com/docs/direct-upload?utm_source=stream-new">
              direct upload API
            </a>
            . When the upload is complete your video will be processed by Mux
            and available for playback on a sharable URL.
          </p>
          <p>
            To learn more,{stryMutAct_9fa48("518") ? "" : (stryCov_9fa48("518"), ' ')}
            <a href="https://github.com/muxinc/examples/tree/master/stream.new" target="_blank" rel="noopener noreferrer">
              check out the source code on GitHub
            </a>
            .
          </p>
        </div>
        <div className="children">{children}</div>
      </div>
      <style jsx>{stryMutAct_9fa48("519") ? `` : (stryCov_9fa48("519"), `
        .about-mux {
          padding: 0 1rem 1.5rem 1rem;
          max-width: 600px;
        }
        .about-mux {
          line-height: 1.4rem;
        }
        .children {
          text-align: center;
          min-height: 230px;
        }
      `)}
      </style>
    </Layout>;
  }
};
export default UploadPage;