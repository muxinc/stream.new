import { useState, useEffect } from 'react';

const StopWatch = ({ startTimeUnixMs }) => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = (new Date()).valueOf();
      const secs = (now - startTimeUnixMs) / 1000;
      setTime(`${Math.floor(secs)} seconds`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>{time}</div>
  );
};

export default StopWatch;
