/**
 * Talks to Geoapify on behalf of the app. The API key is read from the environment by the caller
 * and only ever travels from this server to Geoapify, never to the phone or the browser.
 */

const AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
const ROUTING_URL = 'https://api.geoapify.com/v1/routing';
const PLACES_URL = 'https://api.geoapify.com/v2/places';

/** What the app can ask for nearby, mapped to Geoapify place categories. */
export const PLACE_CATEGORIES = {
  food: 'catering.restaurant,catering.cafe,catering.fast_food',
  gas: 'commercial.gas',
  beach: 'beach',
  sights: 'tourism.attraction,tourism.sights',
  lodging: 'accommodation',
} as const;

export type PlaceCategory = keyof typeof PLACE_CATEGORIES;

export function isPlaceCategory(value: string): value is PlaceCategory {
  return Object.prototype.hasOwnProperty.call(PLACE_CATEGORIES, value);
}

export type AddressSuggestion = {
  id: string;
  /** Short text for the form field, like "Ala Moana Center, Honolulu". */
  name: string;
  line1: string;
  line2: string;
  /** Full formatted address. */
  label: string;
  latitude: number;
  longitude: number;
};

export class GeoError extends Error {}

type Feature = { properties?: Record<string, unknown>; geometry?: { coordinates?: unknown } };

export async function autocompleteAddress(
  text: string,
  apiKey: string,
  options: { limit?: number; endpoint?: string; near?: { latitude: number; longitude: number } } = {},
): Promise<AddressSuggestion[]> {
  const limit = options.limit ?? 5;
  const url = new URL(options.endpoint ?? AUTOCOMPLETE_URL);
  url.searchParams.set('text', text);
  url.searchParams.set('limit', String(limit));
  if (options.near) {
    url.searchParams.set('bias', `proximity:${options.near.longitude},${options.near.latitude}`);
  }
  url.searchParams.set('apiKey', apiKey);

  const body = await getJson(url);
  return featuresOf(body).flatMap((feature) => toSuggestion(feature)).slice(0, limit);
}

/** Named places of one kind near a point, like gas stations or beaches. */
export async function findPlaces(
  category: PlaceCategory,
  near: { latitude: number; longitude: number },
  apiKey: string,
  options: { limit?: number; radiusMeters?: number; endpoint?: string } = {},
): Promise<AddressSuggestion[]> {
  const limit = options.limit ?? 8;
  const radius = options.radiusMeters ?? 15_000;
  const url = new URL(options.endpoint ?? PLACES_URL);
  url.searchParams.set('categories', PLACE_CATEGORIES[category]);
  url.searchParams.set('filter', `circle:${near.longitude},${near.latitude},${radius}`);
  url.searchParams.set('bias', `proximity:${near.longitude},${near.latitude}`);
  // Ask for extra, because unnamed places are dropped below.
  url.searchParams.set('limit', String(limit * 2));
  url.searchParams.set('apiKey', apiKey);

  const body = await getJson(url);
  return featuresOf(body)
    .filter((feature) => str(feature.properties?.name) !== null)
    .flatMap((feature) => toSuggestion(feature))
    .slice(0, limit);
}

export type RoutePoint = { latitude: number; longitude: number };

export type RoutePlan = {
  distanceMeters: number;
  timeSeconds: number;
  /** One entry per hop between neighbouring points. */
  legs: { distanceMeters: number; timeSeconds: number }[];
  /** The road line as [latitude, longitude] pairs, thinned out for drawing. */
  path: [number, number][];
};

const MAX_PATH_POINTS = 400;

