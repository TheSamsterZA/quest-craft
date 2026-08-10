<script lang="ts">
  import { users, currentUser } from '$lib/stores';
  import { validatePIN } from '$lib/utils';
  import type { User } from '$lib/models';

  let selectedUser: User | null = null;
  let pinInput = '';
  let errorMessage = '';

  function selectUser(user: User) {
    selectedUser = user;
    pinInput = '';
    errorMessage = '';
  }

  function addDigit(digit: string) {
    if (pinInput.length < 4) {
      pinInput += digit;
    }
  }

  function removeLast() {
    pinInput = pinInput.slice(0, -1);
  }

  function submit() {
    if (!selectedUser) return;

    if (!validatePIN(pinInput)) {
      errorMessage = 'PIN must be 4 digits';
      return;
    }

    if (pinInput !== selectedUser.pin) {
      errorMessage = 'Incorrect PIN';
      pinInput = '';
      return;
    }

    currentUser.set(selectedUser);
  }

  function quickDemo(user: User) {
    currentUser.set(user);
  }

  function goBack() {
    selectedUser = null;
    pinInput = '';
    errorMessage = '';
  }
</script>

<div class="login-container">
  <div class="login-box">
    <h1>🎮 QuestCraft</h1>
    <p class="subtitle">Complete your chores, earn points, get rewards!</p>

    {#if !selectedUser}
      <div class="account-selection">
        <p class="instruction">Select your account:</p>
        <div class="accounts-grid">
          {#each $users as user (user.id)}
            <button class="account-card" on:click={() => selectUser(user)}>
              <div class="avatar">{user.avatar || '👤'}</div>
              <div class="name">{user.name}</div>
              <div class="role">{user.role === 'parent' ? '👨‍👩‍👧‍👦 Parent' : '👧 Kid'}</div>
            </button>
          {/each}
        </div>

        <div class="demo-section">
          <p class="demo-label">Quick demo login:</p>
          <div class="demo-buttons">
            {#each $users as user (user.id)}
              <button
                class="demo-btn demo-btn-{user.role}"
                on:click={() => quickDemo(user)}
                title="{user.name} ({user.pin})"
              >
                {user.avatar || '👤'} {user.name}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {:else}
      <div class="pin-entry">
        <button class="back-btn" on:click={goBack}>← Back</button>
        <div class="user-selected">
          <div class="avatar-large">{selectedUser.avatar || '👤'}</div>
          <h2>{selectedUser.name}</h2>
        </div>

        <label for="pin-input">Enter your 4-digit PIN:</label>
        <div class="pin-display" id="pin-input">
          {#each [0, 1, 2, 3] as i}
            <div class="pin-digit">{pinInput[i] || ''}</div>
          {/each}
        </div>

        {#if errorMessage}
          <div class="error-message">{errorMessage}</div>
        {/if}

        <div class="numpad">
          {#each [[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]] as row}
            <div class="numpad-row">
              {#each row as digit}
                <button
                  class="numpad-btn"
                  on:click={() => addDigit(digit.toString())}
                  disabled={pinInput.length >= 4}
                >
                  {digit}
                </button>
              {/each}
            </div>
          {/each}
        </div>

        <div class="actions">
          <button class="clear-btn" on:click={() => (pinInput = '')}>Clear</button>
          <button class="delete-btn" on:click={removeLast}>← Delete</button>
          <button class="submit-btn" disabled={pinInput.length !== 4} on:click={submit}>
            Login
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .login-box {
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
  }

  h1 {
    text-align: center;
    color: #333;
    font-size: 2.5em;
    margin: 0 0 10px 0;
  }

  .subtitle {
    text-align: center;
    color: #666;
    font-size: 1.1em;
    margin: 0 0 30px 0;
  }

  .instruction {
    text-align: center;
    color: #555;
    font-size: 1.1em;
    margin-bottom: 20px;
    font-weight: 600;
  }

  .accounts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 30px;
  }

  .account-card {
    background: #f5f5f5;
    border: 2px solid #ddd;
    border-radius: 15px;
    padding: 20px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s ease;
    text-align: center;
  }

  .account-card:hover {
    border-color: #667eea;
    background: #f0f4ff;
    transform: translateY(-3px);
  }

  .avatar {
    font-size: 3em;
    margin-bottom: 10px;
  }

  .name {
    font-size: 1.1em;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }

  .role {
    font-size: 0.9em;
    color: #888;
  }

  .demo-section {
    border-top: 2px solid #eee;
    padding-top: 20px;
    margin-top: 20px;
  }

  .demo-label {
    text-align: center;
    color: #888;
    font-size: 0.95em;
    margin-bottom: 15px;
  }

  .demo-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .demo-btn {
    padding: 10px 15px;
    border: none;
    border-radius: 8px;
    font-size: 1em;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .demo-btn-parent {
    background: #ffd700;
    color: #333;
  }

  .demo-btn-parent:hover {
    background: #ffed4e;
    transform: translateX(3px);
  }

  .demo-btn-kid {
    background: #ff6b9d;
    color: white;
  }

  .demo-btn-kid:hover {
    background: #ff85b8;
    transform: translateX(3px);
  }

  .pin-entry {
    text-align: center;
  }

  .back-btn {
    background: #ccc;
    border: none;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95em;
    margin-bottom: 20px;
    transition: background 0.2s ease;
  }

  .back-btn:hover {
    background: #bbb;
  }

  .user-selected {
    margin-bottom: 30px;
  }

  .avatar-large {
    font-size: 4em;
    margin-bottom: 15px;
  }

  .user-selected h2 {
    color: #333;
    margin: 0;
    font-size: 1.5em;
  }

  label {
    display: block;
    color: #555;
    font-weight: 600;
    margin-bottom: 15px;
    font-size: 1em;
  }

  .pin-display {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 30px;
  }

  .pin-digit {
    width: 50px;
    height: 50px;
    border: 2px solid #667eea;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    font-weight: bold;
    background: #f9f9f9;
    color: #667eea;
  }

  .error-message {
    background: #ffebee;
    color: #c62828;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.95em;
  }

  .numpad {
    margin-bottom: 20px;
  }

  .numpad-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 10px;
  }

  .numpad-row:last-child {
    grid-template-columns: 1fr;
  }

  .numpad-btn {
    padding: 20px;
    font-size: 1.3em;
    font-weight: bold;
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .numpad-btn:hover:not(:disabled) {
    background: #667eea;
    color: white;
    transform: scale(1.05);
  }

  .numpad-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }

  .clear-btn,
  .delete-btn {
    padding: 12px;
    border: 2px solid #ff6b9d;
    background: white;
    color: #ff6b9d;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .clear-btn:hover,
  .delete-btn:hover {
    background: #ff6b9d;
    color: white;
  }

  .submit-btn {
    padding: 12px;
    border: none;
    background: #4caf50;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1em;
    transition: all 0.2s ease;
    grid-column: span 3;
  }

  .submit-btn:hover:not(:disabled) {
    background: #45a049;
    transform: scale(1.02);
  }

  .submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .login-box {
      padding: 20px;
    }

    h1 {
      font-size: 2em;
    }

    .accounts-grid {
      grid-template-columns: 1fr;
    }

    .pin-display {
      gap: 8px;
    }

    .pin-digit {
      width: 45px;
      height: 45px;
    }

    .numpad-btn {
      padding: 15px;
      font-size: 1.1em;
    }
  }
</style>
