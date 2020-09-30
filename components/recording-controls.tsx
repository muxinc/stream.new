import Button from './button';

type Props = {
  isRecording: boolean;
  isLoadingPreview: boolean;
  isReviewing: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  submitRecording: () => void;
  reset: () => void;
};

const RecordingControls: React.FC<Props> = ({
  isRecording,
  isLoadingPreview,
  isReviewing,
  startRecording,
  stopRecording,
  submitRecording,
  reset,
}) => (
  <div className="container">
    <div className="button"><Button type="button" onClick={startRecording} disabled={isRecording || isReviewing}>Start recording</Button></div>
    <div className="button"><Button type="button" onClick={stopRecording} disabled={!isRecording}>Stop recording</Button></div>
    <div className="button"><Button type="button" onClick={submitRecording} disabled={!isReviewing || isLoadingPreview}>{ isLoadingPreview ? 'Loading preview...' : 'Submit' }</Button></div>
    <div className="button"><Button type="button" onClick={reset}>Reset</Button></div>
    <style jsx>{`
      .container {
        display: flex;
        flex-direction: column;
        position: absolute;
        right: 0;
        bottom: 0;
        align-items: flex-end;
        justify-content: flex-end;
        margin-bottom: 150px;
        margin-right: 25px;
      }
      .container .button {
        margin: 8px 0;
      }
    `}
    </style>
  </div>
);

export default RecordingControls;
