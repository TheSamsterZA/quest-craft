<script lang="ts">
  import { currentUser, getAssignedChores, getPendingApprovalsForKid, rewards, transactions, updateUser, createPendingCompletion } from '$lib/stores';
  import { getProgressPercentage, EMOJI_AVATARS } from '$lib/utils';
  import Confetti from './Confetti.svelte';
  import type { User } from '$lib/models';

  let showAvatarPicker = false;
  let showRewardRequests = false;
  let confettiTrigger = false;

  $: kid = $currentUser as User;
  $: assignedChores = getAssignedChores(kid?.id || '');
  $: pendingForKid = getPendingApprovalsForKid(kid?.id || '');
  $: kidPoints = $transactions
    .filter((t) => t.userId === kid?.id)
    .reduce((sum, t) => sum + t.delta, 0);

  function markChoreComplete(choreId: string) {
    try {
      createPendingCompletion(choreId, kid.id);
    } catch (e) {
      console.error('Failed to mark chore complete:', e);
    }
  }

  function changeAvatar(avatar: string) {
    updateUser(kid.id, { avatar });
    showAvatarPicker = false;
  }

  function dismissCompletion(choreId: string) {
    // Remove from pending view by filtering locally
    // In a real app, this would mark as dismissed
  }

  function requestReward(rewardId: string) {
    confettiTrigger = !confettiTrigger;
    alert(`Reward requested! Parents will review your request.`);
  }

  function logout() {
    currentUser.set(null);
  }
</script>

<Confetti trigger={confettiTrigger} />

