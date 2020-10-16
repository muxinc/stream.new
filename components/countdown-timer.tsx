import React from 'react';

export interface CountdownTimerHandles {
  start: () => void;
  reset: () => void;
}

interface Props {
  seconds?: number;
  onElapsed?: () => void;
}

const CountdownTimer = ({ seconds = 3, onElapsed }:Props, ref:React.Ref<CountdownTimerHandles>) => {
  const [isCountdownActive, setIsCountdownActive] = React.useState<boolean>(false);
  const [recCountdown, setRecCountdown] = React.useState<number>(seconds);

  const recCountdownRef = React.useRef<number>(recCountdown);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    return () => {
      if(countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setIsCountdownActive(false);
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    start: () => {
      resetTimeout();
      setIsCountdownActive(true);
      startTimeout();
    },
    reset: () => {
      resetTimeout();
    }
  }));

  const tick = () => {
    if(recCountdownRef.current <= 1) {
      resetTimeout();
      onElapsed && onElapsed();

      return;
    }

    setRecCountdown(recCountdown => recCountdown - 1);
    recCountdownRef.current = recCountdownRef.current - 1;
    startTimeout();
  };

  const startTimeout = function() {
    countdownIntervalRef.current = setTimeout(tick, 1000);
  };

  const resetTimeout = function() {
    if(countdownIntervalRef.current) {
      clearTimeout(countdownIntervalRef.current);
    }
    
    setIsCountdownActive(false);
    recCountdownRef.current = seconds;
    setRecCountdown(seconds);
  };

  if(!isCountdownActive) return null;

  return (<>
    <div className='wrap'>
      <span className='countdown-text'>{recCountdown}</span>
    </div>
    <style jsx>{`
      .wrap {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        align-items: center;
        justify-content: center;
        display: flex;
        background-color: rgba(0, 0, 0, .45);
        border-radius: 30px;
      }
      .countdown-text {
        -webkit-text-stroke-width: 2px;
        -webkit-text-stroke-color: #000;
        color: #fff;
        font-family: Akkurat;
        font-size: 54pt;
        font-weight: bold;
      }
    `}</style>
  </>);
};

export default React.forwardRef<CountdownTimerHandles, Props>(CountdownTimer);
