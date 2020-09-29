import { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import { breakpoints } from '../../style-vars';
import Link from 'next/link';
import useSwr from 'swr';
import Layout from '../../components/layout';
import Button from '../../components/button';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = null;

const Asset: React.FC<Props> = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data, error } = useSwr(
    () => (router.query.id ? `/api/assets/${router.query.id}` : null),
    fetcher,
    { refreshInterval: 5000 },
  );

  const asset = data && data.asset;

  let errorMessage;

  if (error) {
    errorMessage = 'Error fetching api';
  }

  if (data && data.error) {
    errorMessage = data.error;
  }

  useEffect(() => {
    if (asset && asset.playback_id && asset.status === 'ready') {
      Router.push(`/v/${asset.playback_id}`);
    }
  }, [asset]);

  useEffect(() => {
    /*
     * We want the page to finish rendering with light mode,
     * Then after load toggle to dark mode, which does a transition animation
     */
      setTimeout(() => setIsDarkMode(true));
  }, []);

 if (asset && asset.status === 'errored') {
    const message = asset.errors && asset.errors.messages[0];
    errorMessage = `Error creating this asset: ${message}`;
  }

  if (errorMessage) {
    return (
      <Layout darkMode={false}>
        <div><h1>{errorMessage}</h1></div>
        <div>
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout centered darkMode={isDarkMode} spinningLogo>
      <div className="preparing"><h1>Preparing</h1></div>
      <style jsx>{`
        .preparing {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }
        .preparing:after {
          display: inline-block;
          animation: dotty steps(1, end) 2.5s infinite;
          content: '';
          mix-blend-mode: exclusion;
          color: #f8f8f8;
          font-size: 36px;
          line-height: 45px;
        }

        @media only screen and (min-width: ${breakpoints.md}px) {
          .preparing:after {
            font-size: 64px;
            line-height: 80px;
          }
        }

        @keyframes dotty {
          0%   { content: ''; }
          25%  { content: '.'; }
          50%  { content: '..'; }
          75%  { content: '...'; }
          100% { content: ''; }
        }
      `}
      </style>
    </Layout>
  );
};

export default Asset;
