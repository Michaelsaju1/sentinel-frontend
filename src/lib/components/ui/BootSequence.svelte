<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		active: boolean;
		onComplete: () => void;
	}

	let { active, onComplete }: Props = $props();

	let phase = $state(0);
	let bootLineIndex = $state(0);
	let bootLineDots = $state<boolean[]>([]);
	let bootLineOk = $state<boolean[]>([]);
	let progressPercent = $state(0);
	let subsystemText = $state('');
	let hudVisible = $state(false);
	let radarScale = $state(0);
	let cornersVisible = $state(false);
	let allSystemsOnline = $state(false);
	let flashVisible = $state(false);
	let welcomeVisible = $state(false);
	let fadeOut = $state(false);
	let cursorVisible = $state(false);
	let titleLine1 = $state(false);
	let titleLine2 = $state(false);
	let mounted = $state(false);

	const bootLines = [
		'[BOOT] Loading kernel modules',
		'[BOOT] Initializing neural network',
		'[BOOT] Calibrating threat sensors',
		'[BOOT] Establishing secure channels',
		'[BOOT] Loading defense protocols',
		'[BOOT] Syncing intelligence database'
	];

	const subsystems = [
		'FIREWALL_CORE',
		'NEURAL_ENGINE',
		'THREAT_MATRIX',
		'CRYPTO_MODULE',
		'PACKET_INSPECTOR',
		'ANOMALY_DETECTOR',
		'IDS_SUBSYSTEM',
		'ENCRYPTION_AES256',
		'NETWORK_MONITOR',
		'RESPONSE_ENGINE',
		'LOG_AGGREGATOR',
		'DNS_RESOLVER',
		'AUTH_PROTOCOL',
		'CERT_VALIDATOR',
		'HEURISTIC_SCANNER',
		'PAYLOAD_ANALYZER',
		'TRAFFIC_SHAPER',
		'VPN_TUNNEL',
		'SANDBOX_ENV',
		'DEEP_INSPECT'
	];

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		if (!active || !mounted) return;

		// Reset everything
		phase = 0;
		bootLineIndex = 0;
		bootLineDots = Array(bootLines.length).fill(false);
		bootLineOk = Array(bootLines.length).fill(false);
		progressPercent = 0;
		subsystemText = '';
		hudVisible = false;
		radarScale = 0;
		cornersVisible = false;
		allSystemsOnline = false;
		flashVisible = false;
		welcomeVisible = false;
		fadeOut = false;
		cursorVisible = false;
		titleLine1 = false;
		titleLine2 = false;

		const timers: ReturnType<typeof setTimeout>[] = [];

		function delay(ms: number): Promise<void> {
			return new Promise((resolve) => {
				timers.push(setTimeout(resolve, ms));
			});
		}

		async function runSequence() {
			// ======== Phase 1: Title (0 - 1s) ========
			phase = 1;
			await delay(200);
			cursorVisible = true;
			await delay(400);
			titleLine1 = true;
			await delay(400);
			titleLine2 = true;
			await delay(300);

			// ======== Phase 2: Boot lines (1 - 3s) ========
			phase = 2;
			for (let i = 0; i < bootLines.length; i++) {
				bootLineIndex = i + 1;
				await delay(120);
				bootLineDots[i] = true;
				bootLineDots = [...bootLineDots];
				await delay(180);
				bootLineOk[i] = true;
				bootLineOk = [...bootLineOk];
				await delay(80);
			}
			await delay(200);

			// ======== Phase 3: Progress bar (3 - 5s) ========
			phase = 3;
			const progressDuration = 2000;
			const progressSteps = 60;
			const stepTime = progressDuration / progressSteps;

			for (let i = 0; i <= progressSteps; i++) {
				progressPercent = Math.round((i / progressSteps) * 100);
				subsystemText = subsystems[Math.floor(Math.random() * subsystems.length)];
				await delay(stepTime);
			}
			await delay(200);

			// ======== Phase 4: HUD elements (5 - 7s) ========
			phase = 4;
			hudVisible = true;
			await delay(300);
			radarScale = 1;
			await delay(400);
			cornersVisible = true;
			await delay(500);
			allSystemsOnline = true;
			await delay(800);

			// ======== Phase 5: Flash & farewell (7 - 8s) ========
			phase = 5;
			allSystemsOnline = false;
			await delay(100);
			flashVisible = true;
			await delay(150);
			flashVisible = false;
			await delay(200);
			welcomeVisible = true;
			await delay(1200);
			fadeOut = true;
			await delay(800);
			onComplete();
		}

		runSequence();

		return () => {
			timers.forEach(clearTimeout);
		};
	});

	function dotString(showDots: boolean): string {
		if (!showDots) return '';
		return '..........';
	}
