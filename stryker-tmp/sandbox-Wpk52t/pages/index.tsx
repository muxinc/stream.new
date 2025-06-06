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
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Router from 'next/router';
import MuxUploader from '@mux/mux-uploader-react';
import type { MuxUploaderProps } from '@mux/mux-uploader-react';
import useSwr from 'swr';
import Link from 'next/link';
import Button from '../components/button';
import Layout from '../components/layout';
import { breakpoints } from '../style-vars';
import { reportUploadTelemetry, UploadTelemetry, ChunkInfo } from '../lib/telemetry';
const fetcher = stryMutAct_9fa48("867") ? () => undefined : (stryCov_9fa48("867"), (() => {
  const fetcher = (url: string) => fetch(url).then(stryMutAct_9fa48("868") ? () => undefined : (stryCov_9fa48("868"), res => res.json()));
  return fetcher;
})());
type Props = null;
const Index: React.FC<Props> = () => {
  if (stryMutAct_9fa48("869")) {
    {}
  } else {
    stryCov_9fa48("869");
    const [isUploading, setIsUploading] = useState<boolean>(stryMutAct_9fa48("870") ? true : (stryCov_9fa48("870"), false));
    const [uploadId, setUploadId] = useState<string>(stryMutAct_9fa48("871") ? "Stryker was here!" : (stryCov_9fa48("871"), ''));
    const [isPreparing, setIsPreparing] = useState<boolean>(stryMutAct_9fa48("872") ? true : (stryCov_9fa48("872"), false));
    const [errorMessage, setErrorMessage] = useState<string>(stryMutAct_9fa48("873") ? "Stryker was here!" : (stryCov_9fa48("873"), ''));
    const [uploadAnalytics, setUploadAnalytics] = useState<Partial<UploadTelemetry> & Pick<UploadTelemetry, 'chunks'>>(stryMutAct_9fa48("874") ? {} : (stryCov_9fa48("874"), {
      chunks: stryMutAct_9fa48("875") ? ["Stryker was here"] : (stryCov_9fa48("875"), [])
    }));
    const {
      data
    } = useSwr(stryMutAct_9fa48("876") ? () => undefined : (stryCov_9fa48("876"), () => isPreparing ? stryMutAct_9fa48("877") ? `` : (stryCov_9fa48("877"), `/api/uploads/${uploadId}`) : null), fetcher, stryMutAct_9fa48("878") ? {} : (stryCov_9fa48("878"), {
      refreshInterval: 5000
    }));
    const upload = stryMutAct_9fa48("881") ? data || data.upload : stryMutAct_9fa48("880") ? false : stryMutAct_9fa48("879") ? true : (stryCov_9fa48("879", "880", "881"), data && data.upload);
    const createUpload = async () => {
      if (stryMutAct_9fa48("882")) {
        {}
      } else {
        stryCov_9fa48("882");
        try {
          if (stryMutAct_9fa48("883")) {
            {}
          } else {
            stryCov_9fa48("883");
            const res = await fetch(stryMutAct_9fa48("884") ? "" : (stryCov_9fa48("884"), '/api/uploads'), stryMutAct_9fa48("885") ? {} : (stryCov_9fa48("885"), {
              method: stryMutAct_9fa48("886") ? "" : (stryCov_9fa48("886"), 'POST')
            }));
            const {
              id,
              url
            } = await res.json();
            setUploadId(id);
            return url;
          }
        } catch (e) {
          if (stryMutAct_9fa48("887")) {
            {}
          } else {
            stryCov_9fa48("887");
            console.error(stryMutAct_9fa48("888") ? "" : (stryCov_9fa48("888"), 'Error in createUpload'), e);
            setErrorMessage(stryMutAct_9fa48("889") ? "" : (stryCov_9fa48("889"), 'Error creating upload.'));
            return e;
          }
        }
      }
    };
    const handleUpload: MuxUploaderProps['onUploadStart'] = ({
      detail
    }) => {
      if (stryMutAct_9fa48("890")) {
        {}
      } else {
        stryCov_9fa48("890");
        setIsUploading(stryMutAct_9fa48("891") ? false : (stryCov_9fa48("891"), true));
        const initialUploadAnalytics: UploadTelemetry = stryMutAct_9fa48("892") ? {} : (stryCov_9fa48("892"), {
          fileSize: detail.file.size,
          chunkSize: detail.chunkSize,
          uploadStarted: Date.now(),
          dynamicChunkSize: isDynamicChunkSizeSet,
          chunks: stryMutAct_9fa48("893") ? ["Stryker was here"] : (stryCov_9fa48("893"), [])
        });
        setUploadAnalytics(initialUploadAnalytics);
      }
    };
    const handleChunkAttempt: MuxUploaderProps['onChunkAttempt'] = ({
      detail
    }) => {
      if (stryMutAct_9fa48("894")) {
        {}
      } else {
        stryCov_9fa48("894");
        const chunks: ChunkInfo[] = stryMutAct_9fa48("895") ? [] : (stryCov_9fa48("895"), [...uploadAnalytics.chunks]);
        chunks[detail.chunkNumber] = stryMutAct_9fa48("896") ? {} : (stryCov_9fa48("896"), {
          size: detail.chunkSize,
          uploadStarted: Date.now()
        });
        setUploadAnalytics(stryMutAct_9fa48("897") ? {} : (stryCov_9fa48("897"), {
          ...uploadAnalytics,
          chunks
        }));
      }
    };
    const handleChunkSuccess: MuxUploaderProps['onChunkSuccess'] = ({
      detail
    }) => {
      if (stryMutAct_9fa48("898")) {
        {}
      } else {
        stryCov_9fa48("898");
        const chunks = stryMutAct_9fa48("899") ? [] : (stryCov_9fa48("899"), [...uploadAnalytics.chunks]);
        chunks[detail.chunk].uploadFinished = Date.now();
        chunks[detail.chunk].size = detail.chunkSize;
        setUploadAnalytics(stryMutAct_9fa48("900") ? {} : (stryCov_9fa48("900"), {
          ...uploadAnalytics,
          chunks
        }));
      }
    };
    const handleSuccess: MuxUploaderProps['onSuccess'] = () => {
      if (stryMutAct_9fa48("901")) {
        {}
      } else {
        stryCov_9fa48("901");
        reportUploadTelemetry(stryMutAct_9fa48("902") ? {} : (stryCov_9fa48("902"), {
          ...uploadAnalytics,
          uploadFinished: Date.now(),
          uploadId
        }));
        setIsPreparing(stryMutAct_9fa48("903") ? false : (stryCov_9fa48("903"), true));
      }
    };
    const handleUploadError: MuxUploaderProps['onUploadError'] = ({
      detail
    }) => {
      if (stryMutAct_9fa48("904")) {
        {}
      } else {
        stryCov_9fa48("904");
        setIsUploading(stryMutAct_9fa48("905") ? true : (stryCov_9fa48("905"), false));
        reportUploadTelemetry(stryMutAct_9fa48("906") ? {} : (stryCov_9fa48("906"), {
          ...uploadAnalytics,
          uploadId,
          uploadFinished: Date.now(),
          uploadErrored: stryMutAct_9fa48("907") ? false : (stryCov_9fa48("907"), true),
          message: detail.message
        }));
      }
    };
    const [isDynamicChunkSizeSet, setIsDynamicChunkSizeSet] = useState(stryMutAct_9fa48("908") ? true : (stryCov_9fa48("908"), false));
    useEffect(() => {
      if (stryMutAct_9fa48("909")) {
        {}
      } else {
        stryCov_9fa48("909");
        const isDynamic: string = stryMutAct_9fa48("912") ? Cookies.get('dynamicChunkSize') && '' : stryMutAct_9fa48("911") ? false : stryMutAct_9fa48("910") ? true : (stryCov_9fa48("910", "911", "912"), Cookies.get(stryMutAct_9fa48("913") ? "" : (stryCov_9fa48("913"), 'dynamicChunkSize')) || (stryMutAct_9fa48("914") ? "Stryker was here!" : (stryCov_9fa48("914"), '')));
        setIsDynamicChunkSizeSet(stryMutAct_9fa48("917") ? isDynamic !== 'true' : stryMutAct_9fa48("916") ? false : stryMutAct_9fa48("915") ? true : (stryCov_9fa48("915", "916", "917"), isDynamic === (stryMutAct_9fa48("918") ? "" : (stryCov_9fa48("918"), 'true'))));
        if (stryMutAct_9fa48("921") ? upload || upload.asset_id : stryMutAct_9fa48("920") ? false : stryMutAct_9fa48("919") ? true : (stryCov_9fa48("919", "920", "921"), upload && upload.asset_id)) {
          if (stryMutAct_9fa48("922")) {
            {}
          } else {
            stryCov_9fa48("922");
            Router.push(stryMutAct_9fa48("923") ? {} : (stryCov_9fa48("923"), {
              pathname: stryMutAct_9fa48("924") ? `` : (stryCov_9fa48("924"), `/assets/${upload.asset_id}`)
            }));
          }
        }
      }
    }, stryMutAct_9fa48("925") ? [] : (stryCov_9fa48("925"), [upload]));
    if (stryMutAct_9fa48("927") ? false : stryMutAct_9fa48("926") ? true : (stryCov_9fa48("926", "927"), errorMessage)) {
      if (stryMutAct_9fa48("928")) {
        {}
      } else {
        stryCov_9fa48("928");
        return <Layout>
        <div style={stryMutAct_9fa48("929") ? {} : (stryCov_9fa48("929"), {
            paddingBottom: stryMutAct_9fa48("930") ? "" : (stryCov_9fa48("930"), '20px')
          })}><h1>{errorMessage}</h1></div>
        <div>
          <Button onClick={Router.reload}>Reset</Button>
        </div>
      </Layout>;
      }
    }
    return <Layout dragActive isUploading={isUploading}>
      <div className='wrapper'>
        {(stryMutAct_9fa48("931") ? isUploading : (stryCov_9fa48("931"), !isUploading)) ? <div>
            <h1>Add a video.</h1>
            <h1>Get a shareable link to stream it.</h1>
          </div> : null}
        <div className={isUploading ? stryMutAct_9fa48("932") ? "Stryker was here!" : (stryCov_9fa48("932"), '') : stryMutAct_9fa48("933") ? "" : (stryCov_9fa48("933"), 'cta')}>
          {(stryMutAct_9fa48("934") ? isUploading : (stryCov_9fa48("934"), !isUploading)) ? <div className="drop-notice">
              <h2>↓ Drag & drop a video file anywhere</h2>
            </div> : null}
          <MuxUploader id="uploader" noDrop onUploadStart={handleUpload} onChunkAttempt={handleChunkAttempt} onChunkSuccess={handleChunkSuccess} onSuccess={handleSuccess} onUploadError={handleUploadError} dynamicChunkSize={isDynamicChunkSizeSet} endpoint={createUpload} style={stryMutAct_9fa48("935") ? {} : (stryCov_9fa48("935"), {
            fontSize: isUploading ? stryMutAct_9fa48("936") ? "" : (stryCov_9fa48("936"), '4vw') : stryMutAct_9fa48("937") ? "" : (stryCov_9fa48("937"), '26px')
          })}>
            <Button className={isUploading ? stryMutAct_9fa48("938") ? "" : (stryCov_9fa48("938"), 'hidden') : stryMutAct_9fa48("939") ? "Stryker was here!" : (stryCov_9fa48("939"), '')} slot="file-select">Upload video</Button>
          </MuxUploader>
        {(stryMutAct_9fa48("940") ? isUploading : (stryCov_9fa48("940"), !isUploading)) ? <>
            <div className="cta-record">
              <Link href="/record?source=camera"><Button>Record from camera</Button></Link>
            </div>
            <div className="cta-record">
              <Link href="/record?source=screen"><Button>Record my screen</Button></Link>
            </div>
          </> : null}
        </div>
      </div>
      <style jsx>{stryMutAct_9fa48("941") ? `` : (stryCov_9fa48("941"), `
        .wrapper {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          width: ${isUploading ? stryMutAct_9fa48("942") ? "" : (stryCov_9fa48("942"), '100%') : stryMutAct_9fa48("943") ? "" : (stryCov_9fa48("943"), 'auto')};
        }
        input {
          display: none;
        }
        .drop-notice {
          display: none;
        }

        .cta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          margin-right: 15px;
        }
        .cta .button {
          margin: 8px 0;
        }

        .cta {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
        }
        .cta-text-mobile {
          display: inline-block;
        }
        .cta-text-desktop {
          display: none;
        }
        .cta-record {
          display: none;
        }

        @media only screen and (min-width: ${breakpoints.md}px) {
          .cta-record {
            display: block;
            margin-top: 15px;
          }
          .drop-notice {
            display: block;
            text-align: right;
            float: right;
            color: #fff;
            margin-bottom: 5px;
            opacity: 0.5;
            mix-blend-mode: exclusion;
          }
          .drop-notice h2 {
            margin-top: 0;
          }

          .cta-text-mobile {
            display: none;
          }
          .cta-text-desktop {
            display: inline-block;
          }
        }
      `)}
      </style>
      <style jsx global>{stryMutAct_9fa48("944") ? `` : (stryCov_9fa48("944"), `
        mux-uploader::part(progress-percentage) {
          align-items: flex-start;
        }
      `)}
      </style>
    </Layout>;
  }
};
export default Index;