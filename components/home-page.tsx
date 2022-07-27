import React from 'react';
import Link from 'next/link';
import Button from '../components/button';
import { breakpoints } from '../style-vars';

type Props = {
  isUploading?: boolean;
};

const HomePage: React.FC<Props> = ({ isUploading, children }) => {
  {/* TO-DO: Re-render between two states interferes with upload-in-progress attribute applying to MuxUploader). 
      Could we memoize the children? Prevent re-rendering? Edit: Pitfills of memo + children: https://gist.github.com/slikts/e224b924612d53c1b61f359cfb962c06 (TD).*/}
  if (isUploading) {
    return <>{children}</>;
  }

  return (
    <>
      <div>
        <div>
          <h1>Add a video.</h1>
          <h1>Get a shareable link to stream it.</h1>
        </div>
        <div className="cta">
          <div className="drop-notice">
            <h2>↓ Drag & drop a video file anywhere</h2>
          </div>
        {children} {/* Ideally, we want children to be unaffected by the changes around it. Whether we're uploading or not. */}
        <div className="cta-record">
            <Link href="/record?source=camera"><Button>Record from camera</Button></Link>
          </div>
          <div className="cta-record">
            <Link href="/record?source=screen"><Button>Record my screen</Button></Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        input {
          display: none;
        }
        .drop-notice {
          display: none;
        }

        .cta {
          display: flex;
          flex-direction: column;
          position: absolute;
          right: 0;
          bottom: 0;
          align-items: flex-end;
          justify-content: flex-end;
          margin-bottom: 100px;
          margin-right: 30px;
        }
        .cta .button {
          margin: 8px 0;
        }

        .cta {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
        }
        .cta-text-mobile {
          display: inline-block;
        }
        .cta-text-desktop {
          display: none;
        }
        .cta-record {
          display: none;
        }
        
        @media only screen and (min-width: ${breakpoints.md}px) {
          .drop-notice {
            display: block;
            text-align: right;
            float: right;
            color: #fff;
            margin-bottom: 5px;
            opacity: 0.5;
            mix-blend-mode: exclusion;
          }
          .drop-notice h2 {
            margin-top: 0;
          }

          .cta-text-mobile {
            display: none;
          }
          .cta-text-desktop {
            display: inline-block;
          }
          .cta-record {
            display: block;
            margin-top: 30px;
          }
        }
      `}
      </style>
    </>
  );
};

export default HomePage;
