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
          margin: 20px 0;
          display: flex;
        }
        .tab {
          cursor: pointer;
          border: 0;
          background: none;
          font-size: 18px;
          padding: 0 10px;
          text-align: center;
          color: #ccc;
          border-bottom: 2px solid #ccc;
          width: 120px;
        }
        .tab.active {
          color: #222;
          border-bottom: 2px solid #222;
        }
      `}
      </style>
    </div>
  )
}

export default VideoSourceToggle;
