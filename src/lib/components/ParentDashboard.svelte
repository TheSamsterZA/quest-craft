<script lang="ts">
  import {
    currentUser,
    users,
    chores,
    rewards,
    transactions,
    pendingCompletions,
    getUserKids,
    approvePendingCompletion,
    rejectPendingCompletion,
    addChore,
    updateChore,
    deleteChore,
    addReward,
    updateReward,
    deleteReward,
    reorderRewards,
    addTransaction,
    addUser,
    updateUser,
    deleteUser,
    exportData,
    importData,
    getChoreById,
    getUserById,
    getRewardById
  } from '$lib/stores';
  import { formatDateTime, EMOJI_AVATARS } from '$lib/utils';
  import Confetti from './Confetti.svelte';
  import type { User, Chore, Reward } from '$lib/models';

  let activeTab = 'approvals';
  let showChoreForm = false;
  let showRewardForm = false;
  let showUserForm = false;
  let showTransactionForm = false;
  let showRewardReorder = false;
  let confettiTrigger = false;
  let editingChore: Chore | null = null;
  let editingReward: Reward | null = null;
  let editingUser: User | null = null;

  // Form data
  let choreForm = { title: '', description: '', points: 5, assignedTo: [] as string[], recurrence: 'daily' };
  let rewardForm = { title: '', cost: 20 };
  let userForm = { name: '', role: 'kid' as 'parent' | 'kid', pin: '', avatar: '' };
  let transactionForm = { userId: '', delta: 0, reason: '' };
  let selectedKid = '';
  let selectedDateRange = '30'; // days

  $: parent = $currentUser as User;
  $: kids = getUserKids();
  $: allPending = $pendingCompletions.filter((pc) => !pc.approved);
  $: kidPoints = (kidId: string) =>
    $transactions.filter((t) => t.userId === kidId).reduce((sum, t) => sum + t.delta, 0);

  function approveCompletion(id: string) {
    approvePendingCompletion(id, parent.id);
    confettiTrigger = !confettiTrigger;
  }

  // Chore management
  function openChoreForm(chore?: Chore) {
    editingChore = chore || null;
    if (chore) {
      choreForm = {
        title: chore.title,
        description: chore.description || '',
        points: chore.points,
        assignedTo: [...chore.assignedTo],
        recurrence: chore.recurrence.type
      };
    } else {
      choreForm = { title: '', description: '', points: 5, assignedTo: [], recurrence: 'daily' };
    }
    showChoreForm = true;
  }

  function saveChore() {
    if (!choreForm.title || choreForm.assignedTo.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    const choreData = {
      title: choreForm.title,
      description: choreForm.description,
      points: choreForm.points,
      assignedTo: choreForm.assignedTo,
      recurrence:
        choreForm.recurrence === 'daily'
          ? { type: 'daily' as const }
          : { type: choreForm.recurrence as 'none' }
    };

    if (editingChore) {
      updateChore(editingChore.id, choreData);
    } else {
      addChore(choreData);
    }

    showChoreForm = false;
    editingChore = null;
  }

  // Reward management
  function openRewardForm(reward?: Reward) {
    editingReward = reward || null;
    if (reward) {
      rewardForm = { title: reward.title, cost: reward.cost };
    } else {
      rewardForm = { title: '', cost: 20 };
    }
    showRewardForm = true;
  }

  function saveReward() {
    if (!rewardForm.title || rewardForm.cost <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    const rewardData = {
      title: rewardForm.title,
      cost: rewardForm.cost,
      progress: editingReward?.progress || {}
    };

    if (editingReward) {
      updateReward(editingReward.id, rewardData);
    } else {
      addReward(rewardData);
    }

    showRewardForm = false;
    editingReward = null;
  }

  // User management
  function openUserForm(user?: User) {
    editingUser = user || null;
    if (user) {
      userForm = {
        name: user.name,
        role: user.role,
        pin: user.pin,
        avatar: user.avatar || ''
      };
    } else {
      userForm = { name: '', role: 'kid', pin: '', avatar: EMOJI_AVATARS[0] };
    }
    showUserForm = true;
  }

  function saveUser() {
    if (!userForm.name || !userForm.pin || userForm.pin.length !== 4) {
      alert('Please fill in all fields with a valid 4-digit PIN');
      return;
    }

    if (editingUser) {
      // Only allow changing own PIN if parent
      if (editingUser.role === 'parent' && editingUser.id !== parent.id) {
        alert("You can't change another parent's PIN");
        return;
      }
      updateUser(editingUser.id, {
        name: userForm.name,
        pin: userForm.pin,
        avatar: userForm.avatar
      });
    } else {
      addUser({
        name: userForm.name,
        role: userForm.role,
        pin: userForm.pin,
        avatar: userForm.avatar
      });
    }

    showUserForm = false;
    editingUser = null;
  }

  // Transaction management
  function addManualTransaction() {
    if (!selectedKid || !transactionForm.reason || transactionForm.delta === 0) {
      alert('Please fill in all fields');
      return;
    }

    addTransaction({
      userId: selectedKid,
      delta: transactionForm.delta,
      reason: transactionForm.reason,
      at: new Date().toISOString()
    });

    transactionForm = { userId: '', delta: 0, reason: '' };
    alert('Transaction added');
  }

  // Export/Import
  function handleExport() {
    const data = exportData();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `quest-craft-backup-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        importData(jsonString);
        alert('Data imported successfully');
      } catch (err) {
        alert('Failed to import data');
      }
    };
    reader.readAsText(file);
  }

  function logout() {
    currentUser.set(null);
  }

  function toggleKidAssignment(kidId: string) {
    if (choreForm.assignedTo.includes(kidId)) {
      choreForm.assignedTo = choreForm.assignedTo.filter((id) => id !== kidId);
    } else {
      choreForm.assignedTo = [...choreForm.assignedTo, kidId];
    }
  }

  function moveRewardUp(index: number) {
    if (index > 0) {
      const newRewards = [...$rewards];
      [newRewards[index], newRewards[index - 1]] = [newRewards[index - 1], newRewards[index]];
      reorderRewards(newRewards);
    }
  }

  function moveRewardDown(index: number) {
    if (index < $rewards.length - 1) {
      const newRewards = [...$rewards];
      [newRewards[index], newRewards[index + 1]] = [newRewards[index + 1], newRewards[index]];
      reorderRewards(newRewards);
    }
  }
</script>

<Confetti trigger={confettiTrigger} />

<div class="parent-dashboard">
  <div class="header">
    <div class="user-info">
      <div class="avatar">{parent.avatar || '👤'}</div>
      <div>
        <h1>{parent.name}</h1>
        <p class="subtitle">Parent Dashboard</p>
      </div>
    </div>
    <button class="logout-btn" on:click={logout}>Logout</button>
  </div>

  <div class="tabs">
    {#each ['approvals', 'chores', 'rewards', 'users', 'transactions', 'backup'] as tab}
      <button class="tab {activeTab === tab ? 'active' : ''}" on:click={() => (activeTab = tab)}>
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    {/each}
  </div>

  <div class="content">
    {#if activeTab === 'approvals'}
      <h2>📋 Pending Approvals</h2>
      {#if allPending.length === 0}
        <p class="empty">No pending approvals</p>
      {:else}
        <div class="approvals-list">
          {#each allPending as pending (pending.id)}
            {@const chore = getChoreById(pending.choreId)}
            {@const kid = getUserById(pending.byUserId)}
            {#if chore && kid}
              <div class="approval-card">
                <div class="approval-header">
                  <div>
                    <h3>{chore.title}</h3>
                    <p class="kid-name">by {kid.name}</p>
                  </div>
                  <div class="points-badge">{chore.points} pts</div>
                </div>
                <p class="time">{formatDateTime(pending.at)}</p>
                <div class="actions">
                  <button class="approve-btn" on:click={() => approveCompletion(pending.id)}>
                    ✓ Approve
                  </button>
                  <button class="reject-btn" on:click={() => rejectPendingCompletion(pending.id)}>
                    ✗ Reject
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    {:else if activeTab === 'chores'}
      <h2>📝 Manage Chores</h2>
      <button class="add-btn" on:click={() => openChoreForm()}>+ Add Chore</button>

      {#if showChoreForm}
        <div class="form-container">
          <h3>{editingChore ? 'Edit' : 'New'} Chore</h3>
          <input type="text" placeholder="Chore title" bind:value={choreForm.title} />
          <textarea placeholder="Description (optional)" bind:value={choreForm.description}></textarea>
          <input type="number" placeholder="Points" bind:value={choreForm.points} />

          <fieldset class="kid-selection">
            <legend>Assign to:</legend>
            {#each kids as kid}
              <label class="checkbox">
                <input
                  type="checkbox"
                  checked={choreForm.assignedTo.includes(kid.id)}
                  on:change={() => toggleKidAssignment(kid.id)}
                />
                {kid.avatar} {kid.name}
              </label>
            {/each}
          </fieldset>

          <select bind:value={choreForm.recurrence}>
            <option value="none">No Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>

          <div class="form-actions">
            <button class="save-btn" on:click={saveChore}>Save</button>
            <button class="cancel-btn" on:click={() => (showChoreForm = false)}>Cancel</button>
          </div>
        </div>
      {/if}

      <div class="chores-list">
        {#each $chores as chore (chore.id)}
          <div class="chore-item">
            <div>
              <h4>{chore.title}</h4>
              <p>{chore.points} points - Assigned to: {chore.assignedTo.map((id) => getUserById(id)?.name).join(', ')}</p>
            </div>
            <div class="item-actions">
              <button class="edit-btn" on:click={() => openChoreForm(chore)}>Edit</button>
              <button class="delete-btn" on:click={() => deleteChore(chore.id)}>Delete</button>
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'rewards'}
      <h2>🎁 Manage Rewards</h2>
      <button class="add-btn" on:click={() => openRewardForm()}>+ Add Reward</button>
      <button class="reorder-btn" on:click={() => (showRewardReorder = !showRewardReorder)}>
        {showRewardReorder ? 'Done Reordering' : 'Reorder Rewards'}
      </button>

      {#if showRewardForm}
        <div class="form-container">
          <h3>{editingReward ? 'Edit' : 'New'} Reward</h3>
          <input type="text" placeholder="Reward title" bind:value={rewardForm.title} />
          <input type="number" placeholder="Cost (points)" bind:value={rewardForm.cost} />
          <div class="form-actions">
            <button class="save-btn" on:click={saveReward}>Save</button>
            <button class="cancel-btn" on:click={() => (showRewardForm = false)}>Cancel</button>
          </div>
        </div>
      {/if}

      <div class="rewards-list">
        {#each $rewards as reward, index (reward.id)}
          <div class="reward-item">
            <div>
              <h4>{reward.title}</h4>
              <p>Cost: {reward.cost} points</p>
              <div class="reward-progress">
                {#each kids as kid}
                  {@const progress = reward.progress[kid.id] || 0}
                  <small>{kid.name}: {progress}/{reward.cost}</small>
                {/each}
              </div>
            </div>
            <div class="item-actions">
              {#if showRewardReorder}
                <button class="move-btn" on:click={() => moveRewardUp(index)} disabled={index === 0}>
                  ↑
                </button>
                <button class="move-btn" on:click={() => moveRewardDown(index)} disabled={index === $rewards.length - 1}>
                  ↓
                </button>
              {:else}
                <button class="edit-btn" on:click={() => openRewardForm(reward)}>Edit</button>
                <button class="delete-btn" on:click={() => deleteReward(reward.id)}>Delete</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'users'}
      <h2>👥 Manage Users</h2>
      <button class="add-btn" on:click={() => openUserForm()}>+ Add User</button>

      {#if showUserForm}
        <div class="form-container">
          <h3>{editingUser ? 'Edit' : 'New'} User</h3>
          <input type="text" placeholder="Name" bind:value={userForm.name} />
          <select bind:value={userForm.role} disabled={editingUser?.role === 'parent'}>
            <option value="parent">Parent</option>
            <option value="kid">Kid</option>
          </select>
          <input type="text" placeholder="4-digit PIN" bind:value={userForm.pin} maxlength="4" />
          <select bind:value={userForm.avatar}>
            {#each EMOJI_AVATARS as avatar}
              <option value={avatar}>{avatar} {avatar}</option>
            {/each}
          </select>
          <div class="form-actions">
            <button class="save-btn" on:click={saveUser}>Save</button>
            <button class="cancel-btn" on:click={() => (showUserForm = false)}>Cancel</button>
          </div>
        </div>
      {/if}

      <div class="users-list">
        {#each $users as user (user.id)}
          <div class="user-item">
            <div>
              <h4>{user.avatar} {user.name}</h4>
              <p>{user.role === 'parent' ? '👨‍👩‍👧‍👦 Parent' : '👧 Kid'}</p>
            </div>
            <div class="item-actions">
              <button class="edit-btn" on:click={() => openUserForm(user)}>Edit</button>
              {#if user.id !== parent.id}
                <button class="delete-btn" on:click={() => deleteUser(user.id)}>Delete</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'transactions'}
      <h2>💰 Transactions & Reports</h2>

      <div class="transaction-form">
        <h3>Add Manual Transaction</h3>
        <select bind:value={selectedKid}>
          <option value="">Select Kid</option>
          {#each kids as kid}
            <option value={kid.id}>{kid.avatar} {kid.name}</option>
          {/each}
        </select>
        <input type="number" placeholder="Points (+/-)" bind:value={transactionForm.delta} />
        <input type="text" placeholder="Reason" bind:value={transactionForm.reason} />
        <button class="save-btn" on:click={addManualTransaction}>Add Transaction</button>
      </div>

      <div class="reports-section">
        <h3>Kid Reports</h3>
        {#each kids as kid}
          {@const kidTotal = kidPoints(kid.id)}
          <div class="report-card">
            <h4>{kid.avatar} {kid.name}</h4>
            <p class="total-points">Total Points: {kidTotal}</p>
            <div class="transactions-mini">
              {#each $transactions.filter((t) => t.userId === kid.id) as t}
                <div class="transaction-row">
                  <span>{t.reason}</span>
                  <span class={t.delta > 0 ? 'positive' : 'negative'}>
                    {t.delta > 0 ? '+' : ''}{t.delta}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'backup'}
      <h2>💾 Backup & Restore</h2>
      <div class="backup-section">
        <p>Export your data as JSON for backup or import previously saved data.</p>
        <button class="export-btn" on:click={handleExport}>📥 Export Data</button>
        <label class="import-label">
          📤 Import Data
          <input type="file" accept=".json" on:change={handleImport} style="display: none;" />
        </label>
      </div>
    {/if}
  </div>
</div>

<style>
  .parent-dashboard {
    min-height: 100vh;
    background: #f5f5f5;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-info {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .avatar {
    font-size: 3em;
  }

  .user-info h1 {
    margin: 0;
    font-size: 1.8em;
  }

  .subtitle {
    margin: 5px 0 0 0;
    opacity: 0.9;
  }

  .logout-btn {
    padding: 10px 20px;
    background: #ff6b9d;
    border: none;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .tabs {
    display: flex;
    background: white;
    border-bottom: 2px solid #ddd;
    overflow-x: auto;
  }

  .tab {
    flex: 1;
    padding: 15px 20px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    color: #666;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
  }

  .tab:hover {
    color: #333;
  }

  .tab.active {
    color: #667eea;
    border-bottom-color: #667eea;
  }

  .content {
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .content h2 {
    margin-top: 0;
    color: #333;
  }

  .empty {
    text-align: center;
    color: #888;
    padding: 30px;
    background: white;
    border-radius: 8px;
  }

  .add-btn,
  .reorder-btn {
    padding: 10px 20px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 20px;
    margin-right: 10px;
  }

  .reorder-btn {
    background: #ff9800;
  }

  .form-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .form-container h3 {
    margin-top: 0;
  }

  .form-container input,
  .form-container textarea,
  .form-container select {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1em;
  }

  .kid-selection {
    margin-bottom: 15px;
  }

  .checkbox {
    display: block;
    margin-bottom: 10px;
  }

  .checkbox input {
    margin-right: 8px;
    width: auto;
  }

  .form-actions {
    display: flex;
    gap: 10px;
  }

  .save-btn {
    flex: 1;
    padding: 10px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
  }

  .cancel-btn {
    flex: 1;
    padding: 10px;
    background: #ccc;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .approvals-list {
    display: grid;
    gap: 15px;
  }

  .approval-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #ff9800;
  }

  .approval-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 10px;
  }

  .approval-card h3 {
    margin: 0;
    color: #333;
  }

  .kid-name {
    margin: 5px 0 0 0;
    color: #888;
  }

  .points-badge {
    background: #667eea;
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: bold;
  }

  .time {
    margin: 5px 0 15px 0;
    color: #888;
    font-size: 0.9em;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .approve-btn,
  .reject-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
  }

  .approve-btn {
    background: #4caf50;
    color: white;
  }

  .reject-btn {
    background: #f44336;
    color: white;
  }

  .chores-list,
  .users-list {
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }

  .chore-item,
  .user-item,
  .reward-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chore-item h4,
  .user-item h4,
  .reward-item h4 {
    margin: 0 0 5px 0;
  }

  .chore-item p,
  .user-item p {
    margin: 0;
    color: #888;
    font-size: 0.9em;
  }

  .reward-progress {
    display: flex;
    gap: 15px;
    margin-top: 8px;
    font-size: 0.85em;
  }

  .reward-progress small {
    color: #666;
  }

  .item-actions {
    display: flex;
    gap: 10px;
  }

  .edit-btn,
  .delete-btn,
  .move-btn {
    padding: 5px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 600;
  }

  .edit-btn {
    background: #667eea;
    color: white;
  }

  .delete-btn {
    background: #f44336;
    color: white;
  }

  .move-btn {
    background: #ff9800;
    color: white;
    padding: 5px 10px;
  }

  .move-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .transaction-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .transaction-form h3 {
    margin-top: 0;
  }

  .transaction-form select,
  .transaction-form input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .reports-section {
    margin-top: 30px;
  }

  .report-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .report-card h4 {
    margin-top: 0;
  }

  .total-points {
    font-size: 1.3em;
    font-weight: bold;
    color: #667eea;
    margin: 10px 0;
  }

  .transactions-mini {
    max-height: 200px;
    overflow-y: auto;
  }

  .transaction-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.9em;
  }

  .positive {
    color: #4caf50;
    font-weight: bold;
  }

  .negative {
    color: #f44336;
    font-weight: bold;
  }

  .backup-section {
    background: white;
    padding: 30px;
    border-radius: 8px;
  }

  .export-btn,
  .import-label {
    display: inline-block;
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-right: 10px;
    font-size: 1em;
  }

  .import-label {
    background: #4caf50;
  }

  @media (max-width: 768px) {
    .content {
      padding: 15px;
    }

    .header {
      flex-direction: column;
      gap: 15px;
    }

    .approval-header {
      flex-direction: column;
      gap: 10px;
    }

    .chore-item,
    .user-item,
    .reward-item {
      flex-direction: column;
      gap: 10px;
    }

    .item-actions {
      width: 100%;
    }

    .item-actions button {
      flex: 1;
    }
  }
</style>
