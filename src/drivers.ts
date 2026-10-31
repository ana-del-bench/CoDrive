import { duration } from './route';
import type { Crew, Driver, Trip } from './types';

export const MAX_LIMIT_MINUTES = 12 * 60;
/** The shortest driving limit a driver can have. */
export const MIN_LIMIT_MINUTES = 60;
export const DEFAULT_LIMIT_MINUTES = 4 * 60;

export function clampLimit(minutes: number) {
  return Math.min(MAX_LIMIT_MINUTES, Math.max(MIN_LIMIT_MINUTES, Math.round(minutes)));
}

export function splitLimit(minutes: number) {
  const total = clampLimit(minutes);
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

export function joinLimit(hours: number, minutes: number) {
  return clampLimit(hours * 60 + minutes);
}

/** "4 hr", "1 hr 30 min" or "45 min". */
export function formatLimit(minutes: number) {
  return duration(clampLimit(minutes) * 60);
}

/** Ticks or unticks a crew member as a driver. New drivers start with the default limit. */
export function toggleDriver(drivers: Driver[], crewId: string): Driver[] {
  return drivers.some((driver) => driver.crewId === crewId)
    ? drivers.filter((driver) => driver.crewId !== crewId)
    : [...drivers, { crewId, limitMinutes: DEFAULT_LIMIT_MINUTES }];
}

export function setLimit(drivers: Driver[], crewId: string, minutes: number): Driver[] {
  return drivers.map((driver) => (driver.crewId === crewId ? { ...driver, limitMinutes: clampLimit(minutes) } : driver));
}

/** Drivers who are still on the crew, in crew order. */
export function currentDrivers(trip: Pick<Trip, 'crew' | 'drivers'>): { member: Crew; limitMinutes: number }[] {
  return trip.crew.flatMap((member) => {
    const driver = trip.drivers.find((item) => item.crewId === member.id);
    return driver ? [{ member, limitMinutes: driver.limitMinutes }] : [];
  });
}
