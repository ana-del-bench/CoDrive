import { distanceMeters } from './route';

type Point = { latitude: number; longitude: number };

/** If the car is farther than this from the route, it is not on the route yet. */
export const OFF_ROUTE_METERS = 2000;

export type Progress = {
  /** How far along the route the car is, from 0 to 1. */
  fraction: number;
  /** How far the car is from the nearest point on the route. */
  offRouteMeters: number;
  /** Metres along the drawn line to the nearest point, and the line's whole length. */
  alongMeters: number;
  totalMeters: number;
};

/**
 * Finds the nearest point on the route line to the car, and how much of the route lies before it.
 * `path` is [latitude, longitude] pairs. Returns null if the route has no length.
 */
export function progressAlong(path: [number, number][], car: Point): Progress | null {
  if (path.length < 2) return null;
  const metersPerLat = 110_540;
  const metersPerLon = 111_320 * Math.cos((car.latitude * Math.PI) / 180);

  let total = 0;
  let best = { distance: Infinity, along: 0 };
  for (let i = 1; i < path.length; i += 1) {
    const a = { latitude: path[i - 1][0], longitude: path[i - 1][1] };
    const b = { latitude: path[i][0], longitude: path[i][1] };
    const length = distanceMeters(a, b);

    // Flat metres around the car: the car is the origin.
    const ax = (a.longitude - car.longitude) * metersPerLon;
    const ay = (a.latitude - car.latitude) * metersPerLat;
    const bx = (b.longitude - car.longitude) * metersPerLon;
    const by = (b.latitude - car.latitude) * metersPerLat;
    const dx = bx - ax;
    const dy = by - ay;
    const span = dx * dx + dy * dy;
    const t = span === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / span));
    const distance = Math.hypot(ax + t * dx, ay + t * dy);

    if (distance < best.distance) best = { distance, along: total + t * length };
    total += length;
  }
  if (total === 0) return null;
  return {
    fraction: Math.max(0, Math.min(1, best.along / total)),
    offRouteMeters: best.distance,
    alongMeters: Math.min(total, best.along),
    totalMeters: total,
  };
}

/** Which leg of the route the car is on, counting from 0. */
export function legAt(legs: { distanceMeters: number }[], metersAlong: number) {
  let covered = 0;
  for (let i = 0; i < legs.length; i += 1) {
    covered += legs[i].distanceMeters;
    if (metersAlong <= covered) return i;
  }
  return Math.max(0, legs.length - 1);
}
