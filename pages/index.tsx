import { useCallback, useState, useRef } from 'react';
import Link from 'next/link';
import { breakpoints } from '../style-vars';
import Layout from '../components/layout';
import Button from '../components/button';
import UploadProgressFullpage from '../components/upload-progress-fullpage';
// import Mux from '@mux/mux-node';
// const { Video } = new Mux('', '')

type Props = null;

const Index: React.FC<Props> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [showUploadPage, setShowUploadPage] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [assetID, setAssetId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const myEndpoint = useRef<HTMLInputElement>(null);

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

  // const myFunc1 = async () => {
  //   const asset = await Video.Assets.create({
  //     input: myEndpoint,
  //     "playback_policy": [
  //       "public"
  //     ],
  //   });
  // }

  const myFunc2 = async () => {
    if (myEndpoint) {

      try {
        return fetch('/api/assets', {
          method: 'POST',
          body: myEndpoint.current.value
        })
          .then((res) => res.json())
          // this needs to change because
          // a direct upload isn't happening,
          // if something different should happen
          .then(({ id, status }) => {
            setAssetId(id);
            return status;
          });
      } catch (e) {
        console.error('Error in createUpload', e); // eslint-disable-line no-console
        setErrorMessage('Error creating upload');
        return Promise.reject(e);
      }

    }
    try {
      return fetch('/api/assets', {
        method: 'POST',
      })
        .then((res) => res.json())
        .then(({ id, status }) => {
          setAssetId(id);
          console.log(id)
          console.log(status)
          return status;
        });
    } catch (e) {
      console.error('Error in createUpload', e); // eslint-disable-line no-console
      setErrorMessage('Error creating upload');
      return Promise.reject(e);
    }

  }

  return (
    <Layout
      onFileDrop={onDrop}
    >
      <div>
        <div>
          <h1>Add a video.</h1>
          <h1>Get a shareable link to stream it.</h1>
          <input className='aminBox' ref={myEndpoint} id="location" type="text" placeholder="Mux Upload URL" /> 
          <input onClick={myFunc2} className='aminBox' id="startupload" type="button" value="start upload" /> 
        </div>
        <div className="cta">
          <div className="drop-notice">
            <h2>↓ Drag & drop a video file anywhere</h2>
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
        input:not(.aminBox) {
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
