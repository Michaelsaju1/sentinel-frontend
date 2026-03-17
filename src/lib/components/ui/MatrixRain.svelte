<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let { opacity = 0.15, speed = 1 }: { opacity?: number; speed?: number } = $props();

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;

		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
		const charArray = chars.split('');
		const fontSize = 14;
		let columns: number;
		let drops: number[];

		function init() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			columns = Math.floor(canvas.width / fontSize);
			drops = Array.from({ length: columns }, () => Math.random() * -100);
		}

		function draw() {
			ctx!.fillStyle = `rgba(4, 10, 18, 0.05)`;
			ctx!.fillRect(0, 0, canvas.width, canvas.height);
			ctx!.fillStyle = `rgba(0, 212, 255, ${opacity})`;
			ctx!.font = `${fontSize}px monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = charArray[Math.floor(Math.random() * charArray.length)];
				const x = i * fontSize;
				const y = drops[i] * fontSize;

				if (drops[i] > 0 && drops[i] < 3) {
					ctx!.fillStyle = `rgba(128, 223, 255, ${opacity * 2.5})`;
				} else {
					ctx!.fillStyle = `rgba(0, 212, 255, ${opacity})`;
				}

				ctx!.fillText(char, x, y);
				if (y > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i] += speed;
			}
			animationId = requestAnimationFrame(draw);
		}

		init();
		draw();
		window.addEventListener('resize', init);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', init);
		};
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 z-0" aria-hidden="true"
></canvas>
