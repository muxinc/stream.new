import { useState, useRef, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import FullpageLoader from '../../components/fullpage-loader';
import VideoPlayer from '../../components/video-player';
import Layout from '../../components/layout';
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

const META_TITLE = "View this video created on FamJam.Space";
const Playback: React.FC<Props> = ({ playbackId, shareUrl, poster }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openReport, setOpenReport] = useState(false);
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
        metaTitle="View this video created on FamJam.Space"
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

  return (
    <Layout
      metaTitle={META_TITLE}
      image={poster}
      centered={showLoading}
    >
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {showLoading && <FullpageLoader text="Success 🙌" />}
      <div className="wrapper">
        {!openReport && <VideoPlayer playbackId={playbackId} poster={poster} onLoaded={() => setIsLoaded(true)} onError={onError} />}
        <div className="actions">
          {/* {!openReport && <a onClick={copyUrl} onKeyPress={copyUrl} role="button" tabIndex={0}>{ isCopied ? 'Copied to clipboard' :'Copy video URL' }</a>} */}
          {/* {!openReport && (
            <a
              onClick={() => setOpenReport(!openReport)}
              onKeyPress={() => setOpenReport(!openReport)}
              role="button"
              tabIndex={0}
              className="report">{ openReport ? 'Back' : 'Report abuse' }
            </a>
          )} */}
        </div>
      </div>
      <style jsx>{`
        .actions a:first-child {
          padding-right: 30px;
        }
        .error-message {
          color: #ccc;
        }
        .report-form {
          margin-top: 20px;
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
