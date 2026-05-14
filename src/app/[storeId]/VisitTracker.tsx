'use client';

import { useEffect, useRef } from 'react';

export default function VisitTracker({ storeId }: { storeId: number }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    
    // Asynchronously trigger visit count without blocking render
    fetch(`/api/stores/${storeId}/visit`, { method: 'POST' }).catch(() => {});
  }, [storeId]);

  return null;
}
