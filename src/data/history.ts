/**
 * Past trips taken before joining Vagabond (or not planned in the app),
 * reduced to passport stamps. Sample data for the beta; in production these
 * come from completed trips plus anything the traveler adds by hand.
 */
import type { Stamp } from '@/lib/passport';

export const pastStamps: Record<string, Stamp[]> = {
  'u-me': [
    { country: 'Mexico', year: 2023, km: 420 },
    { country: 'Italy', year: 2024, km: 910 },
    { country: 'France', year: 2024, km: 380 },
    { country: 'Portugal', year: 2025, km: 260 },
  ],
  'u-sam': [
    { country: 'Spain', year: 2024, km: 540 },
    { country: 'Thailand', year: 2025, km: 1300 },
    { country: 'Vietnam', year: 2025, km: 1650 },
  ],
  'u-alex': [
    { country: 'France', year: 2023, km: 300 },
    { country: 'Netherlands', year: 2024, km: 180 },
    { country: 'United Kingdom', year: 2025, km: 450 },
  ],
  'u-riley': [
    { country: 'Peru', year: 2022, km: 1100 },
    { country: 'Chile', year: 2023, km: 2400 },
    { country: 'New Zealand', year: 2024, km: 2900 },
    { country: 'Iceland', year: 2025, km: 1350 },
    { country: 'Kenya', year: 2025, km: 800 },
  ],
  'u-maya': [
    { country: 'Italy', year: 2024, km: 700 },
    { country: 'Greece', year: 2025, km: 650 },
  ],
  'u-jordan': [
    { country: 'Croatia', year: 2024, km: 520 },
    { country: 'Mexico', year: 2025, km: 610 },
    { country: 'Colombia', year: 2025, km: 880 },
  ],
  'u-priya': [
    { country: 'India', year: 2023, km: 2100 },
    { country: 'Egypt', year: 2024, km: 900 },
    { country: 'Morocco', year: 2025, km: 760 },
    { country: 'Japan', year: 2025, km: 640 },
  ],
};
