import { writable, derived, get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import type { User, Chore, Reward, Transaction, PendingCompletion, AppState } from './models';
import { SAMPLE_DATA } from './sample-data';

const STORAGE_KEYS = {
  users: 'qc_users_v1',
  chores: 'qc_chores_v1',
  rewards: 'qc_rewards_v1',
  transactions: 'qc_transactions_v1',
  pendingCompletions: 'qc_pending_v1'
};

// Check if we're in a browser environment
const browser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Helper to load from localStorage or return default
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (!browser) return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
    return defaultValue;
  }
}

// Helper to save to localStorage
function saveToStorage(key: string, value: unknown): void {
  if (!browser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// Initialize stores
export const users = writable<User[]>(loadFromStorage(STORAGE_KEYS.users, SAMPLE_DATA.users));
export const chores = writable<Chore[]>(loadFromStorage(STORAGE_KEYS.chores, SAMPLE_DATA.chores));
export const rewards = writable<Reward[]>(loadFromStorage(STORAGE_KEYS.rewards, SAMPLE_DATA.rewards));
export const transactions = writable<Transaction[]>(loadFromStorage(STORAGE_KEYS.transactions, SAMPLE_DATA.transactions));
export const pendingCompletions = writable<PendingCompletion[]>(
  loadFromStorage(STORAGE_KEYS.pendingCompletions, SAMPLE_DATA.pendingCompletions)
);

// Subscribe to changes and persist to localStorage
users.subscribe((value) => saveToStorage(STORAGE_KEYS.users, value));
chores.subscribe((value) => saveToStorage(STORAGE_KEYS.chores, value));
rewards.subscribe((value) => saveToStorage(STORAGE_KEYS.rewards, value));
transactions.subscribe((value) => saveToStorage(STORAGE_KEYS.transactions, value));
pendingCompletions.subscribe((value) => saveToStorage(STORAGE_KEYS.pendingCompletions, value));

// Current user
export const currentUser = writable<User | null>(null);

// Derived stores
export const currentUserPoints = derived([currentUser, transactions], ([$currentUser, $transactions]) => {
  if (!$currentUser) return 0;
  return $transactions
    .filter((t) => t.userId === $currentUser.id)
    .reduce((sum, t) => sum + t.delta, 0);
});

// Helper functions
export function getUserById(id: string): User | undefined {
  return get(users).find((u) => u.id === id);
}

export function getChoreById(id: string): Chore | undefined {
  return get(chores).find((c) => c.id === id);
}

export function getRewardById(id: string): Reward | undefined {
  return get(rewards).find((r) => r.id === id);
}

export function getAssignedChores(userId: string): Chore[] {
  return get(chores).filter((c) => c.assignedTo.includes(userId));
}

export function getUserKids(): User[] {
  return get(users).filter((u) => u.role === 'kid');
}

export function getUserParents(): User[] {
  return get(users).filter((u) => u.role === 'parent');
}

export function getPendingApprovalsForKid(kidId: string): PendingCompletion[] {
  return get(pendingCompletions).filter((pc) => pc.byUserId === kidId && !pc.approved);
}

export function getAllPendingApprovals(): PendingCompletion[] {
  return get(pendingCompletions).filter((pc) => !pc.approved);
}

// Actions
export function addUser(user: Omit<User, 'id'>): User {
  const newUser: User = { ...user, id: uuidv4() };
  users.update((u) => [...u, newUser]);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): void {
  users.update((u) =>
    u.map((user) => (user.id === id ? { ...user, ...updates } : user))
  );
}

export function deleteUser(id: string): void {
  users.update((u) => u.filter((user) => user.id !== id));
}

export function addChore(chore: Omit<Chore, 'id'>): Chore {
  const newChore: Chore = { ...chore, id: uuidv4() };
  chores.update((c) => [...c, newChore]);
  return newChore;
}

export function updateChore(id: string, updates: Partial<Chore>): void {
  chores.update((c) =>
    c.map((chore) => (chore.id === id ? { ...chore, ...updates } : chore))
  );
}

export function deleteChore(id: string): void {
  chores.update((c) => c.filter((chore) => chore.id !== id));
}

export function addReward(reward: Omit<Reward, 'id'>): Reward {
  const newReward: Reward = { ...reward, id: uuidv4() };
  rewards.update((r) => [...r, newReward]);
  return newReward;
}

export function updateReward(id: string, updates: Partial<Reward>): void {
  rewards.update((r) =>
    r.map((reward) => (reward.id === id ? { ...reward, ...updates } : reward))
  );
}

export function deleteReward(id: string): void {
  rewards.update((r) => r.filter((reward) => reward.id !== id));
}

export function reorderRewards(newOrder: Reward[]): void {
  rewards.set(newOrder);
}

export function addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
  const newTransaction: Transaction = { ...transaction, id: uuidv4() };
  transactions.update((t) => [...t, newTransaction]);
  return newTransaction;
}

export function createPendingCompletion(choreId: string, byUserId: string): PendingCompletion {
  const chore = getChoreById(choreId);
  if (!chore) throw new Error('Chore not found');

  const newPending: PendingCompletion = {
    id: uuidv4(),
    choreId,
    byUserId,
    at: new Date().toISOString()
  };

  pendingCompletions.update((pc) => [...pc, newPending]);
  return newPending;
}

export function approvePendingCompletion(id: string, approvedBy: string): void {
  const pending = get(pendingCompletions).find((pc) => pc.id === id);
  if (!pending) throw new Error('Pending completion not found');

  const chore = getChoreById(pending.choreId);
  if (!chore) throw new Error('Chore not found');

  const user = getUserById(pending.byUserId);
  if (!user) throw new Error('User not found');

  // Create transaction
  addTransaction({
    userId: pending.byUserId,
    delta: chore.points,
    reason: `Chore completed: ${chore.title}`,
    at: new Date().toISOString()
  });

  // Update pending completion
  pendingCompletions.update((pc) =>
    pc.map((p) =>
      p.id === id
        ? { ...p, approved: true, approvedBy, approvedAt: new Date().toISOString() }
        : p
    )
  );

  // Auto-apply points to rewards (first-to-last priority)
  const currentRewards = get(rewards);
  let remainingPoints = chore.points;

  currentRewards.forEach((reward) => {
    if (remainingPoints <= 0) return;

    const currentProgress = reward.progress[pending.byUserId] || 0;
    const pointsNeeded = reward.cost - currentProgress;
    const pointsToApply = Math.min(remainingPoints, pointsNeeded);

    remainingPoints -= pointsToApply;
    updateReward(reward.id, {
      progress: {
        ...reward.progress,
        [pending.byUserId]: currentProgress + pointsToApply
      }
    });
  });
}

export function rejectPendingCompletion(id: string): void {
  pendingCompletions.update((pc) => pc.filter((p) => p.id !== id));
}

export function redeemReward(rewardId: string, userId: string): void {
  const reward = getRewardById(rewardId);
  if (!reward) throw new Error('Reward not found');

  const currentProgress = reward.progress[userId] || 0;
  if (currentProgress < reward.cost) {
    throw new Error('Not enough points for this reward');
  }

  // Deduct points from reward progress
  updateReward(rewardId, {
    progress: {
      ...reward.progress,
      [userId]: currentProgress - reward.cost
    }
  });

  // Log transaction
  addTransaction({
    userId,
    delta: -reward.cost,
    reason: `Reward redeemed: ${reward.title}`,
    at: new Date().toISOString()
  });
}

export function exportData(): string {
  return JSON.stringify(
    {
      users: get(users),
      chores: get(chores),
      rewards: get(rewards),
      transactions: get(transactions),
      pendingCompletions: get(pendingCompletions)
    },
    null,
    2
  );
}

export function importData(jsonString: string): void {
  try {
    const data: AppState = JSON.parse(jsonString);
    if (data.users) users.set(data.users);
    if (data.chores) chores.set(data.chores);
    if (data.rewards) rewards.set(data.rewards);
    if (data.transactions) transactions.set(data.transactions);
    if (data.pendingCompletions) pendingCompletions.set(data.pendingCompletions);
  } catch (e) {
    console.error('Failed to import data:', e);
    throw new Error('Invalid JSON format');
  }
}

export function resetToSampleData(): void {
  users.set(SAMPLE_DATA.users);
  chores.set(SAMPLE_DATA.chores);
  rewards.set(SAMPLE_DATA.rewards);
  transactions.set(SAMPLE_DATA.transactions);
  pendingCompletions.set(SAMPLE_DATA.pendingCompletions);
}
