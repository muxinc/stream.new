import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import FullpageSpinner from '../../components/fullpage-spinner';
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

const Playback: React.FC<Props> = ({ playbackId, shareUrl, poster }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout
        metaTitle="View this video created on stream.new"
        image={poster}
        darkMode
      >
        <FullpageSpinner />;
      </Layout>
    );
  }

  const onError = (evt: ErrorEvent) => {
    setErrorMessage('This video does not exist');
    console.error('Error', evt); // eslint-disable-line no-console
  };

  return (
    <Layout
      metaTitle="View this video created on stream.new"
      image={poster}
      darkMode
    >
      {errorMessage && <h1 className="error-message">{errorMessage}</h1>}
      {!isLoaded && !errorMessage && <FullpageSpinner />}
      <div className="wrapper">
        <VideoPlayer playbackId={playbackId} poster={poster} onLoaded={() => setIsLoaded(true)} onError={onError} />
        <div className="share-url">{shareUrl}</div>
      </div>
      <style jsx>{`
        .error-message {
          color: #ccc;
        }
        .wrapper {
          display: ${isLoaded ? 'flex' : 'none'};
          flex-direction: column;
          flex-grow: 1;
          align-items: center;
          justify-content: center;
        }
        .share-url {
          word-break: break-word;
          color: #777;
        }
      `}
      </style>
    </Layout>
  );
};

export default Playback;
