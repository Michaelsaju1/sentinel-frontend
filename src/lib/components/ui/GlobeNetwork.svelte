<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let {
		nodeCount = 40,
		rotationSpeed = 0.002,
		opacity = 1,
		class: className = ''
	}: {
		nodeCount?: number;
		rotationSpeed?: number;
		opacity?: number;
		class?: string;
	} = $props();

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;
		let angleY = 0;
		let w = 0;
		let h = 0;
		let radius = 0;

		// Generate nodes via Fibonacci sphere
		interface GlobeNode {
			phi: number;
			theta: number;
			active: boolean;
		}

		interface Arc {
			from: number;
			to: number;
			pulseT: number;
			pulseSpeed: number;
		}

		const nodes: GlobeNode[] = [];
		const goldenAngle = Math.PI * (3 - Math.sqrt(5));

		for (let i = 0; i < nodeCount; i++) {
			const y = 1 - (i / (nodeCount - 1)) * 2;
			const theta = goldenAngle * i;
			const phi = Math.asin(y);
			nodes.push({
				phi,
				theta,
				active: Math.random() < 0.25
			});
		}

		// Generate arcs between random node pairs
		const arcs: Arc[] = [];
		const arcCount = 15;
		const usedPairs = new Set<string>();
		for (let i = 0; i < arcCount; i++) {
			let a: number, b: number;
			let key: string;
			do {
				a = Math.floor(Math.random() * nodeCount);
				b = Math.floor(Math.random() * nodeCount);
				key = `${Math.min(a, b)}-${Math.max(a, b)}`;
			} while (a === b || usedPairs.has(key));
			usedPairs.add(key);
			arcs.push({ from: a, to: b, pulseT: Math.random(), pulseSpeed: 0.003 + Math.random() * 0.004 });
		}

		// Latitude/longitude line counts
		const latLines = 8;
		const lonLines = 12;

		function resize() {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			w = rect.width;
			h = rect.height;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			radius = Math.min(w, h) * 0.38;
		}

		// Project a 3D point (on unit sphere) to 2D
		function project(phi: number, theta: number): { x: number; y: number; z: number } {
			const cosP = Math.cos(phi);
			const sinP = Math.sin(phi);
			const cosT = Math.cos(theta + angleY);
			const sinT = Math.sin(theta + angleY);

			const x = cosP * sinT;
			const y = sinP;
			const z = cosP * cosT;

			return {
				x: w / 2 + x * radius,
				y: h / 2 - y * radius,
				z
			};
		}

		// Spherical linear interpolation
		function slerp(
			phi1: number,
			theta1: number,
			phi2: number,
			theta2: number,
			t: number
		): { phi: number; theta: number } {
			// Convert to cartesian
			const x1 = Math.cos(phi1) * Math.cos(theta1);
			const y1 = Math.sin(phi1);
			const z1 = Math.cos(phi1) * Math.sin(theta1);

			const x2 = Math.cos(phi2) * Math.cos(theta2);
			const y2 = Math.sin(phi2);
			const z2 = Math.cos(phi2) * Math.sin(theta2);

			let dot = x1 * x2 + y1 * y2 + z1 * z2;
			dot = Math.max(-1, Math.min(1, dot));

			const omega = Math.acos(dot);
			if (omega < 0.001) {
				return { phi: phi1, theta: theta1 };
			}

			const sinO = Math.sin(omega);
			const a = Math.sin((1 - t) * omega) / sinO;
			const b = Math.sin(t * omega) / sinO;

			const x = a * x1 + b * x2;
			const y = a * y1 + b * y2;
			const z = a * z1 + b * z2;

			const phi = Math.asin(Math.max(-1, Math.min(1, y)));
			const theta = Math.atan2(z, x);
			return { phi, theta };
		}

		function draw() {
			ctx!.clearRect(0, 0, w, h);
			angleY += rotationSpeed;

			// Draw latitude lines
			for (let i = 1; i < latLines; i++) {
				const phi = (Math.PI / latLines) * i - Math.PI / 2;
				ctx!.beginPath();
				let started = false;
				for (let j = 0; j <= 72; j++) {
					const theta = (Math.PI * 2 * j) / 72;
					const p = project(phi, theta);
					const alpha = (p.z * 0.5 + 0.5) * 0.25 * opacity;
					if (alpha < 0.02) {
						started = false;
						continue;
					}
					if (!started) {
						ctx!.stroke();
						ctx!.beginPath();
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineWidth = 0.5;
						ctx!.moveTo(p.x, p.y);
						started = true;
					} else {
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineTo(p.x, p.y);
					}
				}
				ctx!.stroke();
			}

			// Draw longitude lines
			for (let i = 0; i < lonLines; i++) {
				const theta = (Math.PI * 2 * i) / lonLines;
				ctx!.beginPath();
				let started = false;
				for (let j = 0; j <= 36; j++) {
					const phi = (Math.PI * j) / 36 - Math.PI / 2;
					const p = project(phi, theta);
					const alpha = (p.z * 0.5 + 0.5) * 0.25 * opacity;
					if (alpha < 0.02) {
						started = false;
						continue;
					}
					if (!started) {
						ctx!.stroke();
						ctx!.beginPath();
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineWidth = 0.5;
						ctx!.moveTo(p.x, p.y);
						started = true;
					} else {
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineTo(p.x, p.y);
					}
				}
				ctx!.stroke();
			}

			// Draw arcs
			for (const arc of arcs) {
				const nFrom = nodes[arc.from];
				const nTo = nodes[arc.to];
				const steps = 32;

				ctx!.beginPath();
				let started = false;
				for (let s = 0; s <= steps; s++) {
					const t = s / steps;
					const interp = slerp(nFrom.phi, nFrom.theta, nTo.phi, nTo.theta, t);
					const p = project(interp.phi, interp.theta);
					const alpha = Math.max(0, (p.z * 0.5 + 0.5) * 0.4 * opacity);
					if (alpha < 0.02) {
						started = false;
						continue;
					}
					if (!started) {
						ctx!.stroke();
						ctx!.beginPath();
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineWidth = 1;
						ctx!.moveTo(p.x, p.y);
						started = true;
					} else {
						ctx!.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
						ctx!.lineTo(p.x, p.y);
					}
				}
				ctx!.stroke();

				// Traveling pulse dot along arc
				arc.pulseT = (arc.pulseT + arc.pulseSpeed) % 1;
				const pulsePos = slerp(nFrom.phi, nFrom.theta, nTo.phi, nTo.theta, arc.pulseT);
				const pp = project(pulsePos.phi, pulsePos.theta);
				if (pp.z > 0) {
					const pulseAlpha = pp.z * 0.9 * opacity;
					ctx!.beginPath();
					ctx!.arc(pp.x, pp.y, 1.5, 0, Math.PI * 2);
					ctx!.fillStyle = `rgba(128, 223, 255, ${pulseAlpha})`;
					ctx!.shadowColor = 'rgba(0, 212, 255, 0.8)';
					ctx!.shadowBlur = 6;
					ctx!.fill();
					ctx!.shadowBlur = 0;
				}
			}

			// Draw nodes
			const time = Date.now() * 0.001;
			for (const node of nodes) {
				const p = project(node.phi, node.theta);
				if (p.z < -0.1) continue; // hide back-facing

				const depthAlpha = (p.z * 0.5 + 0.5) * opacity;
				const baseSize = node.active ? 2.5 : 1.5;
				const pulse = node.active ? Math.sin(time * 2 + node.phi * 3) * 0.5 + 0.5 : 0;
				const size = baseSize + pulse * 1.2;

				// Glow for active nodes
				if (node.active && p.z > 0.2) {
					ctx!.beginPath();
					ctx!.arc(p.x, p.y, size + 3, 0, Math.PI * 2);
					ctx!.fillStyle = `rgba(0, 212, 255, ${depthAlpha * 0.15})`;
					ctx!.fill();
				}

				ctx!.beginPath();
				ctx!.arc(p.x, p.y, size, 0, Math.PI * 2);
				const bright = node.active ? 0.9 : 0.5;
				ctx!.fillStyle = `rgba(0, 212, 255, ${depthAlpha * bright})`;
				ctx!.fill();
			}

			animationId = requestAnimationFrame(draw);
		}

		resize();
		draw();

		const ro = new ResizeObserver(() => resize());
		ro.observe(canvas);

		return () => {
			cancelAnimationFrame(animationId);
			ro.disconnect();
		};
	});
</script>

<canvas bind:this={canvas} class="h-full w-full {className}" aria-hidden="true"></canvas>
