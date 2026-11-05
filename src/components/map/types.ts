import type { Area } from '@/lib/geo';
import type { LatLng } from '@/lib/types';

export type MapMarker = {
  id: string;
  location: LatLng;
  /** Short text inside the pin, e.g. the stop number. */
  label: string;
  title: string;
  /** Dims the pin, e.g. a stop the current user is skipping. */
  muted?: boolean;
};

export type TripMapProps = {
  markers?: MapMarker[];
  /** Draw a line through the markers in order. */
  showRoute?: boolean;
  areas?: Area[];
  /** Points of an area being drawn right now. */
  draft?: LatLng[];
  /** Called with the tapped location; used for drawing areas. */
  onPress?: (at: LatLng) => void;
  height?: number;
  /** Initial view when there is nothing to fit to. */
  initialCenter?: LatLng;
  initialZoom?: number;
};

export const AREA_COLORS = ['#0A66FF', '#E0457B', '#1F9D55', '#C27803', '#7C4DFF'];
