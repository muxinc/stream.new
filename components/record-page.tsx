/* global navigator MediaRecorder Blob File */
import { useRef, useEffect, useState, ChangeEvent } from 'react';
import Layout from './layout';
import Button from './button';
import StopWatch from './stop-watch';
import AudioBars from './audio-bars';
import UploadProgressFullpage from './upload-progress-fullpage';
import logger from '../lib/logger';

const DEVICE_ID_NO_MIC = 'no-mic';
// const DEVICDE_ID_SCREEN = 'screenshare';
const MEDIA_RECORDER_TIMESLICE_MS = 2000;

const noop = () => void 0;

type ActionButtonProps = {
  hasMediaRecorder: boolean;
  isRecording: boolean;
  isLoadingPreview: boolean;
  isReviewing: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  submitRecording: () => void;
  reset: () => void;
};

const ActionButtons: React.FC<ActionButtonProps> = ({ hasMediaRecorder,
  isRecording,
  isLoadingPreview,
  isReviewing,
  startRecording,
  stopRecording,
  submitRecording,
  reset,
}) => (
  <div className="container">
    {!hasMediaRecorder && <p className="error">Unable to record: your browser does not have MediaRecorder. You may need to enable this in Experimental Features.</p>}
    <Button type="button" onClick={hasMediaRecorder ? startRecording : noop} disabled={!hasMediaRecorder || isRecording || isReviewing}>Start recording</Button>
    <Button type="button" onClick={stopRecording} disabled={!isRecording}>Stop</Button>
    <Button type="button" onClick={submitRecording} disabled={!isReviewing || isLoadingPreview}>{ isLoadingPreview ? 'Loading preview...' : 'Submit' }</Button>
    <Button type="button" onClick={reset} disabled={!isReviewing}>Reset</Button>
    <style jsx>{`
      .error {
        color: red;
        max-width: 400px;
      }
      .container {
        display: flex;
        flex-direction: column;
      }
    `}
    </style>
  </div>
);

const getAudioContext = () => typeof window !== undefined && window.AudioContext || window.webkitAudioContext;

type DeviceItems = MediaDeviceInfo[];
type DeviceList = {
  video: DeviceItems;
  audio: DeviceItems;
};

type NoProps = Record<never, never>

const RecordPage: React.FC<NoProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [startRecordTime, setStartRecordTime] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [haveDeviceAccess, setHaveDeviceAccess] = useState(false);
  const [videoDeviceId, setVideoDeviceId] = useState('');
  const [audioDeviceId, setAudioDeviceId] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioInterval = useRef<number | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const finalBlob = useRef<Blob | null>(null);
  const [deviceList, setDevices] = useState({ video: [], audio: [] } as DeviceList);
  const hasMediaRecorder = (typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined');

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

  const startAv = async () => {
    logger('start av');
    cleanup();
    // todo - error if not supported
    if (navigator.mediaDevices) {
      const video = videoDeviceId ? { deviceId: videoDeviceId } : true;
      let audio;
      if (audioDeviceId === DEVICE_ID_NO_MIC) {
        audio = false;
      } else if (audioDeviceId) {
        audio = { deviceId: audioDeviceId };
      } else {
        audio = true;
      }

      const constraints = { video, audio };
      try {
        /*
         * If we try to getDevices() before getUserMedia(), then in firefox
         * the device 'label' is empty.
         *
         * For that reason, we need to do a "fake" getUserMedia() first so that
         * we get permissions, then getDevices(), then do getUserMedia() for real
         * a 2nd time.
         *
         */
        await getDevices();
        logger('requesting user media with constraints', constraints);
        /*
        if (video.deviceId === DEVICDE_ID_SCREEN) {
          stream = await navigator.mediaDevices.getDisplayMedia();
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.addTrack(audioStream.getAudioTracks()[0]);
        } else {
        */
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const AudioContext = getAudioContext();
        if (AudioContext) {
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
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    }
    return function teardown () {
      cleanup();
    };
  };

  const reset = async () => {
    cleanup();
    setIsReviewing(false);
    setIsLoadingPreview(false);
    startAv();
  };

  useEffect(() => {
    //
    // This updates the device list when the list changes. For example
    // plugging in or unplugging a mic or camera
    //
    navigator.mediaDevices.ondevicechange = getDevices;
  });

  useEffect(() => {
    if (videoDeviceId || audioDeviceId) {
      startAv();
    }
  }, [videoDeviceId, audioDeviceId]);

  const startRecording = async () => {
    logger('start recording');
    try {
      setStartRecordTime((new Date()).valueOf());
      const preferredOptions = { mimeType: 'video/webm;codecs=vp9' };
      const backupOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
      let options = preferredOptions;
      if (!MediaRecorder.isTypeSupported(preferredOptions.mimeType)) {
        options = backupOptions;
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

  const selectVideo = async (evt: ChangeEvent<HTMLSelectElement>) => {
    await setVideoDeviceId(evt.target.value);
  };

  const selectAudio = async (evt: ChangeEvent<HTMLSelectElement>) => {
    await setAudioDeviceId(evt.target.value);
  };

  if (file) {
    return <UploadProgressFullpage file={file} />;
  }

  return (
    <Layout
      title="stream.new"
      description="Record a video"
    >
      <h1>Camera setup</h1>
      {!haveDeviceAccess && <Button type="button" onClick={startAv}>Allow the browser to use your camera/mic</Button>}
      <video ref={videoRef} width="400" autoPlay />
      <div>
        { isLoadingPreview && 'Loading preview...' }
      </div>
      {haveDeviceAccess
        && (
          <div className="device-pickers">
            <select onBlur={selectVideo} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
              {
                deviceList.video.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
              }
            </select>
            <AudioBars audioLevel={audioLevel} />
            <select onBlur={selectAudio} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
              {
                deviceList.audio.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
              }
            </select>
          </div>
        )}
      <div className="stopwatch">
        { isRecording && startRecordTime && <StopWatch startTimeUnixMs={startRecordTime} /> }
      </div>
      { haveDeviceAccess && (
      <ActionButtons
        hasMediaRecorder={hasMediaRecorder}
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
        .device-pickers {
          width: 400px;
        }
        .stopwatch {
          padding-bottom: 20px 0 ;
          height: 30px;
        }
        select {
          margin: 18px 0;
          padding: 11px;
          background: transparent;
          font-size: 26px;
          color: #b0b0b0;
          width: 400px;
          line-height: 26px;
        }
      `}
      </style>
    </Layout>
  );
}

export default RecordPage;
