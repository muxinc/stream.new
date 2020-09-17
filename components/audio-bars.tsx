type Props = { audioLevel: number };

const AudioBars: React.FC<Props> = ({ audioLevel }) => {
  const audioLevelThresholds = [0, 5, 10, 15, 20, 25];

  return (
    <div className="audio-levels">
      <div className={`level ${audioLevel > audioLevelThresholds[0] ? 'active' : ''}`} />
      <div className={`level ${audioLevel > audioLevelThresholds[1] ? 'active' : ''}`} />
      <div className={`level ${audioLevel > audioLevelThresholds[2] ? 'active' : ''}`} />
      <div className={`level ${audioLevel > audioLevelThresholds[3] ? 'active' : ''}`} />
      <div className={`level ${audioLevel > audioLevelThresholds[4] ? 'active' : ''}`} />
      <div className={`level ${audioLevel > audioLevelThresholds[5] ? 'active' : ''}`} />
      <style jsx>{`
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
        .level {
          background-color: #ccc;
        }
        .level.active {
          background-color: #222;
        }
      `}
      </style>
    </div>
  );
};

export default AudioBars;
