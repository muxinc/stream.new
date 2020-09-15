const AudioBars = ({ audioLevel }) => {
  const audioLevelThresholds = [0, 5, 10, 15, 20, 25];

  return (
    <div className="audio-levels">
      <div className="level-1" />
      <div className="level-2" />
      <div className="level-3" />
      <div className="level-4" />
      <div className="level-5" />
      <div className="level-6" />
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
        .level-1 {
          background-color: ${audioLevel > audioLevelThresholds[0] ? '#222' : '#ccc'}
        }
        .level-2 {
          background-color: ${audioLevel > audioLevelThresholds[1] ? '#222' : '#ccc'}
        }
        .level-3 {
          background-color: ${audioLevel > audioLevelThresholds[2] ? '#222' : '#ccc'}
        }
        .level-4 {
          background-color: ${audioLevel > audioLevelThresholds[3] ? '#222' : '#ccc'}
        }
        .level-5 {
          background-color: ${audioLevel > audioLevelThresholds[4] ? '#222' : '#ccc'}
        }
        .level-6 {
          background-color: ${audioLevel > audioLevelThresholds[5] ? '#222' : '#ccc'}
        }
      `}
      </style>
    </div>
  );
};

export default AudioBars;
