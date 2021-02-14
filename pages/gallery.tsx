import { useState } from 'react';
import VideoPlayer from '../components/video-player';
import Layout from '../components/layout';

const META_TITLE = "View this video created on FamJam.Space";
const Playback: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const onError = (evt: ErrorEvent) => {
    console.error('Error', evt); // eslint-disable-line no-console
  };


  return (
    <Layout
      metaTitle={META_TITLE}
      long
    >
      <div className="wrapper">
        <VideoPlayer playbackId='4pshEip02dQ0002l6brR01VKgA3Q2bI00pSxbixd53RgGeEY' poster="https://image.mux.com/4pshEip02dQ0002l6brR01VKgA3Q2bI00pSxbixd53RgGeEY/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='m3bh78KWz01DGi00Semak0102dty1KKUsxvVMbo5X8500lcE' poster="https://image.mux.com/m3bh78KWz01DGi00Semak0102dty1KKUsxvVMbo5X8500lcE/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='KGBa6iv21jMOv02Y9KFruLAA01nI5pXKC4PYOjJ0100C6AE' poster="https://image.mux.com/KGBa6iv21jMOv02Y9KFruLAA01nI5pXKC4PYOjJ0100C6AE/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='pYOE7v02EW14z5FEc2K9302VRu1TZrvA6OqlN9qdN7yAA' poster="https://image.mux.com/pYOE7v02EW14z5FEc2K9302VRu1TZrvA6OqlN9qdN7yAA/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='RF9y8RrRBUCoRig00Cg1XOXXB1eoLxACqth2r6T02cXvU' poster="https://image.mux.com/RF9y8RrRBUCoRig00Cg1XOXXB1eoLxACqth2r6T02cXvU/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='zQ400FCor01CpVKXjjiT6yUyrHj3Y9kilergSfGtRcVfE' poster="https://image.mux.com/zQ400FCor01CpVKXjjiT6yUyrHj3Y9kilergSfGtRcVfE/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='Jpx301S34i7gi6fO8vcz3mtDmruPiyHRGp1l1sROC7dQ' poster="https://image.mux.com/Jpx301S34i7gi6fO8vcz3mtDmruPiyHRGp1l1sROC7dQ/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
        <VideoPlayer playbackId='t65cOSLwc3500SD6SLZux65lwMcqePOoojpcwDZrzAXI' poster="https://image.mux.com/t65cOSLwc3500SD6SLZux65lwMcqePOoojpcwDZrzAXI/thumbnail.png" onLoaded={() => setIsLoaded(true)} onError={onError}  />
      </div>
      <style jsx>{`
        .wrapper {
          display: flex;
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
