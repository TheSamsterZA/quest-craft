<script lang="ts">
  import { onMount } from 'svelte';

  export let trigger = false;

  let canvas: HTMLCanvasElement;
  let animationId: number;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
  }> = [];

  const colors = ['#ff6b9d', '#667eea', '#ffd700', '#4caf50', '#ff9800', '#9c27b0'];

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function createConfetti() {
      const count = 50;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 5 + 5,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.01;
        p.x += p.vx;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx!.globalAlpha = p.life;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(p.x, p.y, 10, 10);
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    }

    createConfetti();
    animate();
  });

  $: if (trigger && particles.length === 0 && canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 5 + 5,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      function animate() {
        ctx!.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.y += p.vy;
          p.vy += 0.1;
          p.life -= 0.01;
          p.x += p.vx;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx!.globalAlpha = p.life;
          ctx!.fillStyle = p.color;
          ctx!.fillRect(p.x, p.y, 10, 10);
        }

        if (particles.length > 0) {
          animationId = requestAnimationFrame(animate);
        }
      }

      animate();
    }
  }
</script>

<canvas bind:this={canvas} width={window.innerWidth} height={window.innerHeight}></canvas>

<style>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 50;
  }
</style>
