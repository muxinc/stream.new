import { useCallback, useState, useRef } from 'react';
import Link from 'next/link';
import MuxUploader from '@mux/mux-uploader-react';
import { breakpoints } from '../style-vars';
import Layout from '../components/layout';
import Button from '../components/button';
// import UploadProgressFullpage from '../components/upload-progress-fullpage';

type Props = null;

const Index: React.FC<Props> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  // const [showUploadPage, setShowUploadPage] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = useCallback((acceptedFiles) => { 
    if (acceptedFiles && acceptedFiles[0]) {  // MuxUploader handles the file instead
      setFile(acceptedFiles[0]); // Same as above
      // NEW: Create upload URL and pass to MuxUploader below
    } else {
      console.warn('got a drop event but no file'); // eslint-disable-line no-console
    }
  }, []);

  const onInputChange = () => {
    if (inputRef.current && inputRef.current.files && inputRef.current.files[0]) { // MuxUploader handles the file instead
      setFile(inputRef.current.files[0]);// Same as above
      // NEW: Create upload URL
      setUrl(url); // which is passed as a prop in MuxUploader below
    }
  };

  const updateUploadAnalytics = () => {
    // This kind of stuff:
    /*
      uploadAnalytics.chunks[detail.chunkNumber] = {
        size: detail.chunkSize,
        uploadStarted: Date.now(),
      };
    */
  };

  const updateTelemetry = () => {
    // This kind of stuff:
    /*
      fetch('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'upload',
          data: uploadAnalytics,
        })
      });
    */
  };

  // if (file && showUploadPage) {
  //   return <UploadProgressFullpage file={file} resetPage={() => setShowUploadPage(false)}/>;
  // }

  return (
    <Layout // Inside this is MuxUploaderDrop
      onFileDrop={onDrop}
    >
      <div>
        <div>
          <h1>Add a video.</h1>
          <h1>Get a shareable link to stream it.</h1>
        </div>
        <div className="cta">
          <div className="drop-notice">
            <h2>↓ Drag & drop a video file anywhere</h2>
          </div>
          <MuxUploader 
            url={url}
            type="bar"
            // onFileReady={onFileReady} // Could replace both onDrop and onInputChange below
            // onDrop={onDrop} // Doesn't currently exist
            // onInputChange={onInputChange} // Doesn't currently exist
            // onAttempt={updateUploadAnalytics} // Doesn't currently exist
            // onChunkSuccess={updateUploadAnalytics} // Doesn't currently exist
            onSuccess={updateTelemetry} // Doesn't currently exist
          />
          {/* <label htmlFor="file-input">
            <Button type="button" onClick={() => inputRef.current && inputRef.current.click()}>
              <span className="cta-text-mobile">Add a video</span>
              <span className="cta-text-desktop">Upload a video</span>
            </Button>
            <input id="file-input" type="file" onChange={onInputChange} ref={inputRef} />
          </label> */}
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
    </Layout>
  );
};

export default Index;
