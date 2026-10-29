export type Tab = 'home' | 'plan' | 'drive' | 'costs';
export type ExpenseIcon = 'food' | 'snorkel' | 'stay' | 'treat' | 'gas';

export interface Crew {
  id: string;
  name: string;
  initial: string;
  color: string;
}

export interface Waypoint {
  id: string;
  title: string;
  detail: string;
  proposedBy: string;
  likes: number;
  liked: boolean;
  image: string;
  time: string;
  stop: string;
  pin: string;
}

export interface Expense {
  id: string;
  title: string;
  details: string;
  amount: number;
  icon: ExpenseIcon;
}

export interface RestStop {
  place: string;
  distance: string;
  note: string;
}

export interface Trip {
  id: string;
  title: string;
  routeName: string;
  dates: string;
  image: string;
  crew: Crew[];
  waypoints: Waypoint[];
  expenses: Expense[];
  budget: number;
  duration: string;
  leg: string;
  progress: number;
  rest: RestStop;
}
