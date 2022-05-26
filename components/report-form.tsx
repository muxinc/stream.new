import { useState } from 'react';
import Button from './button';

const REPORT_REASONS = [
  '',
  'Promotes violence',
  'Pornography or graphic',
  'Copyright infringement',
  'Other',
];

type Props = {
  playbackId: string;
  close: () => void;
};


const ReportForm: React.FC<Props> = ({ playbackId, close }) => {
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [hasSavedReport, setHasSavedReport] = useState(false);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);

  const saveReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReport(true);
    try {
      return fetch('/api/report', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          reason: reportReason,
          comment,
          playbackId: playbackId
        }),
      }).then(() => {
          setIsSavingReport(false);
          setHasSavedReport(true);
        });
    } catch (e) {
      setErrorMessage('Error saving this report, please try again');
    }
  };


  if (hasSavedReport) {
    return (
      <>
        <p className="thank-you">Thank you for reporting this content</p>
        <style jsx>{`
          .thank-you {
            color: #8aea8a;
          }
        `}</style>
      </>
    );
  }

  if (errorMessage) {
    return <div className="error-message">Error: ${errorMessage}</div>;
  }

  return (
    <div className="wrapper">
      <form onSubmit={saveReport} className="report-form">
        <p>Tell us why you are reporting this video</p>
        <select required value={reportReason} onChange={(evt) => setReportReason(evt.target.value)} onBlur={(evt) => setReportReason(evt.target.value) }>
         {REPORT_REASONS.map((reason) => {
            return <option key={reason} value={reason}>{reason}</option>;
          })}
        </select>
        <textarea rows={4} value={comment} onChange={(evt) => setComment(evt.target.value)} />
        <div className="actions">
          <a
            onClick={close}
            onKeyPress={close}
            role="button"
            tabIndex={0}
          >cancel</a>
          { isSavingReport ? <p>Saving...</p> : <Button type="submit">Submit</Button> }
        </div>
      </form>
      <style jsx>{`
        .wrapper {
          max-width: 100%;
          padding: 40px;
        }
        form {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center
        }
        select, textarea {
          margin-bottom: 20px;
          width: 100%;
        }
        form textarea, form select, form :global(button) {
          font-size: 16px;
        }
        a {
          margin-right: 20px;
        }
      `}</style>
    </div>
  );
};

export default ReportForm;
