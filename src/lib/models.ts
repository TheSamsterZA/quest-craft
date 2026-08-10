export type Role = 'parent' | 'kid';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string;
  avatar?: string;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';

export interface RecurrenceWeekly {
  type: 'weekly';
  weekdays: number[]; // 0=Sunday, 6=Saturday
}

export interface RecurrenceCustom {
  type: 'custom';
  everyNDays: number;
}

export type Recurrence = 
  | { type: 'none' }
  | { type: 'daily' }
  | RecurrenceWeekly
  | RecurrenceCustom;

export interface Chore {
  id: string;
  title: string;
  description?: string;
  points: number;
  assignedTo: string[]; // user IDs
  recurrence: Recurrence;
  dueDate?: string; // ISO date
  dueTime?: string; // HH:mm format
}

export interface PendingCompletion {
  id: string;
  choreId: string;
  byUserId: string;
  at: string; // ISO timestamp
  approved?: boolean;
  approvedBy?: string; // user ID
  approvedAt?: string; // ISO timestamp
}

export interface Transaction {
  id: string;
  userId: string;
  delta: number; // positive or negative
  reason: string;
  at: string; // ISO timestamp
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  progress: Record<string, number>; // userId -> pointsContributed
}

export interface AppState {
  users: User[];
  chores: Chore[];
  rewards: Reward[];
  transactions: Transaction[];
  pendingCompletions: PendingCompletion[];
}
