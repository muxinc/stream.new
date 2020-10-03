import { useState, useRef, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import FullpageLoader from '../../components/fullpage-loader';
import VideoPlayer from '../../components/video-player';
import Layout from '../../components/layout';
import Button from '../../components/button';
import { HOST_URL } from '../../constants';

type Params = {
  id: string;
}

export const getStaticProps: GetStaticProps = async (context)  => {
  const { params } = context;
  const { id: playbackId } = (params as Params);
  const poster = `https://image.mux.com/${playbackId}/thumbnail.png`;
  const shareUrl = `${HOST_URL}/v/${playbackId}`;

  return { props: { playbackId, shareUrl, poster } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

type Props = {
  playbackId: string,
  shareUrl: string,
  poster: string
};

const META_TITLE = "View this video created on stream.new";
const REPORT_REASONS = [
  'Promotes violence',
  'Pornographic or violent',
  'Copyright infringement',
  'Other',
];

const Playback: React.FC<Props> = ({ playbackId, shareUrl, poster }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [hasSavedReport, setHasSavedReport] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const copyTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  if (router.isFallback) {
    return (
      <Layout
        metaTitle="View this video created on stream.new"
        image={poster}
        centered
        darkMode
      >
        <FullpageLoader text="Loading player..." />;
      </Layout>
    );
  }

  const onError = (evt: ErrorEvent) => {
    setErrorMessage('This video does not exist');
    setIsLoaded(false);
    console.error('Error', evt); // eslint-disable-line no-console
  };

  const showLoading = (!isLoaded && !errorMessage);

  const copyUrl = () => {
    copy(shareUrl, { message:  'Copy'});
    setIsCopied(true);
    /*
     * We need a ref to the setTimeout because if the user
     * navigates away before the timeout expires we will
     * clear it out
     */
    copyTimeoutRef.current = window.setTimeout(()=> {
      setIsCopied(false);
      copyTimeoutRef.current = null;
    }, 5000);
  };

  const saveReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReport(true);
    try {
      return fetch('/api/report', {
        method: 'POST',
        body: JSON.stringify({
          reason: reportReason,
          playbackId: playbackId 
        }),
      }).then(() => {
          setOpenReport(false);
          setIsSavingReport(false);
          setHasSavedReport(true);
        });
    } catch (e) {
      setErrorMessage('Error saving this report, please try again');
    }
  };

  return (
    <Layout
      metaTitle={META_TITLE}
      image={poster}
      centered={showLoading}
      darkMode
    >
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {showLoading && <FullpageLoader text="Loading player" />}
      <div className="wrapper">
        <VideoPlayer playbackId={playbackId} poster={poster} onLoaded={() => setIsLoaded(true)} onError={onError} />
        <div className="actions">
          <a onClick={copyUrl} onKeyPress={copyUrl} role="button" tabIndex={0}>{ isCopied ? 'Copied to clipboard' :'Copy video URL' }</a>
          <a onClick={() => setOpenReport(!openReport)} onKeyPress={() => setOpenReport(!openReport)} role="button" tabIndex={0} className="report">Report abuse</a>
          {
            hasSavedReport && <div className="report thank-you">Thank you for reporting this content</div>
          }
        </div>
        { openReport &&
            <form onSubmit={saveReport} className="report-form">
              <select value={reportReason} onChange={(evt) => setReportReason(evt.target.value)} onBlur={(evt) => setReportReason(evt.target.value) }>
               {REPORT_REASONS.map((reason) => {
                  return <option key={reason} value={reason}>{reason}</option>;
                })}
              </select>
            { isSavingReport ? 'Saving...' : <Button type="submit">Submit</Button> }
            </form>
        }
      </div>
      <style jsx>{`
        .actions a:first-child {
          padding-right: 30px;
        }
        .error-message {
          color: #ccc;
        }
        .report {
          margin-top: 20px;
        }
        .report-form {
          margin-top: 8px;
        }
        .report-form select {
          margin-right: 10px;
        }
        .report-form select, .report-form :global(button) {
          font-size: 16px;
          padding: 4px;
        }
        .thank-you {
          color: #8aea8a;
        }
        .wrapper {
          display: ${isLoaded ? 'flex' : 'none'};
          flex-direction: column;
          flex-grow: 1;
          align-items: center;
          justify-content: center;
        }
      `}
      </style>
    </Layout>
  );
};

export default Playback;
