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

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setShowUploadPage(true);
    } else {
      console.warn('got a drop event but no file'); // eslint-disable-line no-console
    }
  }, []);

  const onInputChange = () => {
    if (inputRef.current && inputRef.current.files && inputRef.current.files[0]) {
      setFile(inputRef.current.files[0]);
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
        <div className="hero-title">
          <h1>Send a video birthday message to Jessica <span role="img" aria-label="balloon">🎈</span></h1>
        </div>
        <div className="cta">
          <div className="cta-record">
            <Link href="/record?source=camera"><Button>Record from camera</Button></Link>
          </div>
          <label htmlFor="file-input">
            <Button type="button" onClick={() => inputRef.current && inputRef.current.click()}>
              <span className="cta-text-desktop">Upload a video</span>
            </Button>
            <input id="file-input" type="file" onChange={onInputChange} ref={inputRef} />
          </label>
          {/* <div className="cta-record">
            <Link href="/record?source=screen"><Button>Record my screen</Button></Link>
          </div> */}
        </div>
      </div>
      <style jsx>{`
        input {
          display: none;
        }
        .drop-notice {
          display: none;
        }

        .hero-title h1{
          color: #FFFFE0;
        }

        .cta {
          display: flex;
          flex-direction: column;
          margin-top: 50px;
        }

        .cta-record {
          margin: 30px 0;
        }

      `}
      </style>
    </Layout>
  );
};

export default Index;
