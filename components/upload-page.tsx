import { ReactNode } from 'react';
import Layout from './layout';
import { MUX_HOME_PAGE_URL } from '../constants';

type Props = {
  children: ReactNode
};

const UploadPage: React.FC<Props> = ({ children }) => {
  return (
    <Layout
      title="stream.new"
      description="Upload a video and share a URL"
    >
      <div className="wrapper">
        <div className="about-mux">
          <p>
            <a
              href={MUX_HOME_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mux
            </a>{' '}
            provides APIs for developers working with video.
          </p>
          <p>
            Uploading a video uses the Mux{' '}
            <a href="https://docs.mux.com/docs/direct-upload?utm_source=stream-new">
              direct upload API
            </a>
            . When the upload is complete your video will be processed by Mux
            and available for playback on a sharable URL.
          </p>
          <p>
            To learn more,{' '}
            <a
              href="https://github.com/muxinc/examples/tree/master/stream.new"
              target="_blank"
              rel="noopener noreferrer"
            >
              check out the source code on GitHub
            </a>
            .
          </p>
        </div>
        <div className="children">{children}</div>
      </div>
      <style jsx>{`
        .about-mux {
          padding: 0 1rem 1.5rem 1rem;
          max-width: 600px;
        }
        .about-mux {
          line-height: 1.4rem;
        }
        .children {
          text-align: center;
          min-height: 230px;
        }
      `}
      </style>
    </Layout>
  );
};

export default UploadPage;
