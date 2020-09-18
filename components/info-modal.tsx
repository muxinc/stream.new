import Link from 'next/link';
import { breakpoints } from '../style-vars';
import { MUX_HOME_PAGE_URL, OPEN_SOURCE_URL } from '../constants';

type Props = { close: () => void };

const InfoModal: React.FC<Props> = ({ close }) => {
  return (
    <div className="container">
      <div className="wrapper">
        <h1>This is an <a href={OPEN_SOURCE_URL}>open source</a> project from <a href={MUX_HOME_PAGE_URL}>Mux</a>, the video streaming API.</h1>
        <div className="terms"><Link href="/terms"><a onClick={close} role="link" onKeyDown={close} tabIndex={0}>View Terms</a></Link></div>
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
        .terms {
          margin-top: 40px;
          font-size: 26px;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          .wrapper {
            align-items: center;
            justify-content:center;
          }
          h1 {
            text-align: center;
            max-width: 1100px;
          }
        }
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #f8f8f8;
        }
        h1, a, a:visited {
          color: #383838;
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
      `}
      </style>
    </div>
  );
};

export default InfoModal;
