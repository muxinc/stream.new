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
    <Button type="button" onClick={startRecording} disabled={isRecording || isReviewing}>Start recording</Button>
    <Button type="button" onClick={stopRecording} disabled={!isRecording}>Stop</Button>
    <Button type="button" onClick={submitRecording} disabled={!isReviewing || isLoadingPreview}>{ isLoadingPreview ? 'Loading preview...' : 'Submit' }</Button>
    <Button type="button" onClick={reset}>Reset</Button>
    <style jsx>{`
      .container {
        display: flex;
        flex-direction: column;
      }
    `}
    </style>
  </div>
);

export default RecordingControls;
