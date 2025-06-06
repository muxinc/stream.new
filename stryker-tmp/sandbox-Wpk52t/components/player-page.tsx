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
import { useState, useMemo, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import FullpageLoader from './fullpage-loader';
import PlayerLoader from './player-loader';
import Layout from './layout';
import ReportForm from './report-form';
import { HOST_URL, VALID_PLAYER_TYPES } from '../constants';
import type { PlayerTypes } from '../constants';
import logger from '../lib/logger';
import { Props } from '../lib/player-page-utils';
type PageProps = Props & {
  playerType: PlayerTypes;
};
const META_TITLE = stryMutAct_9fa48("0") ? "" : (stryCov_9fa48("0"), 'View this video created on stream.new');
const PlayerPage: React.FC<PageProps> = ({
  playbackId,
  videoExists,
  shareUrl,
  poster,
  playerType,
  blurDataURL,
  aspectRatio
}) => {
  if (stryMutAct_9fa48("1")) {
    {}
  } else {
    stryCov_9fa48("1");
    const [isLoaded, setIsLoaded] = useState(stryMutAct_9fa48("2") ? true : (stryCov_9fa48("2"), false));
    const [tryToLoadPlayer, setTryToLoadPlayer] = useState(stryMutAct_9fa48("3") ? true : (stryCov_9fa48("3"), false));
    const [errorMessage, setErrorMessage] = useState(stryMutAct_9fa48("4") ? "Stryker was here!" : (stryCov_9fa48("4"), ''));
    const [isCopied, setIsCopied] = useState(stryMutAct_9fa48("5") ? true : (stryCov_9fa48("5"), false));
    const [openReport, setOpenReport] = useState(stryMutAct_9fa48("6") ? true : (stryCov_9fa48("6"), false));
    const copyTimeoutRef = useRef<number | null>(null);
    const router = useRouter();
    useEffect(() => {
      if (stryMutAct_9fa48("7")) {
        {}
      } else {
        stryCov_9fa48("7");
        return () => {
          if (stryMutAct_9fa48("8")) {
            {}
          } else {
            stryCov_9fa48("8");
            if (stryMutAct_9fa48("10") ? false : stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9", "10"), copyTimeoutRef.current)) clearTimeout(copyTimeoutRef.current);
          }
        };
      }
    }, stryMutAct_9fa48("11") ? ["Stryker was here"] : (stryCov_9fa48("11"), []));
    useEffect(() => {
      if (stryMutAct_9fa48("12")) {
        {}
      } else {
        stryCov_9fa48("12");
        if (stryMutAct_9fa48("15") ? videoExists !== true : stryMutAct_9fa48("14") ? false : stryMutAct_9fa48("13") ? true : (stryCov_9fa48("13", "14", "15"), videoExists === (stryMutAct_9fa48("16") ? false : (stryCov_9fa48("16"), true)))) {
          if (stryMutAct_9fa48("17")) {
            {}
          } else {
            stryCov_9fa48("17");
            setTryToLoadPlayer(stryMutAct_9fa48("18") ? false : (stryCov_9fa48("18"), true));
          }
        } else if (stryMutAct_9fa48("21") ? videoExists !== false : stryMutAct_9fa48("20") ? false : stryMutAct_9fa48("19") ? true : (stryCov_9fa48("19", "20", "21"), videoExists === (stryMutAct_9fa48("22") ? true : (stryCov_9fa48("22"), false)))) {
          if (stryMutAct_9fa48("23")) {
            {}
          } else {
            stryCov_9fa48("23");
            setErrorMessage(stryMutAct_9fa48("24") ? "" : (stryCov_9fa48("24"), 'This video does not exist'));
          }
        } else {
          //
          // We don't know if the video exists or not. We're waiting for 'videoExists' prop to get hydrated
          //
        }
      }
    }, stryMutAct_9fa48("25") ? [] : (stryCov_9fa48("25"), [videoExists]));
    useEffect(() => {
      if (stryMutAct_9fa48("26")) {
        {}
      } else {
        stryCov_9fa48("26");
        if (stryMutAct_9fa48("29") ? playerType || !VALID_PLAYER_TYPES.includes(playerType) : stryMutAct_9fa48("28") ? false : stryMutAct_9fa48("27") ? true : (stryCov_9fa48("27", "28", "29"), playerType && (stryMutAct_9fa48("30") ? VALID_PLAYER_TYPES.includes(playerType) : (stryCov_9fa48("30"), !VALID_PLAYER_TYPES.includes(playerType))))) {
          if (stryMutAct_9fa48("31")) {
            {}
          } else {
            stryCov_9fa48("31");
            setErrorMessage(stryMutAct_9fa48("32") ? `` : (stryCov_9fa48("32"), `Don't know how to load the player called: ${playerType}`));
          }
        }
      }
    }, stryMutAct_9fa48("33") ? [] : (stryCov_9fa48("33"), [playerType]));
    const color = useMemo(() => {
      if (stryMutAct_9fa48("34")) {
        {}
      } else {
        stryCov_9fa48("34");
        if (stryMutAct_9fa48("37") ? router.query.color : stryMutAct_9fa48("36") ? false : stryMutAct_9fa48("35") ? true : (stryCov_9fa48("35", "36", "37"), router.query?.color)) {
          if (stryMutAct_9fa48("38")) {
            {}
          } else {
            stryCov_9fa48("38");
            const val = router.query?.color as string;
            if (stryMutAct_9fa48("40") ? false : stryMutAct_9fa48("39") ? true : (stryCov_9fa48("39", "40"), (stryMutAct_9fa48("44") ? /^[^0-9a-fA-F]+$/ : stryMutAct_9fa48("43") ? /^[0-9a-fA-F]$/ : stryMutAct_9fa48("42") ? /^[0-9a-fA-F]+/ : stryMutAct_9fa48("41") ? /[0-9a-fA-F]+$/ : (stryCov_9fa48("41", "42", "43", "44"), /^[0-9a-fA-F]+$/)).test(val))) {
              if (stryMutAct_9fa48("45")) {
                {}
              } else {
                stryCov_9fa48("45");
                return stryMutAct_9fa48("46") ? `` : (stryCov_9fa48("46"), `#${val}`);
              }
            } else {
              if (stryMutAct_9fa48("47")) {
                {}
              } else {
                stryCov_9fa48("47");
                logger.warn(stryMutAct_9fa48("48") ? "" : (stryCov_9fa48("48"), 'Invalid color hex value param:'), val);
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("49") ? [] : (stryCov_9fa48("49"), [router.query]));
    const startTime = useMemo(() => {
      if (stryMutAct_9fa48("50")) {
        {}
      } else {
        stryCov_9fa48("50");
        return stryMutAct_9fa48("53") ? router.query?.time && parseFloat(router.query.time as string) && 0 : stryMutAct_9fa48("52") ? false : stryMutAct_9fa48("51") ? true : (stryCov_9fa48("51", "52", "53"), (stryMutAct_9fa48("55") ? router.query?.time || parseFloat(router.query.time as string) : stryMutAct_9fa48("54") ? false : (stryCov_9fa48("54", "55"), (stryMutAct_9fa48("56") ? router.query.time : (stryCov_9fa48("56"), router.query?.time)) && parseFloat(router.query.time as string))) || 0);
      }
    }, stryMutAct_9fa48("57") ? [] : (stryCov_9fa48("57"), [router.query]));
    const playerEmbedUrl = useMemo(() => {
      if (stryMutAct_9fa48("58")) {
        {}
      } else {
        stryCov_9fa48("58");
        return stryMutAct_9fa48("59") ? `` : (stryCov_9fa48("59"), `${HOST_URL}/v/${playbackId}/embed`);
      }
    }, stryMutAct_9fa48("60") ? [] : (stryCov_9fa48("60"), [playbackId]));
    if (stryMutAct_9fa48("63") ? router.isFallback && !router.isReady : stryMutAct_9fa48("62") ? false : stryMutAct_9fa48("61") ? true : (stryCov_9fa48("61", "62", "63"), router.isFallback || (stryMutAct_9fa48("64") ? router.isReady : (stryCov_9fa48("64"), !router.isReady)))) {
      if (stryMutAct_9fa48("65")) {
        {}
      } else {
        stryCov_9fa48("65");
        return <Layout metaTitle="View this video created on stream.new" image={poster} playerEmbedUrl={playerEmbedUrl} aspectRatio={aspectRatio} centered darkMode>
        <FullpageLoader text="Loading player..." />;
      </Layout>;
      }
    }
    const onError = (evt: ErrorEvent) => {
      if (stryMutAct_9fa48("66")) {
        {}
      } else {
        stryCov_9fa48("66");
        setErrorMessage(stryMutAct_9fa48("67") ? "" : (stryCov_9fa48("67"), 'Error loading this video'));
        setIsLoaded(stryMutAct_9fa48("68") ? true : (stryCov_9fa48("68"), false));
        logger.error(stryMutAct_9fa48("69") ? "" : (stryCov_9fa48("69"), 'Error'), evt);
      }
    };
    const showLoading = stryMutAct_9fa48("72") ? !isLoaded || !errorMessage : stryMutAct_9fa48("71") ? false : stryMutAct_9fa48("70") ? true : (stryCov_9fa48("70", "71", "72"), (stryMutAct_9fa48("73") ? isLoaded : (stryCov_9fa48("73"), !isLoaded)) && (stryMutAct_9fa48("74") ? errorMessage : (stryCov_9fa48("74"), !errorMessage)));
    const copyUrl = () => {
      if (stryMutAct_9fa48("75")) {
        {}
      } else {
        stryCov_9fa48("75");
        copy(shareUrl, stryMutAct_9fa48("76") ? {} : (stryCov_9fa48("76"), {
          message: stryMutAct_9fa48("77") ? "" : (stryCov_9fa48("77"), 'Copy')
        }));
        setIsCopied(stryMutAct_9fa48("78") ? false : (stryCov_9fa48("78"), true));
        /*
         * We need a ref to the setTimeout because if the user
         * navigates away before the timeout expires we will
         * clear it out
         */
        copyTimeoutRef.current = window.setTimeout(() => {
          if (stryMutAct_9fa48("79")) {
            {}
          } else {
            stryCov_9fa48("79");
            setIsCopied(stryMutAct_9fa48("80") ? true : (stryCov_9fa48("80"), false));
            copyTimeoutRef.current = null;
          }
        }, 5000);
      }
    };
    if (stryMutAct_9fa48("82") ? false : stryMutAct_9fa48("81") ? true : (stryCov_9fa48("81", "82"), errorMessage)) {
      if (stryMutAct_9fa48("83")) {
        {}
      } else {
        stryCov_9fa48("83");
        return <Layout darkMode>
        <h1 className="error-message">{errorMessage}</h1>
        <style jsx>
          {stryMutAct_9fa48("84") ? `` : (stryCov_9fa48("84"), `
            .error-message {
              color: #ccc;
            }
          `)}
        </style>
      </Layout>;
      }
    }
    return <>
      <Head>
        <link rel="alternate" type="application/json+oembed" href={stryMutAct_9fa48("85") ? `` : (stryCov_9fa48("85"), `${HOST_URL}/api/oembed?url=${encodeURIComponent(stryMutAct_9fa48("86") ? `` : (stryCov_9fa48("86"), `${HOST_URL}/v/${playbackId}`))}`)} title="video hosted by stream.new" />
        <meta name="twitter:player" content={stryMutAct_9fa48("87") ? `` : (stryCov_9fa48("87"), `${HOST_URL}/v/${playbackId}/embed`)} />
      </Head>
      <Layout metaTitle={META_TITLE} image={poster} playerEmbedUrl={playerEmbedUrl} aspectRatio={aspectRatio} centered={showLoading} darkMode>
        {stryMutAct_9fa48("90") ? showLoading && !tryToLoadPlayer || <FullpageLoader text="Loading player" /> : stryMutAct_9fa48("89") ? false : stryMutAct_9fa48("88") ? true : (stryCov_9fa48("88", "89", "90"), (stryMutAct_9fa48("92") ? showLoading || !tryToLoadPlayer : stryMutAct_9fa48("91") ? true : (stryCov_9fa48("91", "92"), showLoading && (stryMutAct_9fa48("93") ? tryToLoadPlayer : (stryCov_9fa48("93"), !tryToLoadPlayer)))) && <FullpageLoader text="Loading player" />)}
        <div className="wrapper">
          {stryMutAct_9fa48("96") ? tryToLoadPlayer && aspectRatio && !openReport || <PlayerLoader blurDataURL={blurDataURL} color={color} playbackId={playbackId} poster={poster} currentTime={startTime} aspectRatio={aspectRatio} onLoaded={() => setIsLoaded(true)} onError={onError} playerType={playerType} /> : stryMutAct_9fa48("95") ? false : stryMutAct_9fa48("94") ? true : (stryCov_9fa48("94", "95", "96"), (stryMutAct_9fa48("98") ? tryToLoadPlayer && aspectRatio || !openReport : stryMutAct_9fa48("97") ? true : (stryCov_9fa48("97", "98"), (stryMutAct_9fa48("100") ? tryToLoadPlayer || aspectRatio : stryMutAct_9fa48("99") ? true : (stryCov_9fa48("99", "100"), tryToLoadPlayer && aspectRatio)) && (stryMutAct_9fa48("101") ? openReport : (stryCov_9fa48("101"), !openReport)))) && <PlayerLoader blurDataURL={blurDataURL} color={color} playbackId={playbackId} poster={poster} currentTime={startTime} aspectRatio={aspectRatio} onLoaded={stryMutAct_9fa48("102") ? () => undefined : (stryCov_9fa48("102"), () => setIsLoaded(stryMutAct_9fa48("103") ? false : (stryCov_9fa48("103"), true)))} onError={onError} playerType={playerType} />)}
          <div className="actions">
            {stryMutAct_9fa48("106") ? !openReport || <a onClick={copyUrl} onKeyPress={copyUrl} role="button" tabIndex={0}>
                {isCopied ? 'Copied to clipboard' : 'Copy video URL'}
              </a> : stryMutAct_9fa48("105") ? false : stryMutAct_9fa48("104") ? true : (stryCov_9fa48("104", "105", "106"), (stryMutAct_9fa48("107") ? openReport : (stryCov_9fa48("107"), !openReport)) && <a onClick={copyUrl} onKeyPress={copyUrl} role="button" tabIndex={0}>
                {isCopied ? stryMutAct_9fa48("108") ? "" : (stryCov_9fa48("108"), 'Copied to clipboard') : stryMutAct_9fa48("109") ? "" : (stryCov_9fa48("109"), 'Copy video URL')}
              </a>)}
            {stryMutAct_9fa48("112") ? !openReport || <a onClick={() => setOpenReport(!openReport)} onKeyPress={() => setOpenReport(!openReport)} role="button" tabIndex={0} className="report">
                {openReport ? 'Back' : 'Report abuse'}
              </a> : stryMutAct_9fa48("111") ? false : stryMutAct_9fa48("110") ? true : (stryCov_9fa48("110", "111", "112"), (stryMutAct_9fa48("113") ? openReport : (stryCov_9fa48("113"), !openReport)) && <a onClick={stryMutAct_9fa48("114") ? () => undefined : (stryCov_9fa48("114"), () => setOpenReport(stryMutAct_9fa48("115") ? openReport : (stryCov_9fa48("115"), !openReport)))} onKeyPress={stryMutAct_9fa48("116") ? () => undefined : (stryCov_9fa48("116"), () => setOpenReport(stryMutAct_9fa48("117") ? openReport : (stryCov_9fa48("117"), !openReport)))} role="button" tabIndex={0} className="report">
                {openReport ? stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), 'Back') : stryMutAct_9fa48("119") ? "" : (stryCov_9fa48("119"), 'Report abuse')}
              </a>)}
          </div>
          <div className="report-form">
            {stryMutAct_9fa48("122") ? openReport || <ReportForm playbackId={playbackId} close={() => setOpenReport(false)} /> : stryMutAct_9fa48("121") ? false : stryMutAct_9fa48("120") ? true : (stryCov_9fa48("120", "121", "122"), openReport && <ReportForm playbackId={playbackId} close={stryMutAct_9fa48("123") ? () => undefined : (stryCov_9fa48("123"), () => setOpenReport(stryMutAct_9fa48("124") ? true : (stryCov_9fa48("124"), false)))} />)}
          </div>
        </div>
        <style jsx>
          {stryMutAct_9fa48("125") ? `` : (stryCov_9fa48("125"), `
            .actions {
              display: flex;
              justify-content: center;
            }
            .actions a {
              padding-left: 15px;
              padding-right: 15px;
            }
            .report-form {
              margin: 20px auto auto;
              max-width: 800px;
            }
            .wrapper {
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: center;
            }
          `)}
        </style>
      </Layout>
    </>;
  }
};
export default PlayerPage;