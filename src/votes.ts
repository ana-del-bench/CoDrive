import type { Vote, Waypoint, WaypointStatus } from './types';

/** For now a stop's status follows your vote: up is selected, down is vetoed, none is suggested. */
export function statusFor(vote: Vote): WaypointStatus {
  if (vote === 'up') return 'selected';
  if (vote === 'down') return 'vetoed';
  return 'suggested';
}

/**
 * Casts a vote, or takes it back if it is the same one again.
 * Switching from up to down moves your count across, so each stop always has at most one of your votes.
 */
export function castVote(stop: Waypoint, direction: 'up' | 'down'): Waypoint {
  const next: Vote = stop.vote === direction ? null : direction;
  let likes = stop.likes;
  let dislikes = stop.dislikes;
  if (stop.vote === 'up') likes -= 1;
  if (stop.vote === 'down') dislikes -= 1;
  if (next === 'up') likes += 1;
  if (next === 'down') dislikes += 1;
  return { ...stop, vote: next, likes, dislikes, status: statusFor(next) };
}
