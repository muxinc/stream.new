type Props = {
  audioLevel: number,
  isMuted: boolean,
  muteAudioTrack: (mute: boolean) => void
};

const AudioBars: React.FC<Props> = ({ audioLevel, isMuted, muteAudioTrack }) => {
  const audioLevelThresholds = [0, 5, 10, 15, 20, 25];

  const toggleMuted = () => muteAudioTrack(!isMuted);

  return (
    <>
      <div className="audio-levels">
        <div className='mute-action'><a role="button" tabIndex={0} onKeyDown={toggleMuted} onClick={toggleMuted}>{isMuted ? 'Unmute audio' : 'Mute audio'}</a></div>
        <div className={`level ${audioLevel > audioLevelThresholds[0] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[1] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[2] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[3] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[4] ? 'active' : ''}`} />
        <div className={`level ${audioLevel > audioLevelThresholds[5] ? 'active' : ''}`} />
        <style jsx>{`
          .mute-action {
            margin-right: 10px;
            margin-top: -3px;
            font-size: 20px;
          }

          .audio-levels {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .audio-levels > .level {
            width: 30px;
            height: 5px;
            margin-right: 2px;
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
