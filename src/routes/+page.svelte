<script lang="ts">
  import { currentUser } from '$lib/stores';
  import Login from '$lib/components/Login.svelte';
  import ParentDashboard from '$lib/components/ParentDashboard.svelte';
  import KidDashboard from '$lib/components/KidDashboard.svelte';
</script>

{#if !$currentUser}
  <Login />
{:else if $currentUser.role === 'parent'}
  <ParentDashboard />
{:else}
  <KidDashboard />
{/if}

<style global>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
      'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
</style>
