import { distanceMeters } from './route';
import { progressAlong } from './progress';

type Point = { latitude: number; longitude: number };
type PathPoint = [number, number];

/** If a driver change would land this close to a waypoint (before or past it), it moves to the waypoint. */
export const SNAP_METERS = 5 * 1609.344;
/** Changes closer together than this are ignored, so the plan always moves forward. */
const MIN_STEP_METERS = 50;
const MAX_LEGS = 200;

export type DriverLeg = {
  crewId: string;
  /** Metres along the drawn route where this driver starts and stops. */
  fromMeters: number;
  toMeters: number;
};

export type DriverInput = { crewId: string; limitMinutes: number };

/** Cumulative length of the line at each of its points. */
function cumulative(path: PathPoint[]) {
  const sums = [0];
  for (let i = 1; i < path.length; i += 1) {
    sums.push(sums[i - 1] + distanceMeters({ latitude: path[i - 1][0], longitude: path[i - 1][1] }, { latitude: path[i][0], longitude: path[i][1] }));
  }
  return sums;
}

/** Linear lookup: the y for a given x on a rising list of points. */
function interpolate(xs: number[], ys: number[], x: number) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i += 1) {
    if (x <= xs[i]) {
      const span = xs[i] - xs[i - 1];
      return span <= 0 ? ys[i] : ys[i - 1] + ((x - xs[i - 1]) / span) * (ys[i] - ys[i - 1]);
    }
  }
  return ys[ys.length - 1];
}

/**
 * Splits the route into stretches, one driver after another in the order given, each as long as that driver's
 * limit allows. Drive time along the road is spread evenly over each stretch between two stops, using the
 * time Geoapify gave for it, so a fast highway stretch counts for more distance than a slow town stretch.
 * A change that falls within 5 miles of a stop (either side) moves to that stop instead.
 * Returns [] when there is nothing to split: fewer than two drivers, or no route.
 */
export function planDriverLegs({
  path,
  stops,
  legSeconds,
  drivers,
}: {
  path: PathPoint[];
  /** The routed stops in order, first to last. */
  stops: Point[];
  /** Drive time of each hop between neighbouring stops. */
  legSeconds: number[];
  /** Drivers in turn order. */
  drivers: DriverInput[];
}): DriverLeg[] {
  if (drivers.length < 2 || path.length < 2 || stops.length < 2 || legSeconds.length !== stops.length - 1) return [];

  const lengths = cumulative(path);
  const total = lengths[lengths.length - 1];
  if (total <= 0) return [];

  // Where each stop sits along the line, never going backwards. The first is the start and the last is the end.
  const places = stops.map((stop, index) => {
    if (index === 0) return 0;
    if (index === stops.length - 1) return total;
    return progressAlong(path, stop)?.alongMeters ?? 0;
  });
  for (let i = 1; i < places.length; i += 1) places[i] = Math.max(places[i], places[i - 1]);

  const clock = [0];
  legSeconds.forEach((seconds, i) => clock.push(clock[i] + Math.max(0, seconds)));
  const totalSeconds = clock[clock.length - 1];
  if (totalSeconds <= 0) return [];

  const timeAt = (meters: number) => interpolate(places, clock, meters);
  const metersAt = (seconds: number) => interpolate(clock, places, seconds);

  const legs: DriverLeg[] = [];
  let from = 0;
  for (let turn = 0; turn < MAX_LEGS; turn += 1) {
    const driver = drivers[turn % drivers.length];
    const until = timeAt(from) + driver.limitMinutes * 60;
    if (until >= totalSeconds) {
      legs.push({ crewId: driver.crewId, fromMeters: from, toMeters: total });
      break;
    }

    let change = Math.max(metersAt(until), from + MIN_STEP_METERS);
    let nearest = Infinity;
    for (let k = 1; k < places.length; k += 1) {
      const gap = Math.abs(places[k] - change);
      if (places[k] > from + MIN_STEP_METERS && gap <= SNAP_METERS && gap < nearest) {
        nearest = gap;
        change = places[k];
      }
    }

    if (change >= total - MIN_STEP_METERS) {
      legs.push({ crewId: driver.crewId, fromMeters: from, toMeters: total });
      break;
    }
    legs.push({ crewId: driver.crewId, fromMeters: from, toMeters: change });
    from = change;
  }
  return legs;
}

/** The pieces of the line to colour, one per leg. Each piece includes the exact point where the driver changes. */
export function sectionsFor(path: PathPoint[], legs: DriverLeg[]): { crewId: string; path: PathPoint[] }[] {
  if (legs.length === 0 || path.length < 2) return [];
  const lengths = cumulative(path);

  const pointAt = (meters: number): PathPoint => {
    for (let i = 1; i < lengths.length; i += 1) {
      if (meters <= lengths[i]) {
        const span = lengths[i] - lengths[i - 1];
        const t = span <= 0 ? 0 : (meters - lengths[i - 1]) / span;
        return [path[i - 1][0] + t * (path[i][0] - path[i - 1][0]), path[i - 1][1] + t * (path[i][1] - path[i - 1][1])];
      }
    }
    return path[path.length - 1];
  };

  return legs.map((leg) => {
    const inside = path.filter((_, i) => lengths[i] > leg.fromMeters && lengths[i] < leg.toMeters);
    return { crewId: leg.crewId, path: [pointAt(leg.fromMeters), ...inside, pointAt(leg.toMeters)] };
  });
}

/** Who is driving at a spot along the route. */
export function driverAt(legs: DriverLeg[], meters: number): DriverLeg | undefined {
  return legs.find((leg) => meters <= leg.toMeters) ?? legs[legs.length - 1];
}
