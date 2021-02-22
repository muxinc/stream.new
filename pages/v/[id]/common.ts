import { GetStaticProps, GetStaticPaths } from 'next';

import { HOST_URL } from '../../../constants';

type Params = {
  id: string;
}

export type Props = {
  playbackId: string,
  shareUrl: string,
  poster: string
};

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
