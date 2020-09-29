import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { breakpoints, transitionDuration } from '../style-vars';
import Asterisk from './asterisk';
import InfoModal from './info-modal';

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
  children,
}) => {
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
        <footer>
          <div className="nav">
            <div className="footer-link"><a role="presentation" onClick={() => setModalOpen(true)}>Info</a></div>
            <div className="footer-link mux">Built by Mux</div>
          </div>
          <div className="footer-link"><AsteriskLink spinning={spinningLogo} /></div>
        </footer>

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
            height: 100vh;
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

          .footer-link {
            font-size: 20px;
            line-height: 33px;
          }


          .footer-link a, .footer-link a:visited {
            mix-blend-mode: exclusion;
            color: #f8f8f8;
            text-decoration: none;
            cursor: pointer;
          }

          .footer-link.mux {
            color: #777;
          }

          @media only screen and (min-width: ${breakpoints.md}px) {
            .drag-overlay h1 {
              font-size: 96px;
              line-height: 120px;
            }
            .footer-link {
              font-size: 26px;
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
            height: 100%;
            background: ${darkMode ? '#111' : '#f8f8f8'};
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
          }

          h2 {
            font-family: Akkurat;
            font-style: normal;
            font-weight: normal;
            font-size: 26px;
            line-height: 33px;
          }

          select {
            padding: 11px;
            background: transparent;
            font-size: 26px;
            color: #b0b0b0;
            width: 400px;
            line-height: 26px;
          }

          * {
            box-sizing: border-box;
          }

          @media only screen and (min-width: ${breakpoints.md}px) {
            h1 {
              font-size: 64px;
              line-height: 80px;
              text-align: left;
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
