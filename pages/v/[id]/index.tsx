import { GetStaticProps, GetStaticPaths } from 'next';
import Cookies from 'js-cookie';

import { PLYR_TYPE } from '../../../constants';
import type { PlayerTypes } from '../../../constants';
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

const Playback: React.FC<Props> = ({ playbackId, videoExists, shareUrl, poster, aspectRatio }) => {
  const playerType: PlayerTypes = (Cookies.get('streamPlayerType') as PlayerTypes) || PLYR_TYPE;

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
