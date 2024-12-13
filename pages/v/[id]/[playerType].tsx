import { GetStaticProps, GetStaticPaths } from 'next';

import PlayerPage from '../../../components/player-page';
import { getPropsFromPlaybackId, Props } from '../../../lib/player-page-utils';

type Params = {
  id: string;
  playerType: string;
};

type PlayerTypePageProps = Props & { playerType: string };

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const { id: playbackId, playerType } = params as Params;
  const props = await getPropsFromPlaybackId(playbackId);

  return { props: { ...props, playerType } };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

const PlayerTypePage: React.FC<PlayerTypePageProps> = ({ playbackId, playerType, videoExists, shareUrl, poster, blurDataURL, aspectRatio }) => {
  return (
    <PlayerPage
      playbackId={playbackId}
      videoExists={videoExists}
      shareUrl={shareUrl}
      poster={poster}
      aspectRatio={aspectRatio}
      blurDataURL={blurDataURL}
      playerType={playerType}
    />
  );
};

export default PlayerTypePage;
