import { useEffect, useCallback, useRef } from 'react';

const EVENTS = [
  'mousemove',
  'keydown',
  'wheel',
  'DOMMouseScroll',
  'mouseWheel',
  'mousedown',
  'touchstart',
  'touchmove',
  'MSPointerDown',
  'MSPointerMove',
  'visibilitychange'
];

interface UseIdleTimeoutOptions {
  onIdle: () => void;
  idleTimeInMinutes?: number;
}

export const useIdleTimeout = ({ onIdle, idleTimeInMinutes = 30 }: UseIdleTimeoutOptions) => {
  const idleTimeMs = idleTimeInMinutes * 60 * 1000;
  // Use a ref to hold the latest onIdle callback to avoid unnecessary re-renders or effect re-runs
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const updateActivity = useCallback(() => {
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  useEffect(() => {
    // Initialize lastActivity if it doesn't exist
    if (!localStorage.getItem('lastActivity')) {
      updateActivity();
    }

    const checkIdleStatus = () => {
      const lastActivityStr = localStorage.getItem('lastActivity');
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (Date.now() - lastActivity > idleTimeMs) {
          onIdleRef.current();
        }
      }
    };

    // Attach event listeners for user activity
    EVENTS.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Also check on interval to handle sleep mode wakes immediately
    const interval = setInterval(checkIdleStatus, 5000); // Check every 5 seconds
    
    // Check immediately in case they woke up from sleep before clicking anything
    checkIdleStatus();

    return () => {
      EVENTS.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [idleTimeMs, updateActivity]);
};
