<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let {
		class: className = ''
	}: {
		class?: string;
	} = $props();

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;
		let nodes: { x: number; y: number; vx: number; vy: number; size: number; pulse: number }[] = [];

		function init() {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;

			nodes = Array.from({ length: 20 }, () => ({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				size: Math.random() * 2 + 1,
				pulse: Math.random() * Math.PI * 2
			}));
		}

		function draw() {
			ctx!.clearRect(0, 0, canvas.width, canvas.height);
			const maxDist = 120;

			// Draw connections
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const dx = nodes[i].x - nodes[j].x;
					const dy = nodes[i].y - nodes[j].y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < maxDist) {
						const alpha = (1 - dist / maxDist) * 0.3;
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineWidth = 0.5;
						ctx!.beginPath();
						ctx!.moveTo(nodes[i].x, nodes[i].y);
						ctx!.lineTo(nodes[j].x, nodes[j].y);
						ctx!.stroke();
					}
				}
			}

			// Draw & update nodes
			for (const node of nodes) {
				node.pulse += 0.02;
				const glow = (Math.sin(node.pulse) + 1) / 2;

				ctx!.fillStyle = `rgba(0, 212, 255, ${0.4 + glow * 0.4})`;
				ctx!.shadowColor = '#00d4ff';
				ctx!.shadowBlur = glow * 8;
				ctx!.beginPath();
				ctx!.arc(node.x, node.y, node.size + glow, 0, Math.PI * 2);
				ctx!.fill();
				ctx!.shadowBlur = 0;

				node.x += node.vx;
				node.y += node.vy;

				if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
				if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
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

<canvas bind:this={canvas} class="h-full w-full {className}" aria-hidden="true"></canvas>