/** Driving route through the points in order. */
export async function planRoute(
  points: RoutePoint[],
  apiKey: string,
  options: { endpoint?: string } = {},
): Promise<RoutePlan> {
  const url = new URL(options.endpoint ?? ROUTING_URL);
  url.searchParams.set('waypoints', points.map((point) => `${point.latitude},${point.longitude}`).join('|'));
  url.searchParams.set('mode', 'drive');
  url.searchParams.set('apiKey', apiKey);

  const body = await getJson(url);
  const feature = featuresOf(body)[0] as
    | { properties?: Record<string, unknown>; geometry?: { coordinates?: unknown } }
    | undefined;
  if (!feature) throw new GeoError('Geoapify found no route between those places');

  const props = feature.properties ?? {};
  const rawLegs = Array.isArray(props.legs) ? (props.legs as Record<string, unknown>[]) : [];
  const legs = rawLegs.map((leg) => ({
    distanceMeters: finite(leg.distance) ?? 0,
    timeSeconds: finite(leg.time) ?? 0,
  }));
  const distanceMeters = finite(props.distance) ?? legs.reduce((sum, leg) => sum + leg.distanceMeters, 0);
  const timeSeconds = finite(props.time) ?? legs.reduce((sum, leg) => sum + leg.timeSeconds, 0);

  return { distanceMeters, timeSeconds, legs, path: thin(flattenPath(feature.geometry?.coordinates)) };
}

/** Geoapify sends [lon, lat] points, either as one line or as one line per leg. */
function flattenPath(coordinates: unknown): [number, number][] {
  if (!Array.isArray(coordinates)) return [];
  const path: [number, number][] = [];
  const add = (pair: unknown) => {
    if (!Array.isArray(pair)) return;
    const lon = finite(pair[0]);
    const lat = finite(pair[1]);
    if (lat === null || lon === null) return;
    const last = path[path.length - 1];
    if (last && last[0] === lat && last[1] === lon) return;
    path.push([lat, lon]);
  };
  for (const part of coordinates) {
    if (Array.isArray(part) && Array.isArray(part[0])) part.forEach(add);
    else add(part);
  }
  return path;
}

function thin(path: [number, number][]): [number, number][] {
  if (path.length <= MAX_PATH_POINTS) return path;
  const step = (path.length - 1) / (MAX_PATH_POINTS - 1);
  return Array.from({ length: MAX_PATH_POINTS }, (_, index) => path[Math.round(index * step)]);
}

/** Fetches and parses JSON. Error messages never include the URL, because the URL contains the key. */
async function getJson(url: URL): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  } catch {
    throw new GeoError('Could not reach Geoapify (network error or timeout)');
  }
  if (!response.ok) {
    throw new GeoError(`Geoapify answered with status ${response.status}`);
  }
  return response.json().catch(() => null);
}

function featuresOf(body: unknown): Feature[] {
  const features = (body as { features?: unknown } | null)?.features;
  return Array.isArray(features) ? (features as Feature[]) : [];
}

function toSuggestion(feature: Feature): AddressSuggestion[] {
  const props = feature.properties ?? {};
  const coords = Array.isArray(feature.geometry?.coordinates) ? feature.geometry.coordinates : [];
  const latitude = finite(props.lat) ?? finite(coords[1]);
  const longitude = finite(props.lon) ?? finite(coords[0]);
  if (latitude === null || longitude === null) return [];

  const line1 = str(props.address_line1) ?? str(props.name) ?? '';
  const line2 = str(props.address_line2) ?? '';
  const label = str(props.formatted) ?? [line1, line2].filter(Boolean).join(', ');
  if (!label) return [];

  const city = str(props.city);
  const name = line1 ? (city && !line1.includes(city) ? `${line1}, ${city}` : line1) : label;

  return [{ id: str(props.place_id) ?? `${latitude},${longitude}`, name, line1, line2, label, latitude, longitude }];
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function finite(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** A small in-memory limit per caller, so a runaway client can't burn through the Geoapify quota. */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function isLimited(caller: string): boolean {
    const now = Date.now();
    if (hits.size > 1000) hits.clear();
    const recent = (hits.get(caller) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      hits.set(caller, recent);
      return true;
    }
    recent.push(now);
    hits.set(caller, recent);
    return false;
  };
}
