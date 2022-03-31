import { useCallback, useState, useRef } from 'react';
import Link from 'next/link';
import { breakpoints } from '../style-vars';
import Layout from '../components/layout';
import Button from '../components/button';
import UploadProgressFullpage from '../components/upload-progress-fullpage';

type Props = null;

const Index: React.FC<Props> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [showUploadPage, setShowUploadPage] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  console.log('file at beginning of index', file); // This will become our File object
  console.log('inputRef at beginning of index', inputRef); // this will become our HTML Input element from the video


  const onDrop = useCallback((acceptedFiles) => {
    // onDrop is an callback function that happens when
    console.log('onDrop file:', file); // null 
    console.log('onDrop acceptedFiles:', acceptedFiles); // arg is the accepted files object we get from the onFileDrop method in Layout
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      
      setShowUploadPage(true); // revert this comment

      // console.log('accepteFiles, =', acceptedFiles);
      console.log('onDrop file changed to:', file);

    } else {
      console.warn('got a drop event but no file'); // eslint-disable-line no-console
    }
  }, []);

  // Q: Do we need a separate event to happen when a Paste event happens? Or just use onDrop to handle both the original drop event AND now a Paste event too.
  // const onPaste = useCallback((acceptedURLs) => { ... }

  // Q: we need to find a way to put a File object created from a URL pasted on the page and simply put it into this method.

  const onInputChange = () => { // just takes whatever is in inputRef currently and updates the file with setFile. So we don't have to edit this function.
    if (inputRef.current && inputRef.current.files && inputRef.current.files[0]) {
      setShowUploadPage(true);
    }
  };

  if (file && showUploadPage) {
    return <UploadProgressFullpage file={file} resetPage={() => setShowUploadPage(false)}/>;
  }

  return (
    <Layout
      onFileDrop={onDrop}
    >
      <div>
        <div>
          <h1>Add a video.</h1>
          <h1>Get a shareable link to stream it.</h1>
        </div>
        <div className="cta">
          <div className="drop-notice">
            <h2>↓ Drag & drop a video file anywhere - or - paste URL</h2>
          </div>
          <label htmlFor="file-input">
            <Button type="button" onClick={() => inputRef.current && inputRef.current.click()}>
              <span className="cta-text-mobile">Add a video</span>
              <span className="cta-text-desktop">Upload a video</span>
            </Button>
            <input id="file-input" type="file" onChange={onInputChange} ref={inputRef} />
          </label>
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
