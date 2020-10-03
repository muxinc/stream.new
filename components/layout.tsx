import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { breakpoints, transitionDuration } from '../style-vars';
import Asterisk from './asterisk';
import InfoModal from './info-modal';
import { OPEN_SOURCE_URL, MUX_HOME_PAGE_URL } from '../constants';

type AsteriskProps = {
  spinning?: boolean;
}

const AsteriskLink: React.FC<AsteriskProps> = ({ spinning }) => {
  return (
    <>
      <Link href="/"><a><Asterisk /></a></Link>
      <style jsx>{`
        a {
          animation: ${ spinning ? 'rotation 4s linear infinite' : 'none'};
          width: 46px;
          height: 46px;
          display: block;
        }

        a:hover {
          opacity: 0.5;
        }
      `}</style>
    </>
  );
};

const FOOTER_HEIGHT = '100px';

type Props = {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  onFileDrop?: (acceptedFiles: File[]) => void;
  darkMode?: boolean;
  centered?: boolean;
  spinningLogo?: boolean;
  backNav?: boolean;
};

const Layout: React.FC<Props> = ({
  title,
  description,
  metaTitle,
  metaDescription,
  image = "/stream-new-og-image.png",
  onFileDrop,
  darkMode,
  centered,
  spinningLogo,
  backNav,
  children,
}) => {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const { getRootProps, isDragActive } = useDropzone({ onDrop: onFileDrop });
  const isDroppablePage = !!onFileDrop;
  const containerProps = isDroppablePage ? getRootProps() : {};

  return (
    <>
      <Head>
        <title>stream.new</title>
        <link rel="icon" href="/stream-new-asterisk.svg" />
        {metaTitle && <meta property="og:title" content={metaTitle} />}
        {metaTitle && <meta property="twitter:title" content={metaTitle} />}
        {metaDescription && (
          <meta property="og:description" content={description} />
        )}
        {metaDescription && (
          <meta property="twitter:description" content={description} />
        )}
        {image && <meta property="og:image" content={image} />}
        {image && (
          <meta property="twitter:card" content="summary_large_image" />
        )}
        {image && <meta property="twitter:image" content={image} />}
      </Head>
      <div className="container" {...containerProps}>
        <div className={`drag-overlay ${isDragActive ? 'active' : ''}`}><h1>Upload to stream.new</h1></div>

        <div className="modal-wrapper"><InfoModal close={() => setModalOpen(false)} /></div>
        <main>
          <div className={`${centered ? "content-wrapper-centered" : ""}`}>{children}</div>
        </main>
        <div className="footer-wrapper">
          <footer>
            <div className="nav">
             {
               backNav ?
               <div className="footer-link back"><a onClick={() => router.back()} role="presentation">Back</a></div> :
               <>
                <div className="footer-link info"><a role="presentation" onClick={() => setModalOpen(true)}>Info</a></div>
                <div className="footer-link mux">An <a href={OPEN_SOURCE_URL}>open source</a> project by <a href={MUX_HOME_PAGE_URL}>Mux</a></div>
                <div className="divider" />
                <div className="footer-link terms"><Link href="/terms"><a>Terms</a></Link></div>
               </>

             }
            </div>
            <div className="footer-link"><AsteriskLink spinning={spinningLogo} /></div>
          </footer>
        </div>

        <style jsx>{`
          .modal-wrapper {
            display: ${isModalOpen ? 'flex' : 'none'};
            position: absolute;
            top: 0;
            height: 100%;
            z-index: 2;
            width: 100%;
          }
          .spinning {
            animation: rotation 2s infinite linear;
          }
          .content-wrapper-centered {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
          }
          .container {
            transition: background ${transitionDuration} ease;
            outline: none;
          }
          .drag-overlay {
            height: 100%;
            width: 100%;
            position: absolute;
            z-index: 1;
            background-color:  rgba(226, 253, 255, 0.95);
            transition: 0.5s;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .drag-overlay h1 {
            font-size: 46px;
            line-height: 46px;
            text-align: center;
          }

          .drag-overlay.active {
            display: flex;
          }

          main {
            padding: 20px;
            margin-bottom: -${FOOTER_HEIGHT};
            height: 100%;
          }

          .footer-wrapper {
            position: absolute;
            width: 100%;
            bottom: 0;
          }

          footer {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-left: 30px;
            padding-right: 30px;
            height: ${FOOTER_HEIGHT};
          }

          .nav {
            display: flex;
            align-items: center;
          }
          .nav > .footer-link {
            padding-right: 40px;
          }

          .divider {
            display: none;
          }

          .footer-link {
            font-size: 26px;
            line-height: 33px;
            mix-blend-mode: exclusion;
            color: #f8f8f8;
            opacity: 0.85;
          }


          .footer-link a, .footer-link a:visited {
            mix-blend-mode: exclusion;
            color: #f8f8f8;
            cursor: pointer;
            text-decoration: none;
          }

          .footer-link.mux {
            display: none;
          }

          .footer-link.terms {
            display: none;
          }

          .footer-link.back a {
            border-bottom: none;
          }

          @media only screen and (min-width: ${breakpoints.md}px) {
            .drag-overlay h1 {
              font-size: 96px;
              line-height: 120px;
            }
            .nav > .footer-link {
              padding-right: 0;
            }

            .footer-link a, .footer-link a:visited {
              border-bottom: 2px solid #f8f8f8;
            }

            .divider {
              display: block;
              margin: 0 20px;
              height: 26px;
              width: 2px;
              mix-blend-mode: exclusion;
              background-color: #f8f8f8;
              opacity: 0.4;
            }

            .footer-link.info {
              display: none;
            }
            .footer-link.mux {
              display: block;
            }

            .footer-link.terms {
              display: block;
            }

            .footer-link a:hover {
              opacity: 0.5;
            }

          }

          @keyframes rotation {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(359deg);
            }
          }
        `}
        </style>

        <style jsx global>{`
          html, body, #__next, .container {
            background: ${darkMode ? '#111' : '#f8f8f8'};
            height: 100%;
            -webkit-font-smoothing: antialiased;
          }
          p {
            font-size: 18px;
            line-height: 20px;
          }

          html,
          body,
          a,
          a:visited {
            padding: 0;
            margin: 0;
            font-family: Akkurat;
          }

          a, a:visited {
            cursor: pointer;
            mix-blend-mode: exclusion;
            color: #f8f8f8;
          }

          p {
            mix-blend-mode: exclusion;
            color: #f8f8f8;
          }

          h1 {
            mix-blend-mode: exclusion;
            color: #f8f8f8;
          }

          h1 {
            font-family: Akkurat;
            font-style: normal;
            font-weight: normal;
            font-size: 36px;
            line-height: 45px;
            margin: 0;
            text-align: left;
            max-width: 90vw;
          }

          h2 {
            font-family: Akkurat;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 33px;
          }

          select {
            padding: 5px;
            font-family: Akkurat;
            background: transparent;
            font-size: 20px;
            color: #222;
            width: 400px;
            line-height: 20px;
            border: none;
            background: #E8E8E8;
            border-radius: 5px;
          }

          select:hover {
            opacity: 0.75;
          }

          * {
            box-sizing: border-box;
          }

          ::selection {
            background: darkgray;
            color: white;
          }

          @media only screen and (min-width: ${breakpoints.md}px) {
            h1 {
              font-size: 5vw;
              line-height: 6vw;
              text-align: left;
              max-width: 45vw;
            }
            p {
              font-size: 26px;
              line-height: 38px;
            }
          }

          @keyframes rotation {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(359deg);
            }
          }
        `}
        </style>
      </div>
    </>
  );
};

export default Layout;
