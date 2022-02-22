import { GetStaticProps, GetStaticPaths } from 'next';

import PlayerPage from '../../../components/player-page';
import { getPropsFromPlaybackId, Props } from '../../../lib/player-page-utils';

type Params = {
  id: string;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const { id: playbackId } = params as Params;
  const props = await getPropsFromPlaybackId(playbackId);

  return { props };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

const PlyrPage: React.FC<Props> = ({ playbackId, videoExists, shareUrl, poster, aspectRatio }) => {
  return (
    <PlayerPage
      playbackId={playbackId}
      videoExists={videoExists}
      shareUrl={shareUrl}
      poster={poster}
      aspectRatio={aspectRatio}
      playerType="plyr"
    />
  );
};

export default PlyrPage;
