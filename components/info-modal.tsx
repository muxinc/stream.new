import Link from 'next/link';
import { MUX_HOME_PAGE_URL, OPEN_SOURCE_URL } from '../constants';

type Props = { close: () => void };

const InfoModal: React.FC<Props> = ({ close }) => {
  return (
    <div className="container">
      <div className="wrapper">
        <h1>This is an <a href={OPEN_SOURCE_URL}>open source</a> project from <a href={MUX_HOME_PAGE_URL}>Mux</a>, the video streaming API.</h1>
        <Link href="/terms"><a><h1>Read the terms</h1></a></Link>
      </div>
      <footer>
        <div className="footer-link"><a role="presentation" onClick={close}>Close</a></div>
      </footer>
      <style jsx>{`
        .wrapper {
          padding: 20px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        h1 {
          margin-bottom: 30px;
        }
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #f8f8f8;
        }
        footer {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 30px;
          padding-right: 30px;
          padding-bottom: 30px;
          height: 70px;
        }

        .footer-link {
          font-size: 26px;
          line-height: 33px;
        }
      `}
      </style>
    </div>
  );
};

export default InfoModal;
