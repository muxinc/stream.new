type Props = {
  audioLevel: number,
  isMuted: boolean,
  muteAudioTrack: (mute: boolean) => void
};

const AudioBars: React.FC<Props> = ({ audioLevel, isMuted, muteAudioTrack }) => {
  const audioLevelThresholds = [0, 5, 10, 15, 20, 25];

  return (
    <>
      <div className="audio-levels">
        <div className='mute-action'><button onClick={() => muteAudioTrack(isMuted ? false : true)}>{isMuted ? 'unmute' : 'mute'}</button></div>
        <div className={`level ${audioLevel > audioLevelThresholds[0] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[1] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[2] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[3] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[4] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[5] ? 'active' : ''}`} />
        <style jsx>{`
          .mute-action {
            margin-right: 10px;
          }
          .audio-levels {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .audio-levels > .level {
            width: 30px;
            height: 10px;
            margin-right: 10px;
          }
          .audio-levels > .level:last-child {
            margin-right: 0;
          }
          .level {
            background-color: #ccc;
          }
          .level.active {
            background-color: #222;
          }
        `}
        </style>
      </div>
    </>
  );
};

export default AudioBars;
