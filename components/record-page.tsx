/* global navigator MediaRecorder Blob File */
/* eslint-disable jsx-a11y/no-onchange */
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
import CountdownTimer, {CountdownTimerHandles} from './countdown-timer';
import { RecordState } from '../types';

const MEDIA_RECORDER_TIMESLICE_MS = 2000;

const getAudioContext = () => typeof window !== undefined && window.AudioContext || window.webkitAudioContext;

type DeviceItems = MediaDeviceInfo[];

type DeviceList = {
  video: DeviceItems;
  audio: DeviceItems;
};

type VideoSources = 'camera' | 'screen';

type QueryParams = {
  source: VideoSources
};

const RecordPage: React.FC<NoProps> = () => {
  const router = useRouter();
  const [videoSource, setVideoSource] = useState<'camera' | 'screen' | ''>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [startRecordTime, setStartRecordTime] = useState<number | null>(null);
  const [recordState, setRecordState] = useState(RecordState.IDLE);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [haveDeviceAccess, setHaveDeviceAccess] = useState(false);
  const [isMicDeviceEnabled, setIsMicDeviceEnabled] = useState(false);
  const [videoDeviceId, setVideoDeviceId] = useState('');
  const [audioDeviceId, setAudioDeviceId] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioInterval = useRef<number | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const finalBlob = useRef<Blob | null>(null);
  const countdownTimerRef = useRef<CountdownTimerHandles | null>(null);
  const [deviceList, setDevices] = useState({ video: [], audio: [] } as DeviceList);
  const [showUploadPage, setShowUploadPage] = useState(true);

  useEffect(() => {
    if (router.query && router.query.source) {
      const source = (router.query as QueryParams).source;
      setVideoSource(source);
    }
    if (router.query && !router.query.source) {
      router.push({ pathname: '/record', query: { source: 'camera' } });
    }
  }, [router]);

  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const list: DeviceList = { video: [], audio: [] };

    devices.forEach((device) => {
      if (device.kind === 'videoinput') {
        list.video.push(device);
      }
      if (device.kind === 'audioinput') {
        list.audio.push(device);
      }
    });
    setDevices({ ...list });
  };

  const updateAudioLevels = (analyser: AnalyserNode) => {
    // dataArray will give us an array of numbers ranging from 0 to 255
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const average = (dataArray.reduce((a, b) => a + b) / dataArray.length);
    // cthese values are between 0 - 255, we want the average and
    // to convert it into a value between 0 - 100
    const audioLevelValue = Math.round((average / 255) * 100);
    setAudioLevel(audioLevelValue);
  };

  const stopUserMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        logger('stopping track', track.kind, track.label);
        track.stop();
      });
    }
    streamRef.current = null;
  };

  /*
   * Stop all recording, cancel audio interval
   */
  const cleanup = () => {
    logger('cleanup');
    if (recorderRef.current) {
      if (recorderRef?.current?.state === 'inactive') {
        logger('skipping recorder stop() b/c state is "inactive"');
      } else {
        recorderRef.current.onstop = function onRecorderStop () {
          logger('recorder cleanup');
        };
        recorderRef.current.stop();
      }
    }
    mediaChunks.current = [];
    if (audioInterval.current) {
      clearInterval(audioInterval.current);
    }
    setRecordState(RecordState.IDLE);
    setErrorMessage('');
    setShowUploadPage(false);
  };

  /*
   * do a cleanup, and also cancel all media streams
   */
  const hardCleanup = () => {
    cleanup();
    stopUserMedia();
    setIsReviewing(false);
    setIsLoadingPreview(false);
    setHaveDeviceAccess(false);
    setIsMicDeviceEnabled(false);
    setVideoDeviceId('');
    setAudioDeviceId('');
  };

  const startAv = () => {
    cleanup();
    if (!videoSource) {
      logger.error('Cannot startAv without a video source');
      return;
    }
    if (videoSource === 'camera') {
      startCamera();
    }
    if (videoSource === 'screen') {
      startScreenshare();
    }
  };

  const setupStream = (stream: MediaStream) => {
    const AudioContext = getAudioContext();

    if (
        AudioContext && videoSource === 'camera' ||
        AudioContext && videoSource === 'screen' && isMicDeviceEnabled
    ) {
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = 0.3;
      analyser.fftSize = 1024;
      mediaStreamSource.connect(analyser);

      audioInterval.current = window.setInterval(() => {
        updateAudioLevels(analyser);
      }, 100);
    }
    streamRef.current = stream;
    if (videoRef.current !== null) {
      (videoRef.current as HTMLVideoElement).srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.controls = false;
    }
    setHaveDeviceAccess(true);
  };

  const startCamera = async () => {
    if (navigator.mediaDevices) {
      const video = videoDeviceId ? { deviceId: videoDeviceId } : true;
      const audio = audioDeviceId ? { deviceId: audioDeviceId } : true;
      const constraints = { video, audio };
      try {
        /*
         * We have to call getDevices() twice b/c of firefox.
         * The first time we getDevices() in firefox the device.label is an empty string
         * After getUserMedia() happens successfully, then we can getDevices() again to
         * and the 2nd time then device.label will be populated :shrug:
         */
        await getDevices();
        logger('requesting user media with constraints', constraints);
        /*
         * This gets called when a new device is selected, we want to stopUserMedia()
         * when re-initializing a camera
         *
         * You will notice that in startScreenshare() we do not call stopUserMedia()
         * because we want the screenshare to stay the same while the microphone input
         * gets changed
         */
        stopUserMedia();
        setIsRequestingMedia(true);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setIsRequestingMedia(false);
        setErrorMessage('');
        await getDevices();
        setupStream(stream);
      } catch (err) {
        logger.error('getdevices error', err);
        setIsRequestingMedia(false);
        setErrorMessage('Error getting devices, you may have denied access already, if so you will have to allow access in browser settings.');
      }
    } else {
      setErrorMessage('navigator.mediaDevices not available in this browser');
    }
    return function teardown () {
      hardCleanup();
    };
  };

  const startScreenshare = async () => {
    if (navigator.mediaDevices) {
      const audio = audioDeviceId ? { deviceId: audioDeviceId } : true;
      const constraints = { video: false, audio };
      try {
        const stream = streamRef.current || await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (isMicDeviceEnabled) {
          logger('requesting user media with constraints', constraints);
          const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
          /*
           * if we already have an audio track it needs to be removed
           * this happens when a user changes the mic input
           */
          stream.getTracks().filter(track => track.kind === 'audio').forEach(track => {
            stream.removeTrack(track);
          });
          stream.addTrack(audioStream.getAudioTracks()[0]);
        }
        setupStream(stream);
      } catch (err) {
        logger.error(err);
        setIsRequestingMedia(false);
        setErrorMessage('Error getting screenshare. Please allow screen access in your browser settings.');
      }
    } else {
      setErrorMessage('navigator.mediaDevices not available in this browser');
    }
    return function teardown () {
      hardCleanup();
    };
  };

  const reset = async () => {
    hardCleanup();
  };

  useEffect(() => {
    //
    // This updates the device list when the list changes. For example
    // plugging in or unplugging a mic or camera
    //
    navigator.mediaDevices.ondevicechange = getDevices;
  }, []);

  useEffect(() => {
    if (isMicDeviceEnabled || videoDeviceId || audioDeviceId) {
      startAv();
    }
  }, [videoDeviceId, audioDeviceId, isMicDeviceEnabled]);

  const prepRecording = () => {
    logger('prep recording');
    if (typeof MediaRecorder === 'undefined') {
      setErrorMessage('MediaRecorder not available in your browser. You may be able to enable this in Experimental Features');
      return;
    }
    countdownTimerRef.current?.start();
    setRecordState(RecordState.PREPARING);
  };

  const startRecording = async () => {
    if (isRecording) {
      logger.warn('we are already recording');
      return;
    }
    if (isReviewing) {
      logger.warn('cannot start recording when you are reviewing your last recording');
      return;
    }
    logger('start recording');
    try {
      setStartRecordTime((new Date()).valueOf());
      const preferredOptions = { mimeType: 'video/webm;codecs=vp9' };
      const backupOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
      const lastResortOptions = { mimeType: 'video/mp4;codecs=avc1' };
      let options = preferredOptions;
      /*
       * MediaRecorder.isTypeSupported is not a thing in safari,
       * good thing safari supports the preferredOptions
       */
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (!MediaRecorder.isTypeSupported(preferredOptions.mimeType)) {
          options = backupOptions;
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = lastResortOptions;
          }
        }
      }

      const stream = streamRef.current;
      if (!stream) throw new Error('Cannot record without a stream');
      recorderRef.current = new MediaRecorder(stream, options);
      recorderRef.current.start(MEDIA_RECORDER_TIMESLICE_MS);
      recorderRef.current.ondataavailable = (evt) => {
        mediaChunks.current.push(evt.data);
        logger('added media recorder chunk', mediaChunks.current.length);
      };
      recorderRef.current.onstop = function onRecorderStop () {
        finalBlob.current = new Blob(mediaChunks.current, { type: recorderRef.current?.mimeType });
        const objUrl = URL.createObjectURL(finalBlob.current);
        if (videoRef.current !== null) {
          videoRef.current.srcObject = null;
          videoRef.current.src = objUrl;
          videoRef.current.controls = true;
          videoRef.current.muted = false;
          setIsReviewing(true);
        }
        cleanup();
      };
      setRecordState(RecordState.RECORDING);
    } catch (err) {
      logger.error(err); // eslint-disable-line no-console
      setErrorMessage('Error attempting to start recording, check console for details');
    }
  };

  const cancelRecording = () => {
    countdownTimerRef.current?.reset();
    cleanup();
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      logger.warn('cannot stopRecording() without a recorderRef');
      return;
    }
    recorderRef.current.stop();
    stopUserMedia();
  };

  const submitRecording = () => {
    if (!finalBlob.current) {
      logger.error('Cannot submit recording without a blob');
      return;
    }
    const createdFile = new File([finalBlob.current], 'video-from-camera', {type: finalBlob.current.type});
    setFile(createdFile);
    setShowUploadPage(true);
  };

  const muteAudioTrack = (shouldMute: boolean) => {
    if (streamRef.current) {
      streamRef.current.getTracks().filter(track => track.kind === 'audio').forEach(track => {
        track.enabled = !shouldMute;
      });
    }
  };

  const selectVideo = (evt: ChangeEvent<HTMLSelectElement>) => {
    setVideoDeviceId(evt.target.value);
  };

  const selectAudio = (evt: ChangeEvent<HTMLSelectElement>) => {
    setAudioDeviceId(evt.target.value);
  };

  const changeVideoSource = (source: VideoSources) => {
    hardCleanup();
    router.push({ pathname: '/record', query: { source } });
  };

  const enableMicForScreenshare = async () => {
    setIsMicDeviceEnabled(true);
    await getDevices();
  };

  if (file && showUploadPage) {
    return <UploadProgressFullpage file={file} resetPage={hardCleanup}/>;
  }

  /*
   * When recording your own camera it is really disorienting if
   * the video is not the mirror image.
   */
  const showMirrorImage = () => {
    if (videoSource === 'camera') {
      return !isReviewing;
    }
    return false;
  };

  const isMuted = (): boolean => {
    if (streamRef.current) {
      return !!streamRef.current.getTracks().filter(track => track.kind === 'audio' && !track.enabled).length;
    }
    return false;
  };

  const isRecording = recordState === RecordState.RECORDING;

  return (
    <Layout
      title="stream.new"
      description="Record a video"
      centered
    >
      <h1>{(isRecording && startRecordTime && <StopWatch startTimeUnixMs={startRecordTime} />) || 'Video setup'}</h1>
      <VideoSourceToggle activeSource={videoSource} onChange={changeVideoSource} />
      {errorMessage && <div className='error-message'>{errorMessage}</div>}
      <div className="skeleton-container">
        {!haveDeviceAccess && videoSource === 'camera' &&
          <AccessSkeletonFrame onClick={startCamera} text={ isRequestingMedia ? 'Loading device...' : 'Allow the browser to use your camera/mic' } />
        }
        {!haveDeviceAccess && videoSource === 'screen' &&
          <AccessSkeletonFrame onClick={startScreenshare} text={ isRequestingMedia ? 'Loading device...' : 'Allow the browser to access screenshare' } />
        }
      </div>
      { videoSource === '' && <div>Select camera or screenshare to get started</div>}
      <div className='video-container'>
        {<video className={showMirrorImage() ? 'mirror-image' : ''} ref={videoRef} width="400" autoPlay />}
        <CountdownTimer ref={countdownTimerRef} onElapsed={startRecording} />
      </div>
      <div>
        { isLoadingPreview && 'Loading preview...' }
      </div>
      {haveDeviceAccess && videoSource === 'camera' &&
        <CameraOptions
          isLoadingPreview={isLoadingPreview}
          isRecording={isRecording}
          isMuted={isMuted()}
          muteAudioTrack={muteAudioTrack}
          deviceList={deviceList}
          audioLevel={audioLevel}
          selectVideo={selectVideo}
          selectAudio={selectAudio}
        />
      }
      {haveDeviceAccess && videoSource === 'screen' &&
        <ScreenOptions
          isMicDeviceEnabled={isMicDeviceEnabled}
          enableMicForScreenshare={enableMicForScreenshare}
          isLoadingPreview={isLoadingPreview}
          isRecording={isRecording}
          isMuted={isMuted()}
          muteAudioTrack={muteAudioTrack}
          deviceList={deviceList}
          audioLevel={audioLevel}
          selectVideo={selectVideo}
          selectAudio={selectAudio}
        />
      }
      { haveDeviceAccess && (
      <RecordingControls
        recordState={recordState}
        isLoadingPreview={isLoadingPreview}
        isReviewing={isReviewing}
        startRecording={prepRecording}
        cancelRecording={cancelRecording}
        stopRecording={stopRecording}
        submitRecording={submitRecording}
        reset={reset}
      />
      )}
      <style jsx>{`
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
          display: ${haveDeviceAccess ? 'block' : 'none'};
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
      `}
      </style>
    </Layout>
  );
};

export default RecordPage;
