// import { breakpoints } from '../style-vars';

/*
 *  Use this as a direct child of a <Layout /> component
 */

type Props = {
  text?: string;
}

/*
 * Previously tried to do this animation with the 'content:' css property
 * with the :after selector, but Safari and Firefox don't like that
 */

const FullpageLoader: React.FC<Props> = ({ text }) => {
  return (
    <div className="wrapper">
      <div><h1>{text || 'Loading'}<span>.</span><span>.</span><span>.</span></h1></div>
      <style jsx>{`
        .wrapper {
          justify-content: center;
          flex-direction: column;
          display: flex;
          flex-grow: 1;
        }

        h1 {
          display: inline-block;
          font-size: 8vw;
          max-width: 100%;
        }
        h1 span {
          opacity: 0;
        }

        h1 span:nth-child(1) {
          animation: dot1 2s steps(1, end) infinite;
          animation-delay: 1s;
        }
        h1 span:nth-child(2) {
          animation: dot2 2s steps(1, end) infinite;
          animation-delay: 1s;
        }
        h1 span:nth-child(3) {
          animation: dot3 2s steps(1, end) infinite;
          animation-delay: 1s;
        }

        @keyframes dot1 {
          20% { opacity: 1; }
        }

        @keyframes dot2 {
          40% { opacity: 1; }
        }

        @keyframes dot3 {
          60% { opacity: 1; }
        }
      `}
      </style>
    </div>
  );
};

export default FullpageLoader;
