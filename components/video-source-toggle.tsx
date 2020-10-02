type Props = {
  activeSource: 'camera' | 'screen' | '',
  onChange: (source: 'camera' | 'screen') => void
};

const VideoSourceToggle: React.FC<Props> = ({ activeSource, onChange }) => {
  return (
    <div className="tabs">
      <button className={`tab ${activeSource === 'camera' ? 'active' : ''}`} onClick={() => onChange('camera')}>Camera</button>
      <button className={`tab ${activeSource === 'screen' ? 'active' : ''}`} onClick={() => onChange('screen')} >Screenshare</button>
      <style jsx>{`
        .tabs {
          margin: 30px 5px 20px;
          display: flex;
        }
        .tab {
          cursor: pointer;
          border: 0;
          background: none;
          font-size: 20px;
          font-family: Akkurat;
          font-weight: normal;
          padding: 5px 5px 8px;
          text-align: center;
          color: #666;
          width: 190px;
          background: #e8e8e8;
          transition: all 0.1s ease;
          border-radius: 20px;
          margin-right: 20px;
        }

        .tab:nth-child(2) {
          margin-right: 0px;
        }

        .tab.active, hover {
          color: #f8f8f8;
          background: #222;
        }
        .tab:hover {
          color: #f8f8f8;
          background: #222;
        }
      `}
      </style>
    </div>
  );
};

export default VideoSourceToggle;
