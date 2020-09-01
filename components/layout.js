import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { breakpoints, transitionDuration } from '../style-vars';
import Globe from './globe';
import InfoModal from './info-modal';
// import { MUX_HOME_PAGE_URL } from '../constants';

const GlobeLink = () => <Link href="/"><a><Globe /></a></Link>;
// const HomeLink = () => <Link href="/"><a><Globe /></a></Link>;

export default function Layout ({
  title,
  description,
  metaTitle,
  metaDescription,
  image,
  onFileDrop,
  darkMode,
  children,
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { getRootProps, isDragActive } = useDropzone({ onDrop: onFileDrop });
  const isDroppablePage = !!onFileDrop;
  const containerProps = isDroppablePage ? getRootProps() : {};

  return (
    <>
      <Head>
        <title>stream.new</title>
        <link rel="icon" href="/favicon.ico" />
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

        <main>
          <div className="modal-wrapper"><InfoModal close={() => setModalOpen(false)} /></div>
          {children}
        </main>
        <footer>
          <div className="footer-link"><a role="presentation" onClick={() => setModalOpen(true)}>Info</a></div>
          <div className="footer-link"><GlobeLink /></div>
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
          .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: ${darkMode ? '#111' : '#f8f8f8'};
            transition: background ${transitionDuration} ease;
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
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 1100px;
          }

          footer {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-left: 30px;
            padding-right: 30px;
            padding-bottom: 30px;
            height: 120px;
          }

          .footer-link {
            font-size: 26px;
            line-height: 33px;
          }

          .footer-link :global(a), .footer-link :global(a:visited) {
            color: ${darkMode ? '#ccc' : '#383838'};
            text-decoration: none;
            cursor: pointer;
          }

          @media only screen and (min-width: ${breakpoints.md}px) {
            .drag-overlay h1 {
              font-size: 96px;
              line-height: 120px;
            }
          }
        `}
        </style>

        <style jsx global>{`
          html, body, #__next, .container {
            height: 100%;
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
            color: ${darkMode ? '#ccc' : '#383838'};
          }

          h1, h2 {
            color: ${darkMode ? '#ccc' : '#383838'};
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

          * {
            box-sizing: border-box;
          }

          @media only screen and (min-width: ${breakpoints.md}px) {
            h1 {
              font-size: 64px;
              line-height: 80px;
              text-align: left;
            }
          }
        `}
        </style>
      </div>
    </>
  );
}
