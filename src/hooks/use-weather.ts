import { useEffect, useState } from 'react';

import { getDailyWeather, type DailyWeather } from '@/integrations/weather';
import type { LatLng } from '@/lib/types';

/** Daily weather for the given dates at one location; null while loading. */
export function useDailyWeather(at: LatLng | undefined, dates: string[]): DailyWeather[] | null {
  const [data, setData] = useState<DailyWeather[] | null>(null);
  const key = at ? `${at.lat.toFixed(2)},${at.lng.toFixed(2)}|${dates.join(',')}` : '';

  useEffect(() => {
    if (!at || dates.length === 0) return;
    let live = true;
    setData(null);
    getDailyWeather(at, dates).then((w) => live && setData(w));
    return () => {
      live = false;
    };
    // `key` captures at and dates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return data;
}
