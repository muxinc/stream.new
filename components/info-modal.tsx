import { useState} from 'react';
import { breakpoints } from '../style-vars';
import { MUX_HOME_PAGE_URL, OPEN_SOURCE_URL } from '../constants';

type Props = { close: () => void };

const InfoModal: React.FC<Props> = ({ close }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="container">
      <div className="wrapper">
        <h1>This is an <a href={OPEN_SOURCE_URL}>open source</a> project from <a href={MUX_HOME_PAGE_URL}>Mux</a>, the video streaming API.</h1>
        <div className="view-terms"><a onClick={() => setShowTerms((val) => !val)} role="link" onKeyDown={close} tabIndex={0}>{ showTerms ? 'Hide terms' : 'Show terms' }</a></div>
        <div className="terms">
          <p>
            The deal is simple: you upload a video, your friends at <a href={MUX_HOME_PAGE_URL}>Mux</a>
            {' '}will stream it for a month, or until it costs us more than our CEO says is ok.
            After that, it will be deleted.
          </p>
          <p>
            As developers, we wanted a fast, frictionless way to share screencasts, desktop recordings,
            meetup talks, etc. that did not include much overhead and where playback would Just Work for
            anyone with a link. So...that&apos;s what we built this for, but other stuff is ok too as long as
            it is nice and clean. We reserve the right to take down <strong>any</strong> piece of content, but anything
            hateful, pornographic, gore-y, or illegal is going to get insta-deleted.
          </p>
        </div>
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
        .view-terms {
          margin-top: 40px;
          font-size: 26px;
        }
        .terms {
          display: ${showTerms ? 'flex' : 'none'};
          flex-direction column;
          overflow-y: scroll;
          max-height: 300px;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          .wrapper {
            align-items: center;
          }
          .terms {
            max-width: 1000px;
            max-height: 500px;
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
