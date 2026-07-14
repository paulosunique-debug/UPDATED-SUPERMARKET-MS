import { useEffect, useRef, useState } from 'react';
import { storage } from '../services/storage';

/**
 * App starts completely empty — no demo/sample data is generated.
 * This hook just gives the persisted Zustand stores a tick to hydrate
 * from localStorage before rendering the app.
 */
export function useAppInit() {
  const [ready, setReady] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    setReady(true);
  }, []);

  return ready;
}

export function resetAllData() {
  storage.clearAll();
  window.location.reload();
}

// Kept for backward compatibility with any existing references.
export const resetDemoData = resetAllData;
