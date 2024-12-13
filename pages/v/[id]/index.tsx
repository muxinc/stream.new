import { GetStaticProps, GetStaticPaths } from 'next';

import { MUX_PLAYER_TYPE } from '../../../constants';
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

const Playback: React.FC<Props> = ({ playbackId, videoExists, shareUrl, poster, blurDataURL, aspectRatio }) => {
  return (
    <PlayerPage
      playbackId={playbackId}
      videoExists={videoExists}
      shareUrl={shareUrl}
      poster={poster}
      aspectRatio={aspectRatio}
      blurDataURL={blurDataURL}
      playerType={MUX_PLAYER_TYPE}
    />
  );
};

export default Playback;
