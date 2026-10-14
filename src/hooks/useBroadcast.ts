'use client';
import { useEffect, useState } from 'react';
import { broadcastAt } from '@/lib/programming';

export function useBroadcast(initialTime?: string) {
  const [time, setTime] = useState<string | null>(initialTime ?? null);
  useEffect(() => {
    setTime(new Date().toISOString());
    const timer = window.setInterval(() => setTime(new Date().toISOString()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return time ? broadcastAt(new Date(time)) : null;
}
