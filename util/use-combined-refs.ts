import { useEffect, useRef, MutableRefObject } from 'react';

import { HTMLVideoElementWithPlyr } from '../types';

export const useCombinedRefs = function (...refs: (((instance: HTMLVideoElementWithPlyr | null) => void) | MutableRefObject<HTMLVideoElementWithPlyr | null> | null)[]):MutableRefObject<HTMLVideoElementWithPlyr | null> {
  const targetRef = useRef(null);

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
};
