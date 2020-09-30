/* eslint-disable jsx-a11y/no-onchange */
import { ChangeEvent } from 'react';
import AudioBars from './audio-bars';

type DeviceItems = MediaDeviceInfo[];

type DeviceList = {
  video: DeviceItems;
  audio: DeviceItems;
};

type Props = {
  isLoadingPreview: boolean,
  isRecording: boolean,
  deviceList: DeviceList,
  audioLevel: number,
  selectVideo: (evt: ChangeEvent<HTMLSelectElement>) => void,
  selectAudio: (evt: ChangeEvent<HTMLSelectElement>) => void,
  isMuted: boolean,
  muteAudioTrack: (muted: boolean) => void,
};

const CameraOptions: React.FC<Props> = ({
  isLoadingPreview,
  isRecording,
  deviceList,
  audioLevel,
  selectVideo,
  selectAudio,
  isMuted,
  muteAudioTrack,
}) => {
  return (
    <>
      <div>
        { isLoadingPreview && 'Loading preview...' }
      </div>
      <div className="device-pickers">
        {
          <select onChange={selectVideo} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
            {
              deviceList.video.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
            }
          </select>
        }
        {
          <>
            <div className="audio-bars"><AudioBars muteAudioTrack={muteAudioTrack} isMuted={isMuted} audioLevel={audioLevel} /></div>
            <select onChange={selectAudio} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
              {
                deviceList.audio.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
              }
            </select>
          </>
        }
      </div>
      <style jsx>{`
        .device-pickers {
          margin-top: 20px;
        }
        .audio-bars {
          margin: 20px 0;
        }
      `}</style>
    </>
  );
};

export default CameraOptions;
