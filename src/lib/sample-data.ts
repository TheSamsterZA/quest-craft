import type { AppState } from './models';

export const SAMPLE_DATA: AppState = {
  users: [
    { id: 'p1', name: 'Alex', role: 'parent', pin: '1111', avatar: '🌟' },
    { id: 'p2', name: 'Sam', role: 'parent', pin: '2222', avatar: '🛡️' },
    { id: 'k1', name: 'Zoe', role: 'kid', pin: '1212', avatar: '🦊' },
    { id: 'k2', name: 'Max', role: 'kid', pin: '3434', avatar: '🐼' }
  ],
  chores: [
    {
      id: 'c1',
      title: 'Make Bed',
      description: 'Make your bed every morning',
      points: 5,
      assignedTo: ['k1', 'k2'],
      recurrence: { type: 'daily' }
    },
    {
      id: 'c2',
      title: 'Feed the Fish',
      description: 'Feed the fish in the tank',
      points: 3,
      assignedTo: ['k1'],
      recurrence: { type: 'daily' }
    },
    {
      id: 'c3',
      title: 'Trash Out',
      description: 'Take out the trash',
      points: 10,
      assignedTo: ['k2'],
      recurrence: { type: 'weekly', weekdays: [6] } // Saturday
    }
  ],
  rewards: [
    {
      id: 'r1',
      title: 'Extra 30m Screen Time',
      cost: 20,
      progress: { k1: 8, k2: 5 }
    },
    {
      id: 'r2',
      title: 'Ice Cream',
      cost: 15,
      progress: { k1: 2, k2: 0 }
    }
  ],
  transactions: [
    {
      id: 't1',
      userId: 'k1',
      delta: 10,
      reason: 'Initial points for Zoe',
      at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 't2',
      userId: 'k2',
      delta: 5,
      reason: 'Initial points for Max',
      at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  pendingCompletions: []
};
