import Layout from '../components/layout';
import { MUX_HOME_PAGE_URL } from '../constants';
import { breakpoints } from '../style-vars';

export default function Terms () {
  return (
    <Layout>
      <div className="wrapper">
        <div>
          <h1>Terms</h1>
        </div>
        <div>
          <p>
            The deal is simple: you upload a video, your friends at <a href={MUX_HOME_PAGE_URL}>Mux</a>
            {' '}will stream it for a month, or until it costs us more than our CEO says is ok.
            After that, it will be deleted.
          </p>
          <p>
            As developers, we wanted a fast, frictionless way to share screencasts, desktop recordings,
            meetup talks, etc. that didn't include much overhead and where playback would Just Work for
            anyone with a link. So...that's what we built this for, but other stuff is ok too as long as
            it's nice and clean. We reserve the right to take down *any* piece of content, but anything
            hateful, pornographic, gore-y, or illegal is going to get insta-deleted.
          </p>
        </div>
      </div>
      <style jsx>{`
        p {
          font-size: 18px;
          line-height: 20px;
        }
        @media only screen and (min-width: ${breakpoints.md}px) {
          .wrapper {
            flex-grow: 1;
            flex-direction: column;
            display: flex;
            justify-content: center;
          }
          p {
            font-size: 26px;
            line-height: 38px;
          }
        }
      `}
      </style>
    </Layout>
  );
}