</script>

{#if active}
	<div
		class="boot-overlay"
		class:fade-out={fadeOut}
	>
		<!-- Scanline effect -->
		<div class="boot-scanline"></div>

		<!-- Noise overlay -->
		<div class="boot-noise"></div>

		<!-- Phase 1: Title -->
		{#if phase >= 1}
			<div class="boot-center-content">
				{#if cursorVisible && phase < 3}
					<div class="boot-title-block">
						{#if titleLine1}
							<div class="boot-line title-line">
								<span class="boot-prompt">&gt;</span> SENTINEL DEFENSE SYSTEM
							</div>
						{/if}
						{#if titleLine2}
							<div class="boot-line title-line dim">
								<span class="boot-prompt">&gt;</span> INITIALIZING...
								<span class="boot-cursor">_</span>
							</div>
						{/if}
						{#if !titleLine1}
							<div class="boot-line">
								<span class="boot-cursor">_</span>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Phase 2: Boot lines -->
				{#if phase >= 2 && phase < 4}
					<div class="boot-lines-block">
						{#each bootLines as line, i (i)}
							{#if i < bootLineIndex}
								<div class="boot-check-line">
									<span class="boot-text">{line}</span>
									<span class="boot-dots">{dotString(bootLineDots[i] ?? false)}</span>
									{#if bootLineOk[i]}
										<span class="boot-ok">OK</span>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{/if}

				<!-- Phase 3: Progress bar -->
				{#if phase >= 3 && phase < 4}
					<div class="boot-progress-section">
						<div class="boot-progress-label">CORE SYSTEMS LOADING</div>
						<div class="boot-progress-container">
							<div class="boot-progress-bar" style="width: {progressPercent}%"></div>
						</div>
						<div class="boot-progress-info">
							<span class="boot-percent">{progressPercent}%</span>
							<span class="boot-subsystem">{subsystemText}</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Phase 4: HUD Elements -->
		{#if phase >= 4}
			<!-- Horizontal lines -->
			{#if hudVisible}
				<div class="hud-line hud-line-h hud-line-top"></div>
				<div class="hud-line hud-line-h hud-line-bottom"></div>
				<div class="hud-line hud-line-v hud-line-left"></div>
				<div class="hud-line hud-line-v hud-line-right"></div>

				<!-- Additional grid lines -->
				<div class="hud-line hud-line-h hud-line-mid1"></div>
				<div class="hud-line hud-line-h hud-line-mid2"></div>
				<div class="hud-line hud-line-v hud-line-mid3"></div>
				<div class="hud-line hud-line-v hud-line-mid4"></div>
			{/if}

			<!-- Radar circles -->
			<div class="hud-radar" style="transform: scale({radarScale})">
				<div class="hud-radar-ring ring-1"></div>
				<div class="hud-radar-ring ring-2"></div>
				<div class="hud-radar-ring ring-3"></div>
				<div class="hud-radar-dot"></div>
			</div>

			<!-- Corner brackets -->
			{#if cornersVisible}
				<div class="hud-corner hud-corner-tl"></div>
				<div class="hud-corner hud-corner-tr"></div>
				<div class="hud-corner hud-corner-bl"></div>
				<div class="hud-corner hud-corner-br"></div>
			{/if}

			<!-- All systems online -->
			{#if allSystemsOnline}
				<div class="hud-status-text">ALL SYSTEMS ONLINE</div>
			{/if}
		{/if}

		<!-- Phase 5: Flash & Welcome -->
		{#if flashVisible}
			<div class="boot-flash"></div>
		{/if}

		{#if welcomeVisible}
			<div class="boot-welcome">WELCOME, OPERATOR</div>
		{/if}

		<!-- Ambient corner data -->
		{#if phase >= 2 && phase < 5}
			<div class="boot-ambient-tl">
				<div class="ambient-text">SYS.KERNEL v3.1.7</div>
				<div class="ambient-text">MEM: 128GB DDR5</div>
				<div class="ambient-text">NET: 10Gbps ACTIVE</div>
			</div>
			<div class="boot-ambient-br">
				<div class="ambient-text">SENTINEL DEFENSE SYS</div>
				<div class="ambient-text">BUILD 2026.03.02</div>
				<div class="ambient-text">CLEARANCE: TS/SCI</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.boot-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		overflow: hidden;
		transition: opacity 0.8s ease-out;
	}

	.boot-overlay.fade-out {
		opacity: 0;
	}

	/* Scanline */
	.boot-scanline {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(0, 212, 255, 0.015) 2px,
			rgba(0, 212, 255, 0.015) 4px
		);
		pointer-events: none;
		z-index: 10;
	}

	/* Noise */
	.boot-noise {
		position: absolute;
		inset: 0;
		opacity: 0.03;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		pointer-events: none;
		z-index: 5;
	}

	/* Center content wrapper */
	.boot-center-content {
		position: relative;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		max-width: 700px;
		width: 100%;
		padding: 0 1.5rem;
	}

	/* Title block */
	.boot-title-block {
		text-align: left;
		width: 100%;
	}

	.boot-line {
		font-size: 0.875rem;
		color: #00d4ff;
		margin-bottom: 0.25rem;
		text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
		animation: boot-line-appear 0.3s ease-out;
	}

	.boot-line.title-line {
		font-size: 1.1rem;
		letter-spacing: 0.15em;
		font-weight: 600;
	}

	.boot-line.dim {
		color: #0099cc;
	}

	.boot-prompt {
		color: #00d4ff;
		margin-right: 0.5rem;
	}

	.boot-cursor {
		color: #00d4ff;
		animation: cursor-blink 0.6s step-end infinite;
	}

	/* Boot check lines */
	.boot-lines-block {
		width: 100%;
		text-align: left;
	}

	.boot-check-line {
		font-size: 0.75rem;
		color: #0099cc;
		margin-bottom: 0.2rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		animation: boot-line-appear 0.15s ease-out;
		white-space: nowrap;
		overflow: hidden;
	}

	.boot-text {
		flex-shrink: 0;
	}

	.boot-dots {
		color: #005577;
		letter-spacing: 0.15em;
		flex-shrink: 0;
	}

	.boot-ok {
		color: #00d4ff;
		font-weight: 700;
		text-shadow: 0 0 6px rgba(0, 212, 255, 0.8);
		animation: ok-flash 0.3s ease-out;
		flex-shrink: 0;
		margin-left: auto;
	}

	/* Progress section */
	.boot-progress-section {
		width: 100%;
		max-width: 500px;
		margin-top: 1rem;
		animation: boot-line-appear 0.4s ease-out;
	}

	.boot-progress-label {
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		color: #00d4ff;
		text-align: center;
		margin-bottom: 0.75rem;
		text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
		animation: pulse-glow 1.5s ease-in-out infinite;
	}

	.boot-progress-container {
		width: 100%;
		height: 4px;
		background: #0a1520;
		border: 1px solid #003355;
		position: relative;
		overflow: hidden;
	}

	.boot-progress-container::before {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			90deg,
			transparent,
			transparent 4px,
			rgba(0, 212, 255, 0.05) 4px,
			rgba(0, 212, 255, 0.05) 5px
		);
	}

	.boot-progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #003366, #00d4ff);
		box-shadow:
			0 0 10px rgba(0, 212, 255, 0.6),
			0 0 20px rgba(0, 212, 255, 0.3);
		transition: width 30ms linear;
		position: relative;
	}

	.boot-progress-bar::after {
		content: '';
		position: absolute;
		right: 0;
		top: -2px;
		bottom: -2px;
		width: 2px;
		background: #00d4ff;
		box-shadow: 0 0 8px #00d4ff;
	}

	.boot-progress-info {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
		font-size: 0.65rem;
	}

	.boot-percent {
		color: #00d4ff;
		font-weight: 600;
		text-shadow: 0 0 4px rgba(0, 212, 255, 0.5);
	}

	.boot-subsystem {
		color: #005577;
		letter-spacing: 0.1em;
		animation: subsystem-flicker 0.15s linear infinite;
	}

	/* HUD lines */
	.hud-line {
		position: absolute;
		background: rgba(0, 212, 255, 0.15);
		z-index: 15;
	}

	.hud-line-h {
		height: 1px;
		left: 0;
		right: 0;
		animation: hud-line-draw-h 0.6s ease-out forwards;
		transform: scaleX(0);
	}

	.hud-line-v {
		width: 1px;
		top: 0;
		bottom: 0;
		animation: hud-line-draw-v 0.6s ease-out forwards;
		transform: scaleY(0);
	}

	.hud-line-top { top: 25%; }
	.hud-line-bottom { bottom: 25%; }
	.hud-line-left { left: 20%; }
	.hud-line-right { right: 20%; }
	.hud-line-mid1 { top: 40%; animation-delay: 0.2s; }
	.hud-line-mid2 { bottom: 40%; animation-delay: 0.2s; }
	.hud-line-mid3 { left: 35%; animation-delay: 0.3s; }
	.hud-line-mid4 { right: 35%; animation-delay: 0.3s; }

	/* Radar */
	.hud-radar {
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		z-index: 16;
		transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hud-radar-ring {
		position: absolute;
		border: 1px solid rgba(0, 212, 255, 0.2);
		border-radius: 50%;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
	}

	.ring-1 {
		width: 120px;
		height: 120px;
		animation: radar-expand 0.8s ease-out 0.2s both;
	}

	.ring-2 {
		width: 240px;
		height: 240px;
		animation: radar-expand 0.8s ease-out 0.4s both;
	}

	.ring-3 {
		width: 360px;
		height: 360px;
		animation: radar-expand 0.8s ease-out 0.6s both;
	}

	.hud-radar-dot {
		position: absolute;
		width: 6px;
		height: 6px;
		background: #00d4ff;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		box-shadow: 0 0 12px #00d4ff, 0 0 24px rgba(0, 212, 255, 0.5);
	}

	/* Corner brackets */
	.hud-corner {
		position: absolute;
		width: 40px;
		height: 40px;
		border-color: rgba(0, 212, 255, 0.5);
		border-style: solid;
		border-width: 0;
		z-index: 17;
		animation: corner-appear 0.3s ease-out forwards;
		opacity: 0;
	}

	.hud-corner-tl {
		top: 5%;
		left: 5%;
		border-top-width: 2px;
		border-left-width: 2px;
	}

	.hud-corner-tr {
		top: 5%;
		right: 5%;
		border-top-width: 2px;
		border-right-width: 2px;
		animation-delay: 0.1s;
	}

	.hud-corner-bl {
		bottom: 5%;
		left: 5%;
		border-bottom-width: 2px;
		border-left-width: 2px;
		animation-delay: 0.2s;
	}

	.hud-corner-br {
		bottom: 5%;
		right: 5%;
		border-bottom-width: 2px;
		border-right-width: 2px;
		animation-delay: 0.3s;
	}

	/* Status text */
	.hud-status-text {
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		z-index: 25;
		font-size: 1.5rem;
		letter-spacing: 0.4em;
		color: #00d4ff;
		text-shadow:
			0 0 10px rgba(0, 212, 255, 0.8),
			0 0 20px rgba(0, 212, 255, 0.5),
			0 0 40px rgba(0, 212, 255, 0.3);
		animation: status-pulse 1.2s ease-in-out infinite;
		font-weight: 700;
	}

	/* Flash */
	.boot-flash {
		position: absolute;
		inset: 0;
		background: rgba(0, 212, 255, 0.3);
		z-index: 30;
		animation: flash-burst 0.15s ease-out forwards;
	}

	/* Welcome */
	.boot-welcome {
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		z-index: 25;
		font-size: 1.8rem;
		letter-spacing: 0.5em;
		color: #00d4ff;
		text-shadow:
			0 0 10px rgba(0, 212, 255, 0.8),
			0 0 30px rgba(0, 212, 255, 0.5);
		animation: welcome-fade 0.8s ease-out forwards;
		font-weight: 700;
	}

	/* Ambient data */
	.boot-ambient-tl {
		position: absolute;
		top: 8%;
		left: 8%;
		z-index: 12;
	}

	.boot-ambient-br {
		position: absolute;
		bottom: 8%;
		right: 8%;
		z-index: 12;
		text-align: right;
	}

	.ambient-text {
		font-size: 0.55rem;
		color: #003355;
		letter-spacing: 0.15em;
		line-height: 1.6;
	}

	/* ===== ANIMATIONS ===== */
	@keyframes cursor-blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	@keyframes boot-line-appear {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes ok-flash {
		0% {
			opacity: 0;
			text-shadow: 0 0 20px rgba(0, 212, 255, 1);
		}
		50% {
			opacity: 1;
			text-shadow: 0 0 20px rgba(0, 212, 255, 1);
		}
		100% {
			opacity: 1;
			text-shadow: 0 0 6px rgba(0, 212, 255, 0.8);
		}
	}

	@keyframes pulse-glow {
		0%, 100% {
			text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
		}
		50% {
			text-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.3);
		}
	}

	@keyframes subsystem-flicker {
		0% { opacity: 1; }
		50% { opacity: 0.5; }
		100% { opacity: 1; }
	}

	@keyframes hud-line-draw-h {
		to { transform: scaleX(1); }
	}

	@keyframes hud-line-draw-v {
		to { transform: scaleY(1); }
	}

	@keyframes radar-expand {
		from {
			transform: scale(0);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes corner-appear {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes status-pulse {
		0%, 100% {
			opacity: 1;
			text-shadow:
				0 0 10px rgba(0, 212, 255, 0.8),
				0 0 20px rgba(0, 212, 255, 0.5),
				0 0 40px rgba(0, 212, 255, 0.3);
		}
		50% {
			opacity: 0.7;
			text-shadow:
				0 0 20px rgba(0, 212, 255, 1),
				0 0 40px rgba(0, 212, 255, 0.7),
				0 0 60px rgba(0, 212, 255, 0.4);
		}
	}

	@keyframes flash-burst {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes welcome-fade {
		from {
			opacity: 0;
			letter-spacing: 0.8em;
		}
		to {
			opacity: 1;
			letter-spacing: 0.5em;
		}
	}

	/* Responsive */
	@media (max-width: 640px) {
		.boot-line.title-line {
			font-size: 0.85rem;
		}

		.boot-check-line {
			font-size: 0.6rem;
		}

		.hud-status-text {
			font-size: 1rem;
			letter-spacing: 0.2em;
		}

		.boot-welcome {
			font-size: 1.2rem;
			letter-spacing: 0.3em;
		}

		.ring-1 { width: 80px; height: 80px; }
		.ring-2 { width: 160px; height: 160px; }
		.ring-3 { width: 240px; height: 240px; }

		.hud-corner {
			width: 25px;
			height: 25px;
		}
	}
</style>
