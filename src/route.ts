import { hasEndpoints, roleOf } from './stops';
import type { Trip, Waypoint } from './types';

export type LocatedStop = Waypoint & { latitude: number; longitude: number };

/** Metres between two points on the Earth's surface. */
export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function pathCost(order: LocatedStop[]) {
  let total = 0;
  for (let i = 1; i < order.length; i += 1) total += distanceMeters(order[i - 1], order[i]);
  return total;
}

/** Every ordering of the items (Heap's algorithm). */
function* permutations<T>(items: T[]): Generator<T[]> {
  const work = [...items];
  const counters = new Array<number>(work.length).fill(0);
  yield [...work];
  let i = 1;
  while (i < work.length) {
    if (counters[i] < i) {
      const swap = i % 2 === 0 ? 0 : counters[i];
      [work[swap], work[i]] = [work[i], work[swap]];
      yield [...work];
      counters[i] += 1;
      i = 1;
    } else {
      counters[i] = 0;
      i += 1;
    }
  }
}

const MOST_TO_TRY_ALL = 8;

/** The stop the trip is heading for, which always stays last. */
function isDestination(stop: Waypoint) {
  return roleOf(stop) === 'end' || stop.stop === 'Arrival';
}

/**
 * Puts the middle stops in the shortest order. The Start stays first (or the first stop if none is marked), and the End,
 * or a stop marked "Arrival", stays last. Distances are straight-line, which is a good guide for choosing an order.
 * Up to 8 middle stops are checked exhaustively; beyond that a nearest-neighbour pass plus 2-opt is used.
 */
export function orderStops(stops: LocatedStop[]): LocatedStop[] {
  if (stops.length <= 2) return stops;
  const startAt = Math.max(0, stops.findIndex((stop) => roleOf(stop) === 'start'));
  const first = stops[startAt];
  const rest = stops.filter((stop) => stop !== first);
  const endIndex = rest.findIndex(isDestination);
  const end = endIndex === -1 ? null : rest[endIndex];
  const middle = rest.filter((stop) => stop !== end);
  const wrap = (body: LocatedStop[]) => (end ? [first, ...body, end] : [first, ...body]);

  if (middle.length <= MOST_TO_TRY_ALL) {
    let best = middle;
    let bestCost = pathCost(wrap(middle));
    for (const candidate of permutations(middle)) {
      const cost = pathCost(wrap(candidate));
      if (cost < bestCost - 1e-6) {
        best = candidate;
        bestCost = cost;
      }
    }
    return wrap(best);
  }

  // Too many to try every order: go to the nearest unvisited stop each time, then untangle with 2-opt.
  const todo = [...middle];
  let order: LocatedStop[] = [];
  let here: LocatedStop = first;
  while (todo.length > 0) {
    let nearest = 0;
    for (let i = 1; i < todo.length; i += 1) {
      if (distanceMeters(here, todo[i]) < distanceMeters(here, todo[nearest])) nearest = i;
    }
    here = todo.splice(nearest, 1)[0];
    order.push(here);
  }
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length - 1; i += 1) {
      for (let j = i + 1; j < order.length; j += 1) {
        const flipped = [...order.slice(0, i), ...order.slice(i, j + 1).reverse(), ...order.slice(j + 1)];
        if (pathCost(wrap(flipped)) < pathCost(wrap(order)) - 1e-6) {
          order = flipped;
          improved = true;
        }
      }
    }
  }
  return wrap(order);
}

function hasLocation(stop: Waypoint): stop is LocatedStop {
  return typeof stop.latitude === 'number' && typeof stop.longitude === 'number';
}

/**
 * Stops on the route: only the selected ones with a location, in the shortest order.
 * Nothing is routed until the trip has both a Start and an End.
 */
export function routedStops(trip: Trip): LocatedStop[] {
  if (!hasEndpoints(trip)) return [];
  return orderStops(trip.waypoints.filter((stop): stop is LocatedStop => stop.status === 'selected' && hasLocation(stop)));
}

/** The stops shown on the Drive screen: the route in order, then selected stops that have no location. */
export function drivingStops(trip: Trip): Waypoint[] {
  const routed = routedStops(trip);
  const ids = new Set(routed.map((stop) => stop.id));
  return [...routed, ...trip.waypoints.filter((stop) => stop.status === 'selected' && !ids.has(stop.id))];
}

/** The centre for nearby searches: the end of the route, or else the last stop that is still in play. */
export function searchAnchor(trip: Trip): { latitude: number; longitude: number } | null {
  const routed = routedStops(trip);
  const fallback = trip.waypoints.filter((stop): stop is LocatedStop => stop.status !== 'vetoed' && hasLocation(stop));
  const last = routed[routed.length - 1] ?? fallback[fallback.length - 1];
  return last ? { latitude: last.latitude, longitude: last.longitude } : null;
}

export function routeKey(stops: LocatedStop[]) {
  return stops.map((stop) => `${stop.latitude.toFixed(5)},${stop.longitude.toFixed(5)}`).join('|');
}

export function miles(meters: number) {
  const value = meters / 1609.344;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} mi`;
}

export function duration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${String(rest).padStart(2, '0')} min`;
}

/** A short name that fits on a map pin. */
export function shortLabel(title: string) {
  const first = title.split(',')[0].trim();
  if (first.length <= 12) return first;
  const cut = first.slice(0, 12);
  const space = cut.lastIndexOf(' ');
  return space >= 5 ? cut.slice(0, space) : `${cut.slice(0, 11)}…`;
}

/** "10:05 AM" becomes minutes after midnight. Returns null for anything else. */
export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return ((hour % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + minute;
}

export function formatClock(minutes: number) {
  const day = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(day / 60);
  const minute = day % 60;
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/** "25 min stop" is 25. Anything without a number of minutes counts as 0. */
export function dwellMinutes(stopText: string) {
  const match = /(\d+)\s*min/i.exec(stopText);
  return match ? Number(match[1]) : 0;
}

export type StopTiming = { time: string; legMeters: number | null };

/**
 * Arrival times worked out from the real drive times. The first stop keeps its own time,
 * then each stop is the previous one plus the time spent there plus the drive.
 */
export function schedule(
  stops: LocatedStop[],
  legs: { distanceMeters: number; timeSeconds: number }[],
): Map<string, StopTiming> {
  const timings = new Map<string, StopTiming>();
  if (stops.length === 0 || legs.length !== stops.length - 1) return timings;
  let clock = parseClock(stops[0].time);
  timings.set(stops[0].id, { time: stops[0].time, legMeters: null });
  for (let index = 1; index < stops.length; index += 1) {
    const leg = legs[index - 1];
    if (clock !== null) clock += dwellMinutes(stops[index - 1].stop) + leg.timeSeconds / 60;
    timings.set(stops[index].id, {
      time: clock !== null ? formatClock(clock) : stops[index].time,
      legMeters: leg.distanceMeters,
    });
  }
  return timings;
}
