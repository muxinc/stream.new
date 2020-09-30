import { useState, useEffect } from 'react';

const UPDATE_INTERVAL_MS = 1000;

type Props = {
  startTimeUnixMs: number
};

const StopWatch: React.FC<Props> = ({ startTimeUnixMs }) => {
  const [time, setTime] = useState('');

  const updateTimer = () => {
    const now = (new Date()).valueOf();
    let secs = Math.floor((now - startTimeUnixMs) / 1000);
    let mins;
    let text;
    if (secs > 60) {
      mins = Math.floor(secs / 60);
    }
    if (typeof mins !== 'undefined') {
      secs = secs - (60 * mins);
      if (mins === 1) {
        text = `${mins} minute ${secs} seconds`;
      } else {
        text = `${mins} minutes ${secs} seconds`;
      }
    } else {
      text = `${secs} seconds`;
    }
    setTime(text);
  };

  useEffect(() => {
    const interval = setInterval(updateTimer, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>{time || '0 seconds'}</div>
  );
};

export default StopWatch;
