/* global navigator MediaRecorder Blob File */
// @ts-nocheck

/* eslint-disable jsx-a11y/no-onchange */function stryNS_9fa48() {
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
import { useRef, useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Layout from './layout';
import StopWatch from './stop-watch';
import VideoSourceToggle from './video-source-toggle';
import RecordingControls from './recording-controls';
import CameraOptions from './camera-options';
import ScreenOptions from './screen-options';
import AccessSkeletonFrame from './access-skeleton-frame';
import UploadProgressFullpage from './upload-progress-fullpage';
import logger from '../lib/logger';
import CountdownTimer, { CountdownTimerHandles } from './countdown-timer';
import { RecordState } from '../types';
const MEDIA_RECORDER_TIMESLICE_MS = 2000;
const getAudioContext = stryMutAct_9fa48("126") ? () => undefined : (stryCov_9fa48("126"), (() => {
  const getAudioContext = () => stryMutAct_9fa48("129") ? typeof window !== undefined && window.AudioContext && window.webkitAudioContext : stryMutAct_9fa48("128") ? false : stryMutAct_9fa48("127") ? true : (stryCov_9fa48("127", "128", "129"), (stryMutAct_9fa48("131") ? typeof window !== undefined || window.AudioContext : stryMutAct_9fa48("130") ? false : (stryCov_9fa48("130", "131"), (stryMutAct_9fa48("133") ? typeof window === undefined : stryMutAct_9fa48("132") ? true : (stryCov_9fa48("132", "133"), typeof window !== undefined)) && window.AudioContext)) || window.webkitAudioContext);
  return getAudioContext;
})());
type DeviceItems = MediaDeviceInfo[];
type DeviceList = {
  video: DeviceItems;
  audio: DeviceItems;
};
type VideoSources = 'camera' | 'screen';
type QueryParams = {
  source: VideoSources;
};
const RecordPage: React.FC<NoProps> = () => {
  if (stryMutAct_9fa48("134")) {
    {}
  } else {
    stryCov_9fa48("134");
    const router = useRouter();
    const [videoSource, setVideoSource] = useState<'camera' | 'screen' | ''>(stryMutAct_9fa48("135") ? "Stryker was here!" : (stryCov_9fa48("135"), ''));
    const [errorMessage, setErrorMessage] = useState(stryMutAct_9fa48("136") ? "Stryker was here!" : (stryCov_9fa48("136"), ''));
    const [file, setFile] = useState<File | null>(null);
    const [startRecordTime, setStartRecordTime] = useState<number | null>(null);
    const [recordState, setRecordState] = useState(RecordState.IDLE);
    const [isRequestingMedia, setIsRequestingMedia] = useState(stryMutAct_9fa48("137") ? true : (stryCov_9fa48("137"), false));
    const [isLoadingPreview, setIsLoadingPreview] = useState(stryMutAct_9fa48("138") ? true : (stryCov_9fa48("138"), false));
    const [isReviewing, setIsReviewing] = useState(stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139"), false));
    const [audioLevel, setAudioLevel] = useState(0);
    const [haveDeviceAccess, setHaveDeviceAccess] = useState(stryMutAct_9fa48("140") ? true : (stryCov_9fa48("140"), false));
    const [isMicDeviceEnabled, setIsMicDeviceEnabled] = useState(stryMutAct_9fa48("141") ? true : (stryCov_9fa48("141"), false));
    const [videoDeviceId, setVideoDeviceId] = useState(stryMutAct_9fa48("142") ? "Stryker was here!" : (stryCov_9fa48("142"), ''));
    const [audioDeviceId, setAudioDeviceId] = useState(stryMutAct_9fa48("143") ? "Stryker was here!" : (stryCov_9fa48("143"), ''));
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioInterval = useRef<number | null>(null);
    const mediaChunks = useRef<Blob[]>(stryMutAct_9fa48("144") ? ["Stryker was here"] : (stryCov_9fa48("144"), []));
    const finalBlob = useRef<Blob | null>(null);
    const countdownTimerRef = useRef<CountdownTimerHandles | null>(null);
    const [deviceList, setDevices] = useState({
      video: [],
      audio: []
    } as DeviceList);
    const [showUploadPage, setShowUploadPage] = useState(stryMutAct_9fa48("145") ? false : (stryCov_9fa48("145"), true));
    useEffect(() => {
      if (stryMutAct_9fa48("146")) {
        {}
      } else {
        stryCov_9fa48("146");
        if (stryMutAct_9fa48("149") ? router.query || router.query.source : stryMutAct_9fa48("148") ? false : stryMutAct_9fa48("147") ? true : (stryCov_9fa48("147", "148", "149"), router.query && router.query.source)) {
          if (stryMutAct_9fa48("150")) {
            {}
          } else {
            stryCov_9fa48("150");
            const source = (router.query as QueryParams).source;
            setVideoSource(source);
          }
        }
        if (stryMutAct_9fa48("153") ? router.query || !router.query.source : stryMutAct_9fa48("152") ? false : stryMutAct_9fa48("151") ? true : (stryCov_9fa48("151", "152", "153"), router.query && (stryMutAct_9fa48("154") ? router.query.source : (stryCov_9fa48("154"), !router.query.source)))) {
          if (stryMutAct_9fa48("155")) {
            {}
          } else {
            stryCov_9fa48("155");
            router.push(stryMutAct_9fa48("156") ? {} : (stryCov_9fa48("156"), {
              pathname: stryMutAct_9fa48("157") ? "" : (stryCov_9fa48("157"), '/record'),
              query: stryMutAct_9fa48("158") ? {} : (stryCov_9fa48("158"), {
                source: stryMutAct_9fa48("159") ? "" : (stryCov_9fa48("159"), 'camera')
              })
            }));
          }
        }
      }
    }, stryMutAct_9fa48("160") ? [] : (stryCov_9fa48("160"), [router]));
    const getDevices = async () => {
      if (stryMutAct_9fa48("161")) {
        {}
      } else {
        stryCov_9fa48("161");
        const devices = await navigator.mediaDevices.enumerateDevices();
        const list: DeviceList = stryMutAct_9fa48("162") ? {} : (stryCov_9fa48("162"), {
          video: stryMutAct_9fa48("163") ? ["Stryker was here"] : (stryCov_9fa48("163"), []),
          audio: stryMutAct_9fa48("164") ? ["Stryker was here"] : (stryCov_9fa48("164"), [])
        });
        devices.forEach(device => {
          if (stryMutAct_9fa48("165")) {
            {}
          } else {
            stryCov_9fa48("165");
            if (stryMutAct_9fa48("168") ? device.kind !== 'videoinput' : stryMutAct_9fa48("167") ? false : stryMutAct_9fa48("166") ? true : (stryCov_9fa48("166", "167", "168"), device.kind === (stryMutAct_9fa48("169") ? "" : (stryCov_9fa48("169"), 'videoinput')))) {
              if (stryMutAct_9fa48("170")) {
                {}
              } else {
                stryCov_9fa48("170");
                list.video.push(device);
              }
            }
            if (stryMutAct_9fa48("173") ? device.kind !== 'audioinput' : stryMutAct_9fa48("172") ? false : stryMutAct_9fa48("171") ? true : (stryCov_9fa48("171", "172", "173"), device.kind === (stryMutAct_9fa48("174") ? "" : (stryCov_9fa48("174"), 'audioinput')))) {
              if (stryMutAct_9fa48("175")) {
                {}
              } else {
                stryCov_9fa48("175");
                list.audio.push(device);
              }
            }
          }
        });
        setDevices(stryMutAct_9fa48("176") ? {} : (stryCov_9fa48("176"), {
          ...list
        }));
      }
    };
    const updateAudioLevels = (analyser: AnalyserNode) => {
      if (stryMutAct_9fa48("177")) {
        {}
      } else {
        stryCov_9fa48("177");
        // dataArray will give us an array of numbers ranging from 0 to 255
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = stryMutAct_9fa48("178") ? dataArray.reduce((a, b) => a + b) * dataArray.length : (stryCov_9fa48("178"), dataArray.reduce(stryMutAct_9fa48("179") ? () => undefined : (stryCov_9fa48("179"), (a, b) => stryMutAct_9fa48("180") ? a - b : (stryCov_9fa48("180"), a + b))) / dataArray.length);
        // cthese values are between 0 - 255, we want the average and
        // to convert it into a value between 0 - 100
        const audioLevelValue = Math.round(stryMutAct_9fa48("181") ? average / 255 / 100 : (stryCov_9fa48("181"), (stryMutAct_9fa48("182") ? average * 255 : (stryCov_9fa48("182"), average / 255)) * 100));
        setAudioLevel(audioLevelValue);
      }
    };
    const stopUserMedia = () => {
      if (stryMutAct_9fa48("183")) {
        {}
      } else {
        stryCov_9fa48("183");
        if (stryMutAct_9fa48("185") ? false : stryMutAct_9fa48("184") ? true : (stryCov_9fa48("184", "185"), streamRef.current)) {
          if (stryMutAct_9fa48("186")) {
            {}
          } else {
            stryCov_9fa48("186");
            streamRef.current.getTracks().forEach(track => {
              if (stryMutAct_9fa48("187")) {
                {}
              } else {
                stryCov_9fa48("187");
                logger(stryMutAct_9fa48("188") ? "" : (stryCov_9fa48("188"), 'stopping track'), track.kind, track.label);
                track.stop();
              }
            });
          }
        }
        streamRef.current = null;
      }
    };

    /*
     * Stop all recording, cancel audio interval
     */
    const cleanup = () => {
      if (stryMutAct_9fa48("189")) {
        {}
      } else {
        stryCov_9fa48("189");
        logger(stryMutAct_9fa48("190") ? "" : (stryCov_9fa48("190"), 'cleanup'));
        if (stryMutAct_9fa48("192") ? false : stryMutAct_9fa48("191") ? true : (stryCov_9fa48("191", "192"), recorderRef.current)) {
          if (stryMutAct_9fa48("193")) {
            {}
          } else {
            stryCov_9fa48("193");
            if (stryMutAct_9fa48("196") ? recorderRef?.current?.state !== 'inactive' : stryMutAct_9fa48("195") ? false : stryMutAct_9fa48("194") ? true : (stryCov_9fa48("194", "195", "196"), (stryMutAct_9fa48("198") ? recorderRef.current?.state : stryMutAct_9fa48("197") ? recorderRef?.current.state : (stryCov_9fa48("197", "198"), recorderRef?.current?.state)) === (stryMutAct_9fa48("199") ? "" : (stryCov_9fa48("199"), 'inactive')))) {
              if (stryMutAct_9fa48("200")) {
                {}
              } else {
                stryCov_9fa48("200");
                logger(stryMutAct_9fa48("201") ? "" : (stryCov_9fa48("201"), 'skipping recorder stop() b/c state is "inactive"'));
              }
            } else {
              if (stryMutAct_9fa48("202")) {
                {}
              } else {
                stryCov_9fa48("202");
                recorderRef.current.onstop = function onRecorderStop() {
                  if (stryMutAct_9fa48("203")) {
                    {}
                  } else {
                    stryCov_9fa48("203");
                    logger(stryMutAct_9fa48("204") ? "" : (stryCov_9fa48("204"), 'recorder cleanup'));
                  }
                };
                recorderRef.current.stop();
              }
            }
          }
        }
        mediaChunks.current = stryMutAct_9fa48("205") ? ["Stryker was here"] : (stryCov_9fa48("205"), []);
        if (stryMutAct_9fa48("207") ? false : stryMutAct_9fa48("206") ? true : (stryCov_9fa48("206", "207"), audioInterval.current)) {
          if (stryMutAct_9fa48("208")) {
            {}
          } else {
            stryCov_9fa48("208");
            clearInterval(audioInterval.current);
          }
        }
        setRecordState(RecordState.IDLE);
        setErrorMessage(stryMutAct_9fa48("209") ? "Stryker was here!" : (stryCov_9fa48("209"), ''));
        setShowUploadPage(stryMutAct_9fa48("210") ? true : (stryCov_9fa48("210"), false));
      }
    };

    /*
     * do a cleanup, and also cancel all media streams
     */
    const hardCleanup = () => {
      if (stryMutAct_9fa48("211")) {
        {}
      } else {
        stryCov_9fa48("211");
        cleanup();
        stopUserMedia();
        setIsReviewing(stryMutAct_9fa48("212") ? true : (stryCov_9fa48("212"), false));
        setIsLoadingPreview(stryMutAct_9fa48("213") ? true : (stryCov_9fa48("213"), false));
        setHaveDeviceAccess(stryMutAct_9fa48("214") ? true : (stryCov_9fa48("214"), false));
        setIsMicDeviceEnabled(stryMutAct_9fa48("215") ? true : (stryCov_9fa48("215"), false));
        setVideoDeviceId(stryMutAct_9fa48("216") ? "Stryker was here!" : (stryCov_9fa48("216"), ''));
        setAudioDeviceId(stryMutAct_9fa48("217") ? "Stryker was here!" : (stryCov_9fa48("217"), ''));
      }
    };
    const startAv = () => {
      if (stryMutAct_9fa48("218")) {
        {}
      } else {
        stryCov_9fa48("218");
        cleanup();
        if (stryMutAct_9fa48("221") ? false : stryMutAct_9fa48("220") ? true : stryMutAct_9fa48("219") ? videoSource : (stryCov_9fa48("219", "220", "221"), !videoSource)) {
          if (stryMutAct_9fa48("222")) {
            {}
          } else {
            stryCov_9fa48("222");
            logger.error(stryMutAct_9fa48("223") ? "" : (stryCov_9fa48("223"), 'Cannot startAv without a video source'));
            return;
          }
        }
        if (stryMutAct_9fa48("226") ? videoSource !== 'camera' : stryMutAct_9fa48("225") ? false : stryMutAct_9fa48("224") ? true : (stryCov_9fa48("224", "225", "226"), videoSource === (stryMutAct_9fa48("227") ? "" : (stryCov_9fa48("227"), 'camera')))) {
          if (stryMutAct_9fa48("228")) {
            {}
          } else {
            stryCov_9fa48("228");
            startCamera();
          }
        }
        if (stryMutAct_9fa48("231") ? videoSource !== 'screen' : stryMutAct_9fa48("230") ? false : stryMutAct_9fa48("229") ? true : (stryCov_9fa48("229", "230", "231"), videoSource === (stryMutAct_9fa48("232") ? "" : (stryCov_9fa48("232"), 'screen')))) {
          if (stryMutAct_9fa48("233")) {
            {}
          } else {
            stryCov_9fa48("233");
            startScreenshare();
          }
        }
      }
    };
    const setupStream = (stream: MediaStream) => {
      if (stryMutAct_9fa48("234")) {
        {}
      } else {
        stryCov_9fa48("234");
        const AudioContext = getAudioContext();
        if (stryMutAct_9fa48("237") ? AudioContext && videoSource === 'camera' && AudioContext && videoSource === 'screen' && isMicDeviceEnabled : stryMutAct_9fa48("236") ? false : stryMutAct_9fa48("235") ? true : (stryCov_9fa48("235", "236", "237"), (stryMutAct_9fa48("239") ? AudioContext || videoSource === 'camera' : stryMutAct_9fa48("238") ? false : (stryCov_9fa48("238", "239"), AudioContext && (stryMutAct_9fa48("241") ? videoSource !== 'camera' : stryMutAct_9fa48("240") ? true : (stryCov_9fa48("240", "241"), videoSource === (stryMutAct_9fa48("242") ? "" : (stryCov_9fa48("242"), 'camera')))))) || (stryMutAct_9fa48("244") ? AudioContext && videoSource === 'screen' || isMicDeviceEnabled : stryMutAct_9fa48("243") ? false : (stryCov_9fa48("243", "244"), (stryMutAct_9fa48("246") ? AudioContext || videoSource === 'screen' : stryMutAct_9fa48("245") ? true : (stryCov_9fa48("245", "246"), AudioContext && (stryMutAct_9fa48("248") ? videoSource !== 'screen' : stryMutAct_9fa48("247") ? true : (stryCov_9fa48("247", "248"), videoSource === (stryMutAct_9fa48("249") ? "" : (stryCov_9fa48("249"), 'screen')))))) && isMicDeviceEnabled)))) {
          if (stryMutAct_9fa48("250")) {
            {}
          } else {
            stryCov_9fa48("250");
            const audioContext = new AudioContext();
            const mediaStreamSource = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.smoothingTimeConstant = 0.3;
            analyser.fftSize = 1024;
            mediaStreamSource.connect(analyser);
            audioInterval.current = window.setInterval(() => {
              if (stryMutAct_9fa48("251")) {
                {}
              } else {
                stryCov_9fa48("251");
                updateAudioLevels(analyser);
              }
            }, 100);
          }
        }
        streamRef.current = stream;
        if (stryMutAct_9fa48("254") ? videoRef.current === null : stryMutAct_9fa48("253") ? false : stryMutAct_9fa48("252") ? true : (stryCov_9fa48("252", "253", "254"), videoRef.current !== null)) {
          if (stryMutAct_9fa48("255")) {
            {}
          } else {
            stryCov_9fa48("255");
            (videoRef.current as HTMLVideoElement).srcObject = stream;
            videoRef.current.muted = stryMutAct_9fa48("256") ? false : (stryCov_9fa48("256"), true);
            videoRef.current.controls = stryMutAct_9fa48("257") ? true : (stryCov_9fa48("257"), false);
          }
        }
        setHaveDeviceAccess(stryMutAct_9fa48("258") ? false : (stryCov_9fa48("258"), true));
      }
    };
    const startCamera = async () => {
      if (stryMutAct_9fa48("259")) {
        {}
      } else {
        stryCov_9fa48("259");
        if (stryMutAct_9fa48("261") ? false : stryMutAct_9fa48("260") ? true : (stryCov_9fa48("260", "261"), navigator.mediaDevices)) {
          if (stryMutAct_9fa48("262")) {
            {}
          } else {
            stryCov_9fa48("262");
            const video = videoDeviceId ? stryMutAct_9fa48("263") ? {} : (stryCov_9fa48("263"), {
              deviceId: videoDeviceId
            }) : stryMutAct_9fa48("264") ? false : (stryCov_9fa48("264"), true);
            const audio = audioDeviceId ? stryMutAct_9fa48("265") ? {} : (stryCov_9fa48("265"), {
              deviceId: audioDeviceId
            }) : stryMutAct_9fa48("266") ? false : (stryCov_9fa48("266"), true);
            const constraints = stryMutAct_9fa48("267") ? {} : (stryCov_9fa48("267"), {
              video,
              audio
            });
            try {
              if (stryMutAct_9fa48("268")) {
                {}
              } else {
                stryCov_9fa48("268");
                /*
                 * We have to call getDevices() twice b/c of firefox.
                 * The first time we getDevices() in firefox the device.label is an empty string
                 * After getUserMedia() happens successfully, then we can getDevices() again to
                 * and the 2nd time then device.label will be populated :shrug:
                 */
                await getDevices();
                logger(stryMutAct_9fa48("269") ? "" : (stryCov_9fa48("269"), 'requesting user media with constraints'), constraints);
                /*
                 * This gets called when a new device is selected, we want to stopUserMedia()
                 * when re-initializing a camera
                 *
                 * You will notice that in startScreenshare() we do not call stopUserMedia()
                 * because we want the screenshare to stay the same while the microphone input
                 * gets changed
                 */
                stopUserMedia();
                setIsRequestingMedia(stryMutAct_9fa48("270") ? false : (stryCov_9fa48("270"), true));
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                setIsRequestingMedia(stryMutAct_9fa48("271") ? true : (stryCov_9fa48("271"), false));
                setErrorMessage(stryMutAct_9fa48("272") ? "Stryker was here!" : (stryCov_9fa48("272"), ''));
                await getDevices();
                setupStream(stream);
              }
            } catch (err) {
              if (stryMutAct_9fa48("273")) {
                {}
              } else {
                stryCov_9fa48("273");
                logger.error(stryMutAct_9fa48("274") ? "" : (stryCov_9fa48("274"), 'getdevices error'), err);
                setIsRequestingMedia(stryMutAct_9fa48("275") ? true : (stryCov_9fa48("275"), false));
                setErrorMessage(stryMutAct_9fa48("276") ? "" : (stryCov_9fa48("276"), 'Error getting devices, you may have denied access already, if so you will have to allow access in browser settings.'));
              }
            }
          }
        } else {
          if (stryMutAct_9fa48("277")) {
            {}
          } else {
            stryCov_9fa48("277");
            setErrorMessage(stryMutAct_9fa48("278") ? "" : (stryCov_9fa48("278"), 'navigator.mediaDevices not available in this browser'));
          }
        }
        return function teardown() {
          if (stryMutAct_9fa48("279")) {
            {}
          } else {
            stryCov_9fa48("279");
            hardCleanup();
          }
        };
      }
    };
    const startScreenshare = async () => {
      if (stryMutAct_9fa48("280")) {
        {}
      } else {
        stryCov_9fa48("280");
        if (stryMutAct_9fa48("282") ? false : stryMutAct_9fa48("281") ? true : (stryCov_9fa48("281", "282"), navigator.mediaDevices)) {
          if (stryMutAct_9fa48("283")) {
            {}
          } else {
            stryCov_9fa48("283");
            const audio = audioDeviceId ? stryMutAct_9fa48("284") ? {} : (stryCov_9fa48("284"), {
              deviceId: audioDeviceId
            }) : stryMutAct_9fa48("285") ? false : (stryCov_9fa48("285"), true);
            const constraints = stryMutAct_9fa48("286") ? {} : (stryCov_9fa48("286"), {
              video: stryMutAct_9fa48("287") ? true : (stryCov_9fa48("287"), false),
              audio
            });
            try {
              if (stryMutAct_9fa48("288")) {
                {}
              } else {
                stryCov_9fa48("288");
                const stream = stryMutAct_9fa48("291") ? streamRef.current && (await navigator.mediaDevices.getDisplayMedia({
                  video: true
                })) : stryMutAct_9fa48("290") ? false : stryMutAct_9fa48("289") ? true : (stryCov_9fa48("289", "290", "291"), streamRef.current || (await navigator.mediaDevices.getDisplayMedia(stryMutAct_9fa48("292") ? {} : (stryCov_9fa48("292"), {
                  video: stryMutAct_9fa48("293") ? false : (stryCov_9fa48("293"), true)
                }))));
                if (stryMutAct_9fa48("295") ? false : stryMutAct_9fa48("294") ? true : (stryCov_9fa48("294", "295"), isMicDeviceEnabled)) {
                  if (stryMutAct_9fa48("296")) {
                    {}
                  } else {
                    stryCov_9fa48("296");
                    logger(stryMutAct_9fa48("297") ? "" : (stryCov_9fa48("297"), 'requesting user media with constraints'), constraints);
                    const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
                    /*
                     * if we already have an audio track it needs to be removed
                     * this happens when a user changes the mic input
                     */
                    stryMutAct_9fa48("298") ? stream.getTracks().forEach(track => {
                      stream.removeTrack(track);
                    }) : (stryCov_9fa48("298"), stream.getTracks().filter(stryMutAct_9fa48("299") ? () => undefined : (stryCov_9fa48("299"), track => stryMutAct_9fa48("302") ? track.kind !== 'audio' : stryMutAct_9fa48("301") ? false : stryMutAct_9fa48("300") ? true : (stryCov_9fa48("300", "301", "302"), track.kind === (stryMutAct_9fa48("303") ? "" : (stryCov_9fa48("303"), 'audio'))))).forEach(track => {
                      if (stryMutAct_9fa48("304")) {
                        {}
                      } else {
                        stryCov_9fa48("304");
                        stream.removeTrack(track);
                      }
                    }));
                    stream.addTrack(audioStream.getAudioTracks()[0]);
                  }
                }
                setupStream(stream);
              }
            } catch (err) {
              if (stryMutAct_9fa48("305")) {
                {}
              } else {
                stryCov_9fa48("305");
                logger.error(err);
                setIsRequestingMedia(stryMutAct_9fa48("306") ? true : (stryCov_9fa48("306"), false));
                setErrorMessage(stryMutAct_9fa48("307") ? "" : (stryCov_9fa48("307"), 'Error getting screenshare. Please allow screen access in your browser settings.'));
              }
            }
          }
        } else {
          if (stryMutAct_9fa48("308")) {
            {}
          } else {
            stryCov_9fa48("308");
            setErrorMessage(stryMutAct_9fa48("309") ? "" : (stryCov_9fa48("309"), 'navigator.mediaDevices not available in this browser'));
          }
        }
        return function teardown() {
          if (stryMutAct_9fa48("310")) {
            {}
          } else {
            stryCov_9fa48("310");
            hardCleanup();
          }
        };
      }
    };
    const reset = async () => {
      if (stryMutAct_9fa48("311")) {
        {}
      } else {
        stryCov_9fa48("311");
        hardCleanup();
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("312")) {
        {}
      } else {
        stryCov_9fa48("312");
        //
        // This updates the device list when the list changes. For example
        // plugging in or unplugging a mic or camera
        //
        navigator.mediaDevices.ondevicechange = getDevices;
      }
    }, stryMutAct_9fa48("313") ? ["Stryker was here"] : (stryCov_9fa48("313"), []));
    useEffect(() => {
      if (stryMutAct_9fa48("314")) {
        {}
      } else {
        stryCov_9fa48("314");
        if (stryMutAct_9fa48("317") ? (isMicDeviceEnabled || videoDeviceId) && audioDeviceId : stryMutAct_9fa48("316") ? false : stryMutAct_9fa48("315") ? true : (stryCov_9fa48("315", "316", "317"), (stryMutAct_9fa48("319") ? isMicDeviceEnabled && videoDeviceId : stryMutAct_9fa48("318") ? false : (stryCov_9fa48("318", "319"), isMicDeviceEnabled || videoDeviceId)) || audioDeviceId)) {
          if (stryMutAct_9fa48("320")) {
            {}
          } else {
            stryCov_9fa48("320");
            startAv();
          }
        }
      }
    }, stryMutAct_9fa48("321") ? [] : (stryCov_9fa48("321"), [videoDeviceId, audioDeviceId, isMicDeviceEnabled]));
    const prepRecording = () => {
      if (stryMutAct_9fa48("322")) {
        {}
      } else {
        stryCov_9fa48("322");
        logger(stryMutAct_9fa48("323") ? "" : (stryCov_9fa48("323"), 'prep recording'));
        if (stryMutAct_9fa48("326") ? typeof MediaRecorder !== 'undefined' : stryMutAct_9fa48("325") ? false : stryMutAct_9fa48("324") ? true : (stryCov_9fa48("324", "325", "326"), typeof MediaRecorder === (stryMutAct_9fa48("327") ? "" : (stryCov_9fa48("327"), 'undefined')))) {
          if (stryMutAct_9fa48("328")) {
            {}
          } else {
            stryCov_9fa48("328");
            setErrorMessage(stryMutAct_9fa48("329") ? "" : (stryCov_9fa48("329"), 'MediaRecorder not available in your browser. You may be able to enable this in Experimental Features'));
            return;
          }
        }
        stryMutAct_9fa48("330") ? countdownTimerRef.current.start() : (stryCov_9fa48("330"), countdownTimerRef.current?.start());
        setRecordState(RecordState.PREPARING);
      }
    };
    const startRecording = async () => {
      if (stryMutAct_9fa48("331")) {
        {}
      } else {
        stryCov_9fa48("331");
        if (stryMutAct_9fa48("333") ? false : stryMutAct_9fa48("332") ? true : (stryCov_9fa48("332", "333"), isRecording)) {
          if (stryMutAct_9fa48("334")) {
            {}
          } else {
            stryCov_9fa48("334");
            logger.warn(stryMutAct_9fa48("335") ? "" : (stryCov_9fa48("335"), 'we are already recording'));
            return;
          }
        }
        if (stryMutAct_9fa48("337") ? false : stryMutAct_9fa48("336") ? true : (stryCov_9fa48("336", "337"), isReviewing)) {
          if (stryMutAct_9fa48("338")) {
            {}
          } else {
            stryCov_9fa48("338");
            logger.warn(stryMutAct_9fa48("339") ? "" : (stryCov_9fa48("339"), 'cannot start recording when you are reviewing your last recording'));
            return;
          }
        }
        logger(stryMutAct_9fa48("340") ? "" : (stryCov_9fa48("340"), 'start recording'));
        try {
          if (stryMutAct_9fa48("341")) {
            {}
          } else {
            stryCov_9fa48("341");
            setStartRecordTime(new Date().valueOf());
            const preferredOptions = stryMutAct_9fa48("342") ? {} : (stryCov_9fa48("342"), {
              mimeType: stryMutAct_9fa48("343") ? "" : (stryCov_9fa48("343"), 'video/webm;codecs=vp9')
            });
            const backupOptions = stryMutAct_9fa48("344") ? {} : (stryCov_9fa48("344"), {
              mimeType: stryMutAct_9fa48("345") ? "" : (stryCov_9fa48("345"), 'video/webm;codecs=vp8,opus')
            });
            const lastResortOptions = stryMutAct_9fa48("346") ? {} : (stryCov_9fa48("346"), {
              mimeType: stryMutAct_9fa48("347") ? "" : (stryCov_9fa48("347"), 'video/mp4;codecs=avc1')
            });
            let options = preferredOptions;
            /*
             * MediaRecorder.isTypeSupported is not a thing in safari,
             * good thing safari supports the preferredOptions
             */
            if (stryMutAct_9fa48("350") ? typeof MediaRecorder.isTypeSupported !== 'function' : stryMutAct_9fa48("349") ? false : stryMutAct_9fa48("348") ? true : (stryCov_9fa48("348", "349", "350"), typeof MediaRecorder.isTypeSupported === (stryMutAct_9fa48("351") ? "" : (stryCov_9fa48("351"), 'function')))) {
              if (stryMutAct_9fa48("352")) {
                {}
              } else {
                stryCov_9fa48("352");
                if (stryMutAct_9fa48("355") ? false : stryMutAct_9fa48("354") ? true : stryMutAct_9fa48("353") ? MediaRecorder.isTypeSupported(preferredOptions.mimeType) : (stryCov_9fa48("353", "354", "355"), !MediaRecorder.isTypeSupported(preferredOptions.mimeType))) {
                  if (stryMutAct_9fa48("356")) {
                    {}
                  } else {
                    stryCov_9fa48("356");
                    options = backupOptions;
                    if (stryMutAct_9fa48("359") ? false : stryMutAct_9fa48("358") ? true : stryMutAct_9fa48("357") ? MediaRecorder.isTypeSupported(options.mimeType) : (stryCov_9fa48("357", "358", "359"), !MediaRecorder.isTypeSupported(options.mimeType))) {
                      if (stryMutAct_9fa48("360")) {
                        {}
                      } else {
                        stryCov_9fa48("360");
                        options = lastResortOptions;
                      }
                    }
                  }
                }
              }
            }
            const stream = streamRef.current;
            if (stryMutAct_9fa48("363") ? false : stryMutAct_9fa48("362") ? true : stryMutAct_9fa48("361") ? stream : (stryCov_9fa48("361", "362", "363"), !stream)) throw new Error(stryMutAct_9fa48("364") ? "" : (stryCov_9fa48("364"), 'Cannot record without a stream'));
            recorderRef.current = new MediaRecorder(stream, options);
            recorderRef.current.start(MEDIA_RECORDER_TIMESLICE_MS);
            recorderRef.current.ondataavailable = evt => {
              if (stryMutAct_9fa48("365")) {
                {}
              } else {
                stryCov_9fa48("365");
                mediaChunks.current.push(evt.data);
                logger(stryMutAct_9fa48("366") ? "" : (stryCov_9fa48("366"), 'added media recorder chunk'), mediaChunks.current.length);
              }
            };
            recorderRef.current.onstop = function onRecorderStop() {
              if (stryMutAct_9fa48("367")) {
                {}
              } else {
                stryCov_9fa48("367");
                finalBlob.current = new Blob(mediaChunks.current, stryMutAct_9fa48("368") ? {} : (stryCov_9fa48("368"), {
                  type: stryMutAct_9fa48("369") ? recorderRef.current.mimeType : (stryCov_9fa48("369"), recorderRef.current?.mimeType)
                }));
                const objUrl = URL.createObjectURL(finalBlob.current);
                if (stryMutAct_9fa48("372") ? videoRef.current === null : stryMutAct_9fa48("371") ? false : stryMutAct_9fa48("370") ? true : (stryCov_9fa48("370", "371", "372"), videoRef.current !== null)) {
                  if (stryMutAct_9fa48("373")) {
                    {}
                  } else {
                    stryCov_9fa48("373");
                    videoRef.current.srcObject = null;
                    videoRef.current.src = objUrl;
                    videoRef.current.controls = stryMutAct_9fa48("374") ? false : (stryCov_9fa48("374"), true);
                    videoRef.current.muted = stryMutAct_9fa48("375") ? true : (stryCov_9fa48("375"), false);
                    setIsReviewing(stryMutAct_9fa48("376") ? false : (stryCov_9fa48("376"), true));
                  }
                }
                cleanup();
              }
            };
            setRecordState(RecordState.RECORDING);
          }
        } catch (err) {
          if (stryMutAct_9fa48("377")) {
            {}
          } else {
            stryCov_9fa48("377");
            logger.error(err); // eslint-disable-line no-console
            setErrorMessage(stryMutAct_9fa48("378") ? "" : (stryCov_9fa48("378"), 'Error attempting to start recording, check console for details'));
          }
        }
      }
    };
    const cancelRecording = () => {
      if (stryMutAct_9fa48("379")) {
        {}
      } else {
        stryCov_9fa48("379");
        stryMutAct_9fa48("380") ? countdownTimerRef.current.reset() : (stryCov_9fa48("380"), countdownTimerRef.current?.reset());
        cleanup();
      }
    };
    const stopRecording = () => {
      if (stryMutAct_9fa48("381")) {
        {}
      } else {
        stryCov_9fa48("381");
        if (stryMutAct_9fa48("384") ? false : stryMutAct_9fa48("383") ? true : stryMutAct_9fa48("382") ? recorderRef.current : (stryCov_9fa48("382", "383", "384"), !recorderRef.current)) {
          if (stryMutAct_9fa48("385")) {
            {}
          } else {
            stryCov_9fa48("385");
            logger.warn(stryMutAct_9fa48("386") ? "" : (stryCov_9fa48("386"), 'cannot stopRecording() without a recorderRef'));
            return;
          }
        }
        recorderRef.current.stop();
        stopUserMedia();
      }
    };
    const submitRecording = () => {
      if (stryMutAct_9fa48("387")) {
        {}
      } else {
        stryCov_9fa48("387");
        if (stryMutAct_9fa48("390") ? false : stryMutAct_9fa48("389") ? true : stryMutAct_9fa48("388") ? finalBlob.current : (stryCov_9fa48("388", "389", "390"), !finalBlob.current)) {
          if (stryMutAct_9fa48("391")) {
            {}
          } else {
            stryCov_9fa48("391");
            logger.error(stryMutAct_9fa48("392") ? "" : (stryCov_9fa48("392"), 'Cannot submit recording without a blob'));
            return;
          }
        }
        const createdFile = new File(stryMutAct_9fa48("393") ? [] : (stryCov_9fa48("393"), [finalBlob.current]), stryMutAct_9fa48("394") ? "" : (stryCov_9fa48("394"), 'video-from-camera'), stryMutAct_9fa48("395") ? {} : (stryCov_9fa48("395"), {
          type: finalBlob.current.type
        }));
        setFile(createdFile);
        setShowUploadPage(stryMutAct_9fa48("396") ? false : (stryCov_9fa48("396"), true));
      }
    };
    const muteAudioTrack = (shouldMute: boolean) => {
      if (stryMutAct_9fa48("397")) {
        {}
      } else {
        stryCov_9fa48("397");
        if (stryMutAct_9fa48("399") ? false : stryMutAct_9fa48("398") ? true : (stryCov_9fa48("398", "399"), streamRef.current)) {
          if (stryMutAct_9fa48("400")) {
            {}
          } else {
            stryCov_9fa48("400");
            stryMutAct_9fa48("401") ? streamRef.current.getTracks().forEach(track => {
              track.enabled = !shouldMute;
            }) : (stryCov_9fa48("401"), streamRef.current.getTracks().filter(stryMutAct_9fa48("402") ? () => undefined : (stryCov_9fa48("402"), track => stryMutAct_9fa48("405") ? track.kind !== 'audio' : stryMutAct_9fa48("404") ? false : stryMutAct_9fa48("403") ? true : (stryCov_9fa48("403", "404", "405"), track.kind === (stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), 'audio'))))).forEach(track => {
              if (stryMutAct_9fa48("407")) {
                {}
              } else {
                stryCov_9fa48("407");
                track.enabled = stryMutAct_9fa48("408") ? shouldMute : (stryCov_9fa48("408"), !shouldMute);
              }
            }));
          }
        }
      }
    };
    const selectVideo = (evt: ChangeEvent<HTMLSelectElement>) => {
      if (stryMutAct_9fa48("409")) {
        {}
      } else {
        stryCov_9fa48("409");
        setVideoDeviceId(evt.target.value);
      }
    };
    const selectAudio = (evt: ChangeEvent<HTMLSelectElement>) => {
      if (stryMutAct_9fa48("410")) {
        {}
      } else {
        stryCov_9fa48("410");
        setAudioDeviceId(evt.target.value);
      }
    };
    const changeVideoSource = (source: VideoSources) => {
      if (stryMutAct_9fa48("411")) {
        {}
      } else {
        stryCov_9fa48("411");
        hardCleanup();
        router.push(stryMutAct_9fa48("412") ? {} : (stryCov_9fa48("412"), {
          pathname: stryMutAct_9fa48("413") ? "" : (stryCov_9fa48("413"), '/record'),
          query: stryMutAct_9fa48("414") ? {} : (stryCov_9fa48("414"), {
            source
          })
        }));
      }
    };
    const enableMicForScreenshare = async () => {
      if (stryMutAct_9fa48("415")) {
        {}
      } else {
        stryCov_9fa48("415");
        setIsMicDeviceEnabled(stryMutAct_9fa48("416") ? false : (stryCov_9fa48("416"), true));
        await getDevices();
      }
    };
    if (stryMutAct_9fa48("419") ? file || showUploadPage : stryMutAct_9fa48("418") ? false : stryMutAct_9fa48("417") ? true : (stryCov_9fa48("417", "418", "419"), file && showUploadPage)) {
      if (stryMutAct_9fa48("420")) {
        {}
      } else {
        stryCov_9fa48("420");
        return <UploadProgressFullpage file={file} resetPage={hardCleanup} />;
      }
    }

    /*
     * When recording your own camera it is really disorienting if
     * the video is not the mirror image.
     */
    const showMirrorImage = () => {
      if (stryMutAct_9fa48("421")) {
        {}
      } else {
        stryCov_9fa48("421");
        if (stryMutAct_9fa48("424") ? videoSource !== 'camera' : stryMutAct_9fa48("423") ? false : stryMutAct_9fa48("422") ? true : (stryCov_9fa48("422", "423", "424"), videoSource === (stryMutAct_9fa48("425") ? "" : (stryCov_9fa48("425"), 'camera')))) {
          if (stryMutAct_9fa48("426")) {
            {}
          } else {
            stryCov_9fa48("426");
            return stryMutAct_9fa48("427") ? isReviewing : (stryCov_9fa48("427"), !isReviewing);
          }
        }
        return stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428"), false);
      }
    };
    const isMuted = (): boolean => {
      if (stryMutAct_9fa48("429")) {
        {}
      } else {
        stryCov_9fa48("429");
        if (stryMutAct_9fa48("431") ? false : stryMutAct_9fa48("430") ? true : (stryCov_9fa48("430", "431"), streamRef.current)) {
          if (stryMutAct_9fa48("432")) {
            {}
          } else {
            stryCov_9fa48("432");
            return stryMutAct_9fa48("433") ? !streamRef.current.getTracks().filter(track => track.kind === 'audio' && !track.enabled).length : (stryCov_9fa48("433"), !(stryMutAct_9fa48("434") ? streamRef.current.getTracks().filter(track => track.kind === 'audio' && !track.enabled).length : (stryCov_9fa48("434"), !(stryMutAct_9fa48("435") ? streamRef.current.getTracks().length : (stryCov_9fa48("435"), streamRef.current.getTracks().filter(stryMutAct_9fa48("436") ? () => undefined : (stryCov_9fa48("436"), track => stryMutAct_9fa48("439") ? track.kind === 'audio' || !track.enabled : stryMutAct_9fa48("438") ? false : stryMutAct_9fa48("437") ? true : (stryCov_9fa48("437", "438", "439"), (stryMutAct_9fa48("441") ? track.kind !== 'audio' : stryMutAct_9fa48("440") ? true : (stryCov_9fa48("440", "441"), track.kind === (stryMutAct_9fa48("442") ? "" : (stryCov_9fa48("442"), 'audio')))) && (stryMutAct_9fa48("443") ? track.enabled : (stryCov_9fa48("443"), !track.enabled))))).length)))));
          }
        }
        return stryMutAct_9fa48("444") ? true : (stryCov_9fa48("444"), false);
      }
    };
    const isRecording = stryMutAct_9fa48("447") ? recordState !== RecordState.RECORDING : stryMutAct_9fa48("446") ? false : stryMutAct_9fa48("445") ? true : (stryCov_9fa48("445", "446", "447"), recordState === RecordState.RECORDING);
    return <Layout title="stream.new" description="Record a video" centered>
      <h1>{stryMutAct_9fa48("450") ? isRecording && startRecordTime && <StopWatch startTimeUnixMs={startRecordTime} /> && 'Video setup' : stryMutAct_9fa48("449") ? false : stryMutAct_9fa48("448") ? true : (stryCov_9fa48("448", "449", "450"), (stryMutAct_9fa48("452") ? isRecording && startRecordTime || <StopWatch startTimeUnixMs={startRecordTime} /> : stryMutAct_9fa48("451") ? false : (stryCov_9fa48("451", "452"), (stryMutAct_9fa48("454") ? isRecording || startRecordTime : stryMutAct_9fa48("453") ? true : (stryCov_9fa48("453", "454"), isRecording && startRecordTime)) && <StopWatch startTimeUnixMs={startRecordTime} />)) || (stryMutAct_9fa48("455") ? "" : (stryCov_9fa48("455"), 'Video setup')))}</h1>
      <VideoSourceToggle activeSource={videoSource} onChange={changeVideoSource} />
      {stryMutAct_9fa48("458") ? errorMessage || <div className='error-message'>{errorMessage}</div> : stryMutAct_9fa48("457") ? false : stryMutAct_9fa48("456") ? true : (stryCov_9fa48("456", "457", "458"), errorMessage && <div className='error-message'>{errorMessage}</div>)}
      <div className="skeleton-container">
        {stryMutAct_9fa48("461") ? !haveDeviceAccess && videoSource === 'camera' || <AccessSkeletonFrame onClick={startCamera} text={isRequestingMedia ? 'Loading device...' : 'Allow the browser to use your camera/mic'} /> : stryMutAct_9fa48("460") ? false : stryMutAct_9fa48("459") ? true : (stryCov_9fa48("459", "460", "461"), (stryMutAct_9fa48("463") ? !haveDeviceAccess || videoSource === 'camera' : stryMutAct_9fa48("462") ? true : (stryCov_9fa48("462", "463"), (stryMutAct_9fa48("464") ? haveDeviceAccess : (stryCov_9fa48("464"), !haveDeviceAccess)) && (stryMutAct_9fa48("466") ? videoSource !== 'camera' : stryMutAct_9fa48("465") ? true : (stryCov_9fa48("465", "466"), videoSource === (stryMutAct_9fa48("467") ? "" : (stryCov_9fa48("467"), 'camera')))))) && <AccessSkeletonFrame onClick={startCamera} text={isRequestingMedia ? stryMutAct_9fa48("468") ? "" : (stryCov_9fa48("468"), 'Loading device...') : stryMutAct_9fa48("469") ? "" : (stryCov_9fa48("469"), 'Allow the browser to use your camera/mic')} />)}
        {stryMutAct_9fa48("472") ? !haveDeviceAccess && videoSource === 'screen' || <AccessSkeletonFrame onClick={startScreenshare} text={isRequestingMedia ? 'Loading device...' : 'Allow the browser to access screenshare'} /> : stryMutAct_9fa48("471") ? false : stryMutAct_9fa48("470") ? true : (stryCov_9fa48("470", "471", "472"), (stryMutAct_9fa48("474") ? !haveDeviceAccess || videoSource === 'screen' : stryMutAct_9fa48("473") ? true : (stryCov_9fa48("473", "474"), (stryMutAct_9fa48("475") ? haveDeviceAccess : (stryCov_9fa48("475"), !haveDeviceAccess)) && (stryMutAct_9fa48("477") ? videoSource !== 'screen' : stryMutAct_9fa48("476") ? true : (stryCov_9fa48("476", "477"), videoSource === (stryMutAct_9fa48("478") ? "" : (stryCov_9fa48("478"), 'screen')))))) && <AccessSkeletonFrame onClick={startScreenshare} text={isRequestingMedia ? stryMutAct_9fa48("479") ? "" : (stryCov_9fa48("479"), 'Loading device...') : stryMutAct_9fa48("480") ? "" : (stryCov_9fa48("480"), 'Allow the browser to access screenshare')} />)}
      </div>
      {stryMutAct_9fa48("483") ? videoSource === '' || <div>Select camera or screenshare to get started</div> : stryMutAct_9fa48("482") ? false : stryMutAct_9fa48("481") ? true : (stryCov_9fa48("481", "482", "483"), (stryMutAct_9fa48("485") ? videoSource !== '' : stryMutAct_9fa48("484") ? true : (stryCov_9fa48("484", "485"), videoSource === (stryMutAct_9fa48("486") ? "Stryker was here!" : (stryCov_9fa48("486"), '')))) && <div>Select camera or screenshare to get started</div>)}
      <div className='video-container'>
        {<video className={showMirrorImage() ? stryMutAct_9fa48("487") ? "" : (stryCov_9fa48("487"), 'mirror-image') : stryMutAct_9fa48("488") ? "Stryker was here!" : (stryCov_9fa48("488"), '')} ref={videoRef} width="400" autoPlay />}
        <CountdownTimer ref={countdownTimerRef} onElapsed={startRecording} />
      </div>
      <div>
        {stryMutAct_9fa48("491") ? isLoadingPreview || 'Loading preview...' : stryMutAct_9fa48("490") ? false : stryMutAct_9fa48("489") ? true : (stryCov_9fa48("489", "490", "491"), isLoadingPreview && (stryMutAct_9fa48("492") ? "" : (stryCov_9fa48("492"), 'Loading preview...')))}
      </div>
      {stryMutAct_9fa48("495") ? haveDeviceAccess && videoSource === 'camera' || <CameraOptions isLoadingPreview={isLoadingPreview} isRecording={isRecording} isMuted={isMuted()} muteAudioTrack={muteAudioTrack} deviceList={deviceList} audioLevel={audioLevel} selectVideo={selectVideo} selectAudio={selectAudio} /> : stryMutAct_9fa48("494") ? false : stryMutAct_9fa48("493") ? true : (stryCov_9fa48("493", "494", "495"), (stryMutAct_9fa48("497") ? haveDeviceAccess || videoSource === 'camera' : stryMutAct_9fa48("496") ? true : (stryCov_9fa48("496", "497"), haveDeviceAccess && (stryMutAct_9fa48("499") ? videoSource !== 'camera' : stryMutAct_9fa48("498") ? true : (stryCov_9fa48("498", "499"), videoSource === (stryMutAct_9fa48("500") ? "" : (stryCov_9fa48("500"), 'camera')))))) && <CameraOptions isLoadingPreview={isLoadingPreview} isRecording={isRecording} isMuted={isMuted()} muteAudioTrack={muteAudioTrack} deviceList={deviceList} audioLevel={audioLevel} selectVideo={selectVideo} selectAudio={selectAudio} />)}
      {stryMutAct_9fa48("503") ? haveDeviceAccess && videoSource === 'screen' || <ScreenOptions isMicDeviceEnabled={isMicDeviceEnabled} enableMicForScreenshare={enableMicForScreenshare} isLoadingPreview={isLoadingPreview} isRecording={isRecording} isMuted={isMuted()} muteAudioTrack={muteAudioTrack} deviceList={deviceList} audioLevel={audioLevel} selectVideo={selectVideo} selectAudio={selectAudio} /> : stryMutAct_9fa48("502") ? false : stryMutAct_9fa48("501") ? true : (stryCov_9fa48("501", "502", "503"), (stryMutAct_9fa48("505") ? haveDeviceAccess || videoSource === 'screen' : stryMutAct_9fa48("504") ? true : (stryCov_9fa48("504", "505"), haveDeviceAccess && (stryMutAct_9fa48("507") ? videoSource !== 'screen' : stryMutAct_9fa48("506") ? true : (stryCov_9fa48("506", "507"), videoSource === (stryMutAct_9fa48("508") ? "" : (stryCov_9fa48("508"), 'screen')))))) && <ScreenOptions isMicDeviceEnabled={isMicDeviceEnabled} enableMicForScreenshare={enableMicForScreenshare} isLoadingPreview={isLoadingPreview} isRecording={isRecording} isMuted={isMuted()} muteAudioTrack={muteAudioTrack} deviceList={deviceList} audioLevel={audioLevel} selectVideo={selectVideo} selectAudio={selectAudio} />)}
      {stryMutAct_9fa48("511") ? haveDeviceAccess || <RecordingControls recordState={recordState} isLoadingPreview={isLoadingPreview} isReviewing={isReviewing} startRecording={prepRecording} cancelRecording={cancelRecording} stopRecording={stopRecording} submitRecording={submitRecording} reset={reset} /> : stryMutAct_9fa48("510") ? false : stryMutAct_9fa48("509") ? true : (stryCov_9fa48("509", "510", "511"), haveDeviceAccess && <RecordingControls recordState={recordState} isLoadingPreview={isLoadingPreview} isReviewing={isReviewing} startRecording={prepRecording} cancelRecording={cancelRecording} stopRecording={stopRecording} submitRecording={submitRecording} reset={reset} />)}
      <style jsx>{stryMutAct_9fa48("512") ? `` : (stryCov_9fa48("512"), `
        .error-message {
          color: #C9473F;
          max-width: 400px;
          padding-bottom: 20px;
          text-align: center;
          line-height: 24px;
        }
        .skeleton-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .video-container {
          position: relative;
        }
        video {
          display: ${haveDeviceAccess ? stryMutAct_9fa48("513") ? "" : (stryCov_9fa48("513"), 'block') : stryMutAct_9fa48("514") ? "" : (stryCov_9fa48("514"), 'none')};
          border-radius: 30px;
        }
        video.mirror-image {
          -webkit-transform: scaleX(-1);
          transform: scaleX(-1);
        }
        h1 {
          margin-top: 3vh;
          font-size: 3.5vw;
        }
      `)}
      </style>
    </Layout>;
  }
};
export default RecordPage;