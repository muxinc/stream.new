'use client';

/*
 * The one genuinely interactive piece of the server-rendered player page:
 * copy-URL + report-abuse. Kept as a single small client leaf so the rest of
 * the page can be server components. Unlike PlayerPage, opening the report
 * form does not unmount the (server-rendered) player. (CJP)
 */
import { useEffect, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import ReportForm from './report-form';

type Props = {
  playbackId: string;
  shareUrl: string;
};

const PlayerActions: React.FC<Props> = ({ playbackId, shareUrl }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const copyUrl = () => {
    copy(shareUrl, { message: 'Copy' });
    setIsCopied(true);
    copyTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      copyTimeoutRef.current = null;
    }, 5000);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {!openReport && (
          <a onClick={copyUrl} onKeyPress={copyUrl} role="button" tabIndex={0} style={{ paddingLeft: 15, paddingRight: 15 }}>
            {isCopied ? 'Copied to clipboard' : 'Copy video URL'}
          </a>
        )}
        <a
          onClick={() => setOpenReport(!openReport)}
          onKeyPress={() => setOpenReport(!openReport)}
          role="button"
          tabIndex={0}
          style={{ paddingLeft: 15, paddingRight: 15 }}
        >
          {openReport ? 'Back' : 'Report abuse'}
        </a>
      </div>
      {openReport && (
        <div style={{ margin: '20px auto auto', maxWidth: 800 }}>
          <ReportForm playbackId={playbackId} close={() => setOpenReport(false)} />
        </div>
      )}
    </>
  );
};

export default PlayerActions;
