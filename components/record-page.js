/* global navigator MediaRecorder Blob File */
import { useRef, useState } from 'react';
import Layout from './layout';
import Button from './button';
import { MUX_HOME_PAGE_URL } from '../constants';

function Recorder () {
  const [isRecording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const videoRef = useRef(null);

  const recordMedia = async () => {
    if (navigator.mediaDevices) {
      const constraints = { video: true, audio: true };
      const preferredOptions = { mimeType: 'video/webm;codecs=vp9' };
      const backupOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
      let options = preferredOptions;
      if (!MediaRecorder.isTypeSupported(preferredOptions.mimeType)) {
        options = backupOptions;
      }
      const chunks = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        recorderRef.current = new MediaRecorder(stream, options);
        videoRef.current.srcObject = stream;
        recorderRef.current.start();
        setRecording(true);
        recorderRef.current.onstop = function onRecorderStop () {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const file = new File([blob], 'video-from-camera');
          console.log('TODO - startUpload', file); // eslint-disable-line no-console
          // startUpload(file);
        };
        recorderRef.current.ondataavailable = (evt) => chunks.push(evt.data);
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        if (recorderRef.current) {
          recorderRef.current.stop();
        }
      }
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
  };

  return (
    <div>
      {!isRecording && <Button type="button" onClick={recordMedia}>Record in-browser</Button>}
      <video ref={videoRef} width="400" autoPlay />
      {isRecording && <Button type="button" onClick={stopRecording}>Stop</Button>}
    </div>
  );
}

export default function RecordPage () {
  return (
    <Layout
      title="stream.new"
      description="Record a video"
    >
      <div className="wrapper">
        <Recorder />
      </div>
      <style jsx>{`
        .children {
          text-align: center;
          min-height: 230px;
        }
      `}
      </style>
    </Layout>
  );
}
