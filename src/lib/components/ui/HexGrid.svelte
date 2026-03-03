<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let {
		opacity = 0.08,
		color = '#00d4ff',
		class: className = ''
	}: {
		opacity?: number;
		color?: string;
		class?: string;
	} = $props();

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		function draw() {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			const size = 30;
			const h = size * Math.sqrt(3);

			ctx!.strokeStyle = color;
			ctx!.globalAlpha = opacity;
			ctx!.lineWidth = 0.5;

			for (let row = -1; row < canvas.height / h + 1; row++) {
				for (let col = -1; col < canvas.width / (size * 1.5) + 1; col++) {
					const x = col * size * 1.5;
					const y = row * h + (col % 2 ? h / 2 : 0);
					drawHex(ctx!, x, y, size * 0.9);
				}
			}
		}

		function drawHex(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
			c.beginPath();
			for (let i = 0; i < 6; i++) {
				const angle = (Math.PI / 3) * i - Math.PI / 6;
				const px = x + r * Math.cos(angle);
				const py = y + r * Math.sin(angle);
				if (i === 0) c.moveTo(px, py);
				else c.lineTo(px, py);
			}
			c.closePath();
			c.stroke();
		}

		draw();
		window.addEventListener('resize', draw);
		return () => window.removeEventListener('resize', draw);
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none h-full w-full {className}" aria-hidden="true"></canvas>
