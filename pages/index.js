import { useCallback, useState, useRef } from 'react';
import { breakpoints } from '../style-vars';
import Layout from '../components/layout';
import Button from '../components/button';
import UploadProgressFullpage from '../components/upload-progress-fullpage';

export default function Index () {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    } else {
      console.warn('got a drop event but no file'); // eslint-disable-line no-console
    }
  }, []);

  const onInputChange = () => {
    setFile(inputRef.current.files[0]);
    console.log('debug input changed'); // eslint-disable-line no-console
  };

  if (file) {
    return <UploadProgressFullpage file={file} />;
  }

  return (
    <Layout
      onFileDrop={onDrop}
    >
      <div className="drop-notice">
        <h2>Drag and drop a file anywhere</h2>
      </div>
      <div className="create-video-actions">
        <div className="headline-mobile">
          <h1>Add a video.</h1>
          <h1>Stream it anywhere.</h1>
        </div>
        <div className="headline-desktop">
          <h1>Add a video. Stream it anywhere.</h1>
        </div>
        <div className="cta">
          <label htmlFor="file-input">
            <Button type="button" onClick={() => inputRef.current.click()}>
              <span className="cta-text-mobile">Add a video</span>
              <span className="cta-text-desktop">Upload a video</span>
            </Button>
            <input id="file-input" type="file" onChange={onInputChange} ref={inputRef} />
          </label>
        </div>
      </div>
      <style jsx>{`
        input {
          display: none;
        }
        .headline-mobile {
          display: block;
        }
        .headline-desktop {
          display: none;
        }
        .drop-notice {
          display: none;
        }
        .cta {
          margin-top: 30px;
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
            text-align: center;
          }
          .create-video-actions {
            padding-top: 20vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .headline-mobile {
            display: none;
          }
          .headline-desktop {
            display: block;
          }
          .cta-text-mobile {
            display: none;
          }
          .cta-text-desktop {
            display: inline-block;
          }
          .cta-record {
            display: block;
          }
        }
      `}
      </style>
    </Layout>
  );
}
