/* global navigator MediaRecorder Blob File */
import { useRef, useEffect, useState } from 'react';
import Layout from './layout';
import Button from './button';
import UploadProgressFullpage from './upload-progress-fullpage';
import logger from '../lib/logger';

const DEVICE_ID_NO_MIC = 'no-mic';
const MEDIA_RECORDER_TIMESLICE_MS = 2000;

const noop = () => { };

const ActionButtons = ({
  hasMediaRecorder,
  isRecording,
  startRecording,
  stopRecording,
  reset,
}) => (
  <div>
    {!hasMediaRecorder && <p className="error">Unable to record: your browser does not have MediaRecorder. You may need to enable this in Experimental Features.</p>}
    <Button type="button" onClick={hasMediaRecorder ? startRecording : noop} disabled={!hasMediaRecorder || isRecording}>Start recording</Button>
    <Button type="button" onClick={stopRecording} disabled={!isRecording}>Stop & upload</Button>
    <Button type="button" onClick={reset} disabled={!isRecording}>reset</Button>
    <style jsx>{`
      .error {
        color: red;
        max-width: 400px;
      }
    `}
    </style>
  </div>
);

const StopWatch = ({ startTimeUnixMs }) => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = (new Date()).valueOf();
      const secs = (now - startTimeUnixMs) / 1000;
      setTime(`${Math.floor(secs)} seconds`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>{time}</div>
  );
};

function Recorder () {
  const [file, setFile] = useState(null);
  const [startRecordTime, setStartRecordTime] = useState(null);
  const [isRecording, setRecording] = useState(false);
  const [haveDeviceAccess, setHaveDeviceAccess] = useState(false);
  const [videoDeviceId, setVideoDeviceId] = useState(null);
  const [audioDeviceId, setAudioDeviceId] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const mediaChunks = useRef([]);
  const [deviceList, setDevices] = useState({ video: [], audio: [] });
  const hasMediaRecorder = (typeof MediaRecorder !== 'undefined');

  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const list = { video: [], audio: [] };

    devices.forEach((device) => {
      logger('found device', device);
      if (device.kind === 'videoinput') {
        list.video.push(device);
      }
      if (device.kind === 'audioinput') {
        list.audio.push(device);
      }
    });
    list.audio.push({ label: '--no microphone--', deviceId: DEVICE_ID_NO_MIC });
    setDevices({ ...list });
  };

  const startPreview = async () => {
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
        await navigator.mediaDevices.getUserMedia(constraints);
        await getDevices();
        logger('requesting user media with constraints', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        setHaveDeviceAccess(true);
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    }
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
      startPreview();
    }
  }, [videoDeviceId, audioDeviceId]);

  const startRecording = async () => {
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
      setRecording(true);
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) {
      logger.warn('cannot stopRecording() without a recorderRef');
      return;
    }
    recorderRef.current.onstop = function onRecorderStop () {
      const blob = new Blob(mediaChunks.current, { type: 'video/webm' });
      const createdFile = new File([blob], 'video-from-camera');
      setFile(createdFile);
    };
    recorderRef.current.stop();
  };

  const selectVideo = async (evt) => {
    await setVideoDeviceId(evt.target.value);
  };

  const selectAudio = async (evt) => {
    await setAudioDeviceId(evt.target.value);
  };

  const reset = async () => {
    if (!recorderRef.current) {
      logger.warn('cannot reset without a recorderRef');
      return;
    }
    recorderRef.current.onstop = function onRecorderStop () {
      mediaChunks.current = [];
      logger('recorder reset');
    };
    recorderRef.current.stop();
    setRecording(false);
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
      {!haveDeviceAccess && <Button type="button" onClick={startPreview}>Allow the browser to use your camera/mic</Button>}
      <video ref={videoRef} width="400" autoPlay />
      {haveDeviceAccess
        && (
          <div className="device-pickers">
            <select onChange={selectVideo} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
              {
                deviceList.video.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
              }
            </select>
            <div className="audio-levels">
              <div className="level-1" />
              <div className="level-2" />
              <div className="level-3" />
              <div className="level-4" />
              <div className="level-5" />
              <div className="level-6" />
            </div>
            <select onChange={selectAudio} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
              {
                deviceList.audio.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
              }
            </select>
          </div>
        )}
      <div className="stopwatch">
        { isRecording && startRecordTime && <StopWatch startTimeUnixMs={startRecordTime} /> }
      </div>
      { haveDeviceAccess && <ActionButtons hasMediaRecorder={hasMediaRecorder} isRecording={isRecording} startRecording={startRecording} stopRecording={stopRecording} reset={reset} />}
      <style jsx>{`
        .device-pickers {
          display: flex;
          flex-direction: column;
          width: 400px;
        }
        .stopwatch {
          padding-bottom: 20px 0 ;
          height: 30px;
        }
        .audio-levels {
          display: flex;
          justify-content: center;
        }
        .audio-levels > div {
          width: 30px;
          height: 10px;
          margin-right: 10px;
        }
        .audio-levels > div:last-child {
          margin-right: 0;
        }
        .level-1 {
          background-color: #222;
        }
        .level-2 {
          background-color: #222;
        }
        .level-3 {
          background-color: #222;
        }
        .level-4 {
          background-color: #ccc;
        }
        .level-5 {
          background-color: #ccc;
        }
        .level-6 {
          background-color: #ccc;
        }
        select {
          margin: 18px 0;
          padding: 11px;
          background: transparent;
          font-size: 26px;
          color: #b0b0b0;
          width: 400px;
        }
      `}
      </style>
    </Layout>
  );
}

export default function RecordPage () {
  return <Recorder />;
}
