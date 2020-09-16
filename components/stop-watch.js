import { useState, useEffect } from 'react';

const UPDATE_INTERVAL_MS = 1000;

const StopWatch = ({ startTimeUnixMs }) => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = (new Date()).valueOf();
      const secs = (now - startTimeUnixMs) / 1000;
      setTime(`${Math.floor(secs)} seconds`);
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>{time}</div>
  );
};

export default StopWatch;
