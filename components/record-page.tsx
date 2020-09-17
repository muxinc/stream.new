/* global navigator MediaRecorder Blob File */
/* eslint-disable jsx-a11y/no-onchange */
import { useRef, useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Layout from './layout';
import Button from './button';
import StopWatch from './stop-watch';
import VideoSourceToggle from './video-source-toggle';
import RecordingControls from './recording-controls';
import CameraOptions from './camera-options';
import ScreenOptions from './screen-options';
import UploadProgressFullpage from './upload-progress-fullpage';
import logger from '../lib/logger';

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
  const [file, setFile] = useState<File | null>(null);
  const [startRecordTime, setStartRecordTime] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
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
  const [deviceList, setDevices] = useState({ video: [], audio: [] } as DeviceList);
  // const hasMediaRecorder = (typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined');

  useEffect(() => {
    if (router.query && router.query.source) {
      const source = (router.query as QueryParams).source;
      setVideoSource(source);
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
    const sampleSize = 10;
    // dataArray will give us an array of numbers ranging from 0 to 255
    const dataArray = new Uint8Array(sampleSize);
    analyser.getByteFrequencyData(dataArray);
    const average = (dataArray.reduce((a, b) => a + b) / dataArray.length);
    const audioLevelValue = Math.round((average / 255) * 100);
    setAudioLevel(audioLevelValue);
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
    setIsRecording(false);
  };

  /*
   * do a cleanup, and also cancel all media streams
   */
  const hardCleanup = () => {
    cleanup();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    setIsReviewing(false);
    setIsLoadingPreview(false);
    setHaveDeviceAccess(false);
    setIsMicDeviceEnabled(false);
  }

  const startAv = () => {
    cleanup();
    if (!videoSource) {
      logger.error('Cannot startAv without a video source');
      return
    }
    if (videoSource === 'camera') {
      startCamera();
    }
    if (videoSource === 'screen') {
      startScreenshare();
    }
  }

  const setupStream = (stream: MediaStream) => {
    const AudioContext = getAudioContext();
    if (isMicDeviceEnabled && AudioContext) {
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      mediaStreamSource.connect(analyser);

      audioInterval.current = window.setInterval(() => {
        updateAudioLevels(analyser);
      }, 500);
    }
    streamRef.current = stream;
    if (videoRef.current !== null) {
      (videoRef.current as HTMLVideoElement).srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.controls = false;
    }
    setHaveDeviceAccess(true);
  }

  const startCamera = async () => {
    // todo - error if not supported
    if (navigator.mediaDevices) {
      const video = videoDeviceId ? { deviceId: videoDeviceId } : true;
      const audio = audioDeviceId ? { deviceId: audioDeviceId } : true;
      const constraints = { video, audio };
      try {
        await getDevices();
        logger('requesting user media with constraints', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setupStream(stream)
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    }
    return function teardown () {
      hardCleanup();
    };
  };

  const startScreenshare = async () => {
    // todo - error if not supported
    if (navigator.mediaDevices) {
      const audio = audioDeviceId ? { deviceId: audioDeviceId } : true;
      const constraints = { video: false, audio };
      try {
        const stream = streamRef.current || await navigator.mediaDevices.getDisplayMedia({ video: true });
        console.log('debug isMicDeviceEnabled', isMicDeviceEnabled);
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
        setupStream(stream)
      } catch (err) {
        logger.error(err);
      }
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
  });

  useEffect(() => {
    console.log('debug startAv', isMicDeviceEnabled, videoDeviceId, audioDeviceId);
    if (isMicDeviceEnabled || videoDeviceId || audioDeviceId) {
      startAv();
    }
  }, [videoDeviceId, audioDeviceId, isMicDeviceEnabled]);

  const startRecording = async () => {
    logger('start recording');
    try {
      setStartRecordTime((new Date()).valueOf());
      const preferredOptions = { mimeType: 'video/webm;codecs=vp9' };
      const backupOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
      let options = preferredOptions;
      /*
       * MediaRecorder.isTypeSupported is not a thing in safari,
       * good thing safari supports the preferredOptions
       */
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (!MediaRecorder.isTypeSupported(preferredOptions.mimeType)) {
          options = backupOptions;
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
      setIsRecording(true);
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  };

  const submitRecording = () => {
    if (!finalBlob.current) {
      logger.error('Cannot submit recording without a blob');
      return;
    }
    const createdFile = new File([finalBlob.current], 'video-from-camera');
    setFile(createdFile);
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      logger.warn('cannot stopRecording() without a recorderRef');
      return;
    }
    recorderRef.current.onstop = function onRecorderStop () {
      finalBlob.current = new Blob(mediaChunks.current, { type: 'video/webm' });
      const objUrl = URL.createObjectURL(finalBlob.current);
      if (videoRef.current !== null) {
        videoRef.current.srcObject = null;
        videoRef.current.src = objUrl;
        videoRef.current.controls = true;
        videoRef.current.muted = false;
        setIsReviewing(true);
      }
      /*
      setIsLoadingPreview(true);

      videoRef.current.addEventListener('canplaythrough', () => {
        videoRef.current.addEventListener('durationchange', () => {
          logger('got video durationchange', isLoadingPreview);
          if (isLoadingPreview) {
            setIsLoadingPreview(false);
            setIsReviewing(true);
          }
        });
      });
      */
      cleanup();
    };
    recorderRef.current.stop();
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
  }

  const enableMicForScreenshare = async () => {
    setIsMicDeviceEnabled(true);
    await getDevices();
  }

  if (file) {
    return <UploadProgressFullpage file={file} />;
  }

  return (
    <Layout
      title="stream.new"
      description="Record a video"
    >
      <h1>Video setup</h1>
      <VideoSourceToggle activeSource={videoSource} onChange={changeVideoSource} />
      {!haveDeviceAccess && videoSource === 'camera' && <Button type="button" onClick={startCamera}>Allow the browser to use your camera/mic</Button>}
      {!haveDeviceAccess && videoSource === 'screen' && <Button type="button" onClick={startScreenshare}>Allow the browser to access screenshare</Button>}
      { videoSource === '' && <div>Select camera or screenshare to get started</div>}
      {<video ref={videoRef} width="400" autoPlay />}
      <div>
        { isLoadingPreview && 'Loading preview...' }
      </div>
      {haveDeviceAccess && videoSource === 'camera' &&
        <CameraOptions
          isLoadingPreview={isLoadingPreview}
          isRecording={isRecording}
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
          deviceList={deviceList}
          audioLevel={audioLevel}
          selectVideo={selectVideo}
          selectAudio={selectAudio}
        />
      }
      <div className="stopwatch">
        { isRecording && startRecordTime && <StopWatch startTimeUnixMs={startRecordTime} /> }
      </div>
      { haveDeviceAccess && (
      <RecordingControls
        isRecording={isRecording}
        isLoadingPreview={isLoadingPreview}
        isReviewing={isReviewing}
        startRecording={startRecording}
        stopRecording={stopRecording}
        submitRecording={submitRecording}
        reset={reset}
      />
      )}
      <style jsx>{`
        video {
          display: ${haveDeviceAccess ? 'block' : 'none'};
        }
        .stopwatch {
          padding-bottom: 20px 0 ;
          height: 30px;
        }
        .audio-bars {
          margin: 18px 0;
        }
      `}
      </style>
    </Layout>
  );
}

export default RecordPage;