<div class="kid-dashboard">
  <div class="header">
    <div class="user-info">
      <button class="avatar-btn" on:click={() => (showAvatarPicker = !showAvatarPicker)}>
        {kid.avatar || '👤'}
      </button>
      <div class="user-details">
        <h1>{kid.name}</h1>
        <div class="points-display">
          <span class="points-label">Points:</span>
          <span class="points-value">{kidPoints} 🌟</span>
        </div>
      </div>
    </div>
    <button class="logout-btn" on:click={logout}>Logout</button>
  </div>

  {#if showAvatarPicker}
    <div class="modal-overlay" role="button" tabindex="0" on:click={() => (showAvatarPicker = false)} on:keydown={(e) => e.key === 'Escape' && (showAvatarPicker = false)}>
      <div class="modal" role="dialog" on:click={(e) => e.stopPropagation()}>
        <h2>Choose your avatar</h2>
        <div class="avatar-grid">
          {#each EMOJI_AVATARS as avatar}
            <button
              class="avatar-option {kid.avatar === avatar ? 'selected' : ''}"
              on:click={() => changeAvatar(avatar)}
            >
              {avatar}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <div class="section chores-section">
    <h2>📝 My Chores</h2>
    {#if assignedChores.length === 0}
      <p class="empty-message">No chores assigned yet!</p>
    {:else}
      <div class="chores-list">
        {#each assignedChores as chore (chore.id)}
          {@const isPending = pendingForKid.some((p) => p.choreId === chore.id && !p.approved)}
          {@const isApproved = pendingForKid.some((p) => p.choreId === chore.id && p.approved)}
          <div class="chore-card {isPending ? 'pending' : ''} {isApproved ? 'approved' : ''}">
            <div class="chore-header">
              <h3>{chore.title}</h3>
              <div class="points-badge">{chore.points} pts</div>
            </div>
            {#if chore.description}
              <p class="chore-description">{chore.description}</p>
            {/if}

            {#if isApproved}
              <div class="status approved-status">✅ Approved!</div>
            {:else if isPending}
              <div class="status pending-status">⏳ Awaiting approval</div>
            {/if}

            {#if !isPending && !isApproved}
              <button class="done-btn" on:click={() => markChoreComplete(chore.id)}>✓ Mark Done</button>
            {:else if isApproved}
              <button class="dismiss-btn" on:click={() => dismissCompletion(chore.id)}>
                Dismiss
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="section rewards-section">
    <h2>🎁 Rewards</h2>
    {#if $rewards.length === 0}
      <p class="empty-message">No rewards available yet!</p>
    {:else}
      <div class="rewards-list">
        {#each $rewards as reward (reward.id)}
          {@const progress = reward.progress[kid.id] || 0}
          {@const isComplete = progress >= reward.cost}
          {@const percentage = getProgressPercentage(progress, reward.cost)}
          <div class="reward-card {isComplete ? 'complete' : ''}">
            <h3>{reward.title}</h3>
            <div class="reward-cost">{reward.cost} points</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {percentage}%"></div>
            </div>
            <div class="progress-text">{progress} / {reward.cost}</div>
            {#if isComplete}
              <button class="request-btn" on:click={() => requestReward(reward.id)}>
                🎉 Request Reward
              </button>
            {:else}
              <div class="locked-text">Earn {reward.cost - progress} more points</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .kid-dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .header {
    background: white;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .user-info {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .avatar-btn {
    font-size: 3.5em;
    border: none;
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;
    padding: 0;
  }

  .avatar-btn:hover {
    transform: scale(1.1);
  }

  .user-details h1 {
    margin: 0;
    color: #333;
    font-size: 1.8em;
  }

  .points-display {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .points-label {
    color: #888;
    font-weight: 600;
  }

  .points-value {
    font-size: 1.3em;
    font-weight: bold;
    color: #667eea;
  }

  .logout-btn {
    padding: 10px 20px;
    background: #ff6b9d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s ease;
  }

  .logout-btn:hover {
    background: #ff85b8;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: white;
    border-radius: 15px;
    padding: 30px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal h2 {
    margin-top: 0;
    color: #333;
    text-align: center;
  }

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .avatar-option {
    font-size: 2.5em;
    border: 3px solid #ddd;
    background: white;
    border-radius: 10px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .avatar-option:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }

  .avatar-option.selected {
    border-color: #4caf50;
    background: #e8f5e9;
  }

  .section {
    margin-bottom: 30px;
  }

  .section h2 {
    color: white;
    font-size: 1.8em;
    margin: 0 0 20px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .empty-message {
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    color: #888;
    font-size: 1.1em;
  }

  .chores-section,
  .rewards-section {
    margin-bottom: 30px;
  }

  .chores-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .chore-card {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .chore-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .chore-card.pending {
    border-left: 5px solid #ff9800;
    background: #fff8e1;
  }

  .chore-card.approved {
    border-left: 5px solid #4caf50;
    background: #e8f5e9;
  }

  .chore-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 10px;
  }

  .chore-card h3 {
    margin: 0;
    color: #333;
    font-size: 1.3em;
  }

  .points-badge {
    background: #667eea;
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9em;
  }

  .chore-description {
    color: #666;
    margin: 10px 0;
    font-size: 0.95em;
  }

  .status {
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    margin: 15px 0;
    font-weight: 600;
    font-size: 1.05em;
  }

  .pending-status {
    background: #fff3cd;
    color: #856404;
  }

  .approved-status {
    background: #d4edda;
    color: #155724;
  }

  .done-btn,
  .dismiss-btn,
  .request-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1em;
    transition: all 0.2s ease;
  }

  .done-btn {
    background: #4caf50;
    color: white;
  }

  .done-btn:hover {
    background: #45a049;
    transform: scale(1.02);
  }

  .dismiss-btn {
    background: #9e9e9e;
    color: white;
  }

  .dismiss-btn:hover {
    background: #757575;
  }

  .rewards-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .reward-card {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: all 0.3s ease;
  }

  .reward-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .reward-card.complete {
    border: 3px solid #ffd700;
    background: #fffde7;
  }

  .reward-card h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.2em;
  }

  .reward-cost {
    color: #888;
    font-size: 1em;
    margin-bottom: 15px;
  }

  .progress-bar {
    background: #e0e0e0;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  .progress-text {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 15px;
  }

  .request-btn {
    width: 100%;
    background: #ffd700;
    color: #333;
    font-weight: 700;
  }

  .request-btn:hover {
    background: #ffed4e;
    transform: scale(1.02);
  }

  .locked-text {
    color: #999;
    font-size: 0.9em;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .kid-dashboard {
      padding: 15px;
    }

    .header {
      flex-direction: column;
      gap: 15px;
    }

    .user-info {
      width: 100%;
    }

    .avatar-btn {
      font-size: 2.5em;
    }

    .chores-list,
    .rewards-list {
      grid-template-columns: 1fr;
    }
  }
</style>
