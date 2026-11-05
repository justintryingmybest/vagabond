/**
 * Daily weather for a trip. Uses Open-Meteo (free, no key; its free tier is
 * for non-commercial use, so a paid plan is needed before a commercial launch).
 * Dates past the ~16-day forecast window, or any failed request, fall back to
 * a seasonal estimate that is clearly labeled as such in the UI.
 */
import { addDays } from '@/lib/dates';
import type { LatLng } from '@/lib/types';

export type Sky = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow';

export type DailyWeather = {
  date: string;
  sky: Sky;
  highC: number;
  /** Chance of rain, 0-100. */
  rainChance: number;
  source: 'forecast' | 'estimate';
};

const FORECAST_DAYS = 16;

export async function getDailyWeather(at: LatLng, dates: string[]): Promise<DailyWeather[]> {
  if (dates.length === 0) return [];
  const today = new Date().toISOString().slice(0, 10);
  const horizon = addDays(today, FORECAST_DAYS - 1);
  const inWindow = dates.filter((d) => d >= today && d <= horizon);

  let forecast = new Map<string, DailyWeather>();
  if (inWindow.length > 0) {
    try {
      forecast = await fetchOpenMeteo(at, inWindow[0], inWindow[inWindow.length - 1]);
    } catch {
      // Network or quota failure: fall through to estimates.
    }
  }
  return dates.map((d) => forecast.get(d) ?? estimate(at, d));
}

async function fetchOpenMeteo(at: LatLng, start: string, end: string) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${at.lat}&longitude=${at.lng}` +
    `&daily=weather_code,temperature_2m_max,precipitation_probability_max` +
    `&timezone=auto&start_date=${start}&end_date=${end}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      precipitation_probability_max: (number | null)[];
    };
  };
  const out = new Map<string, DailyWeather>();
  json.daily.time.forEach((date, i) => {
    out.set(date, {
      date,
      sky: skyFromWmo(json.daily.weather_code[i]),
      highC: Math.round(json.daily.temperature_2m_max[i]),
      rainChance: json.daily.precipitation_probability_max[i] ?? 0,
      source: 'forecast',
    });
  });
  return out;
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function skyFromWmo(code: number): Sky {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 2) return 'cloudy';
  return 'clear';
}

/**
 * Deterministic stand-in until a climate-normals source is wired up.
 * Temperature follows latitude and season; rain varies by date.
 */
function estimate(at: LatLng, date: string): DailyWeather {
  const month = Number(date.slice(5, 7));
  const north = at.lat >= 0;
  const summerness = Math.cos(((month - (north ? 7 : 1)) / 12) * 2 * Math.PI); // 1 = peak summer
  const base = 33 - Math.abs(at.lat) * 0.4;
  const highC = Math.round(base + summerness * 6);
  let h = 0;
  for (const ch of date + at.lat.toFixed(1)) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const rainChance = Math.min(90, Math.max(5, Math.round((h % 70) + (1 - summerness) * 10)));
  const sky: Sky = rainChance >= 60 ? (highC <= 1 ? 'snow' : 'rain') : rainChance >= 35 ? 'cloudy' : 'clear';
  return { date, sky, highC, rainChance, source: 'estimate' };
}

export const skyLabel: Record<Sky, string> = {
  clear: 'Sunny',
  cloudy: 'Cloudy',
  rain: 'Rain likely',
  storm: 'Storms',
  snow: 'Snow',
};

export const toF = (c: number) => Math.round((c * 9) / 5 + 32);
