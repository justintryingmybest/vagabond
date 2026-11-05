import type { Day, Stop } from './types.ts';

/** Minimal weather shape so this module stays free of app imports. */
export type DayWeather = { date: string; rainChance: number; sky: string };

export type WeatherTip =
  | { kind: 'swap'; dayId: string; withDayId: string; reason: string }
  | { kind: 'indoor'; dayId: string; stopIds: string[]; reason: string };

const OUTDOOR_KINDS = new Set<Stop['kind']>(['excursion']);

/** A stop counts as outdoor if it's tagged outdoors or is an excursion. */
export function isOutdoor(stop: Stop): boolean {
  return stop.tags.includes('outdoors') || OUTDOOR_KINDS.has(stop.kind);
}

const BAD = 60; // rain chance (%) that makes outdoor plans risky
const GOOD = 35;

/**
 * For each wet day with outdoor stops, suggest swapping with a drier day that
 * has fewer outdoor stops; otherwise suggest indoor alternatives.
 */
export function weatherTips(days: Day[], weather: DayWeather[]): WeatherTip[] {
  const byDate = new Map(weather.map((w) => [w.date, w]));
  const tips: WeatherTip[] = [];
  const usedInSwap = new Set<string>();

  for (const day of days) {
    const w = byDate.get(day.date);
    if (!w || w.rainChance < BAD || usedInSwap.has(day.id)) continue;
    const outdoor = day.stops.filter(isOutdoor);
    if (outdoor.length === 0) continue;

    const candidate = days
      .filter((d) => d.id !== day.id && !usedInSwap.has(d.id))
      .map((d) => ({ d, w: byDate.get(d.date) }))
      .filter((x) => x.w && x.w.rainChance <= GOOD)
      .filter((x) => x.d.stops.filter(isOutdoor).length < outdoor.length)
      .sort((a, b) => a.w!.rainChance - b.w!.rainChance)[0];

    if (candidate) {
      usedInSwap.add(day.id).add(candidate.d.id);
      tips.push({
        kind: 'swap',
        dayId: day.id,
        withDayId: candidate.d.id,
        reason: `${w.rainChance}% chance of rain on ${day.date}; ${candidate.d.date} looks drier (${candidate.w!.rainChance}%).`,
      });
    } else {
      tips.push({
        kind: 'indoor',
        dayId: day.id,
        stopIds: outdoor.map((s) => s.id),
        reason: `${w.rainChance}% chance of rain on ${day.date}. Have an indoor backup ready.`,
      });
    }
  }
  return tips;
}
