import Button from './button';

type ActionButtonProps = {
  hasMediaRecorder: boolean;
  isRecording: boolean;
  isLoadingPreview: boolean;
  isReviewing: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  submitRecording: () => void;
  reset: () => void;
};

const noop = () => void 0;

const ActionButtons: React.FC<ActionButtonProps> = ({
  hasMediaRecorder,
  isRecording,
  isLoadingPreview,
  isReviewing,
  startRecording,
  stopRecording,
  submitRecording,
  reset,
}) => (
  <div className="container">
    {!hasMediaRecorder && <p className="error">Unable to record: your browser does not have MediaRecorder. You may need to enable this in Experimental Features.</p>}
    <Button type="button" onClick={hasMediaRecorder ? startRecording : noop} disabled={!hasMediaRecorder || isRecording || isReviewing}>Start recording</Button>
    <Button type="button" onClick={stopRecording} disabled={!isRecording}>Stop</Button>
    <Button type="button" onClick={submitRecording} disabled={!isReviewing || isLoadingPreview}>{ isLoadingPreview ? 'Loading preview...' : 'Submit' }</Button>
    <Button type="button" onClick={reset} disabled={!isReviewing}>Reset</Button>
    <style jsx>{`
      .error {
        color: red;
        max-width: 400px;
      }
      .container {
        display: flex;
        flex-direction: column;
      }
    `}
    </style>
  </div>
);

export default ActionButtons;
