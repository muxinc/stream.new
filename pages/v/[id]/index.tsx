import { GetStaticProps, GetStaticPaths } from 'next';
import Cookies from 'js-cookie';

import PlayerPage from '../../../components/player-page';
import { getPropsFromPlaybackId, Props } from '../../../lib/player-page-utils';

type Params = {
  id: string;
};

const FALLBACK_PLAYER ='plyr';

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  const { id: playbackId } = params as Params;
  const props = await getPropsFromPlaybackId(playbackId);

  return {
    props: {
      ...props,
      playerType: Cookies.get('streamPlayerType') || FALLBACK_PLAYER
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

const Playback: React.FC<Props> = ({ playbackId, videoExists, shareUrl, poster, aspectRatio, playerType = FALLBACK_PLAYER }) => {
  return (
    <PlayerPage
      playbackId={playbackId}
      videoExists={videoExists}
      shareUrl={shareUrl}
      poster={poster}
      aspectRatio={aspectRatio}
      playerType={playerType}
    />
  );
};

export default Playback;
