/* eslint-disable jsx-a11y/no-onchange */
import { ChangeEvent } from 'react';
import AudioBars from './audio-bars';
import Button from './button';

type DeviceItems = MediaDeviceInfo[];

type DeviceList = {
  video: DeviceItems;
  audio: DeviceItems;
};

type Props = {
  isLoadingPreview: boolean,
  isMicDeviceEnabled: boolean,
  isRecording: boolean,
  deviceList: DeviceList,
  audioLevel: number,
  selectVideo: (evt: ChangeEvent<HTMLSelectElement>) => void,
  selectAudio: (evt: ChangeEvent<HTMLSelectElement>) => void,
  enableMicForScreenshare: () => void
};

const ScreenOptions: React.FC<Props> = ({
  isLoadingPreview,
  isRecording,
  isMicDeviceEnabled,
  deviceList,
  audioLevel,
  selectAudio,
  enableMicForScreenshare,
}) => {
  return (
    <>
      <div>
        { isLoadingPreview && 'Loading preview...' }
      </div>
      {
        isMicDeviceEnabled ?
        <div className="device-pickers">
          <div className="audio-bars"><AudioBars audioLevel={audioLevel} /></div>
          <select onChange={selectAudio} disabled={isRecording} title={isRecording ? 'Cannot change audio devices while recording' : ''}>
            {
              deviceList.audio.map(({ label, deviceId }) => <option key={deviceId} value={deviceId}>{label}</option>)
            }
          </select>
        </div> :
        <Button onClick={enableMicForScreenshare}>Enable microphone</Button>
      }
      <style jsx>{`
        .audio-bars {
          margin: 20px 0;
        }
      `}</style>
    </>
  )
}

export default ScreenOptions;
