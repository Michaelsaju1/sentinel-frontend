<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import {
		GlobeNetwork,
		GlitchText,
		TypewriterText,
		HUDPanel,
		RadarScan,
		StatsCard,
		CommandLine,
		Button,
		ThreatMeter,
		StatusIndicator,
		ProgressBar,
		Badge,
		CountUp,
		BootSequence
	} from '$lib/components/ui';

	// Check session storage for previous boot
	const wasBooted = browser && sessionStorage.getItem('sentinel-booted') === 'true';
	let awake = $state(wasBooted);
	let bootActive = $state(false);
	let dashboardVisible = $state(wasBooted);

	const terminalLines = [
		{ type: 'input' as const, text: 'sentinel --init --mode=defense' },
		{ type: 'success' as const, text: 'Core defense systems initialized' },
		{ type: 'input' as const, text: 'scan --target=perimeter --depth=full' },
		{ type: 'output' as const, text: 'Scanning 2,847 endpoints...' },
		{ type: 'success' as const, text: 'Perimeter scan complete. No breaches detected.' },
		{ type: 'input' as const, text: 'status --subsystem=all' },
		{ type: 'output' as const, text: 'Firewall: ACTIVE | IDS: ACTIVE | Encryption: AES-256' },
		{ type: 'success' as const, text: 'All subsystems nominal. Standing by.' }
	];

	function startBoot() {
		bootActive = true;
	}

	function onBootComplete() {
		bootActive = false;
		awake = true;
		if (browser) sessionStorage.setItem('sentinel-booted', 'true');
		setTimeout(() => {
			dashboardVisible = true;
		}, 50);
	}

	// ===== Self-healing status system =====
	interface LiveStatus {
		label: string;
		status: 'online' | 'warning' | 'critical';
		healing: boolean;
	}

	let statuses: LiveStatus[] = $state([
		{ label: 'Primary Defense Grid', status: 'online', healing: false },
		{ label: 'Threat Intelligence Feed', status: 'online', healing: false },
		{ label: 'Sector 7-G Perimeter', status: 'online', healing: false },
		{ label: 'Encryption Protocols', status: 'online', healing: false }
	]);

	const warningMessages = [
		'Sector 7-G Perimeter',
		'Threat Intelligence Feed',
		'Encryption Protocols',
		'Primary Defense Grid'
	];

	onMount(() => {
		// Schedule random warnings that self-heal
		function triggerWarning() {
			const onlineIndexes = statuses
				.map((s, i) => (s.status === 'online' && !s.healing ? i : -1))
				.filter((i) => i >= 0);
			if (onlineIndexes.length === 0) return;

			const idx = onlineIndexes[Math.floor(Math.random() * onlineIndexes.length)];
			statuses[idx].status = 'warning';
			statuses[idx].healing = false;

			// After 2-4s, start self-healing
			const healDelay = 2000 + Math.random() * 2000;
			setTimeout(() => {
				statuses[idx].healing = true;
				// After 1-2s more, resolve back to online
				setTimeout(
					() => {
						statuses[idx].status = 'online';
						statuses[idx].healing = false;
					},
					1000 + Math.random() * 1000
				);
			}, healDelay);
		}

		// Trigger a warning every 6-12s
		const interval = setInterval(
			() => triggerWarning(),
			6000 + Math.random() * 6000
		);

		// Trigger first one after a short delay
		const firstTimeout = setTimeout(() => triggerWarning(), 3000);

		return () => {
			clearInterval(interval);
			clearTimeout(firstTimeout);
		};
	});
</script>

<svelte:head>
	<title>SENTINEL // Home</title>
</svelte:head>

<BootSequence active={bootActive} onComplete={onBootComplete} />

{#if !awake}
	<!-- ===== SLEEP STATE ===== -->
	<section class="sleep-screen">
		<!-- Globe background -->
		<div class="absolute inset-0">
			<GlobeNetwork nodeCount={40} rotationSpeed={0.002} opacity={0.7} />
		</div>

		<!-- Dark vignette -->
		<div class="vignette"></div>

		<!-- Scan line sweep -->
		<div class="scan-sweep"></div>

		<!-- Centered branding -->
		<div class="relative z-10 flex flex-col items-center px-4 text-center">
			<!-- Status badge -->
			<div
				class="mb-8 inline-flex items-center gap-2 border border-holo-dim/20 bg-base/70 px-4 py-1.5 backdrop-blur-sm"
			>
				<span class="relative flex h-2 w-2">
					<span class="ping-ring"></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-holo"></span>
				</span>
				<span class="font-mono text-[10px] tracking-[0.3em] text-holo/80"
					>AWAITING AUTHORIZATION</span
				>
			</div>

			<!-- Title -->
			<h1 class="mb-3">
				<GlitchText
					tag="span"
					class="block font-display text-6xl font-bold tracking-wider text-text-bright md:text-8xl"
					intensity="low"
				>
					SENTINEL
				</GlitchText>
			</h1>
			<p class="mb-2 font-mono text-sm tracking-[0.2em] text-holo-dim/70 md:text-base">
				ADVANCED DEFENSE PLATFORM
			</p>
			<p class="mb-8 font-mono text-[10px] tracking-[0.25em] text-text-dim/50">
				CLASSIFICATION: UNCLASSIFIED // FOUO
			</p>

			<!-- Typewriter -->
			<div class="mb-10 h-7">
				<TypewriterText
					text="Systems dormant. Operator authentication required to initialize defense grid."
					speed={40}
					delay={1000}
					class="text-sm text-text-dim/70"
				/>
			</div>

			<!-- Initialize button -->
			<button class="init-button" onclick={startBoot}>
				<span class="init-button-border"></span>
				<span class="init-button-text">INITIALIZE SYSTEMS</span>
			</button>
		</div>
	</section>
{:else}
	<!-- ===== AWAKE STATE (Dashboard) ===== -->
	<div class="dashboard-enter" class:visible={dashboardVisible}>
		<!-- Stats Row -->
		<section class="border-b border-surface-border bg-surface-light/30 py-12">
			<div class="mx-auto max-w-7xl px-4 lg:px-8">
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatsCard label="Threats Blocked" value="14,892" change="12.4%" trend="up" />
					<StatsCard label="Active Monitors" value="2,847" change="3.1%" trend="up" />
					<StatsCard label="Response Time" value="0.3ms" change="8.2%" trend="down" />
					<StatsCard label="Uptime" value="99.97%" change="0.01%" trend="up" />
				</div>
			</div>
		</section>

		<!-- Operations Center -->
		<section class="py-16">
			<div class="mx-auto max-w-7xl px-4 lg:px-8">
				<div class="mb-10 flex items-center gap-4">
					<div class="h-px flex-1 bg-surface-border"></div>
					<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">
						OPERATIONS CENTER
					</h2>
					<div class="h-px flex-1 bg-surface-border"></div>
				</div>

				<div class="grid gap-6 lg:grid-cols-3">
					<!-- Radar & Status -->
					<div class="lg:col-span-1">
						<HUDPanel title="Surveillance Radar" glow={true}>
							<div class="flex flex-col items-center gap-4">
								<RadarScan size={180} />
								<div class="w-full space-y-3 pt-2">
									{#each statuses as s (s.label)}
										<div class="flex items-center gap-2">
											<StatusIndicator status={s.status} label={s.label} size="sm" />
											{#if s.healing}
												<span class="healing-badge">HEALING</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						</HUDPanel>
					</div>

					<!-- Terminal -->
					<div class="lg:col-span-2">
						<HUDPanel title="Command Interface">
							<CommandLine lines={terminalLines} />
						</HUDPanel>
					</div>
				</div>

				<!-- Second Row -->
				<div class="mt-6 grid gap-6 lg:grid-cols-2">
					<!-- Threat Assessment -->
					<HUDPanel title="Threat Assessment">
						<div class="space-y-5">
							<ThreatMeter level={2} label="Global Threat Level" />
							<div class="space-y-3">
								<ProgressBar value={87} label="Firewall Integrity" variant="default" />
								<ProgressBar value={92} label="Encryption Status" variant="info" />
								<ProgressBar value={64} label="Network Load" variant="warning" />
								<ProgressBar value={23} label="Attack Surface" variant="danger" />
							</div>
							<div class="flex flex-wrap gap-2 pt-2">
								<Badge variant="success">FIREWALL ACTIVE</Badge>
								<Badge variant="info">IDS ENABLED</Badge>
								<Badge variant="warning" pulse={true}>MONITORING</Badge>
								<Badge variant="default">AES-256</Badge>
							</div>
						</div>
					</HUDPanel>

					<!-- Network Topology (Globe in small panel) -->
					<HUDPanel title="Network Topology">
						<div class="h-64">
							<GlobeNetwork nodeCount={30} rotationSpeed={0.003} />
						</div>
						<div class="mt-4 grid grid-cols-3 gap-3">
							<div class="text-center">
								<div class="font-display text-xl text-holo">
									<CountUp target={847} duration={2000} />
								</div>
								<div class="font-mono text-[10px] tracking-wider text-text-dim">
									NODES
								</div>
							</div>
							<div class="text-center">
								<div class="font-display text-xl text-holo-accent">
									<CountUp target={2341} duration={2500} />
								</div>
								<div class="font-mono text-[10px] tracking-wider text-text-dim">
									CONNECTIONS
								</div>
							</div>
							<div class="text-center">
								<div class="font-display text-xl text-warning">
									<CountUp target={12} duration={1500} />
								</div>
								<div class="font-mono text-[10px] tracking-wider text-text-dim">
									ANOMALIES
								</div>
							</div>
						</div>
					</HUDPanel>
				</div>
			</div>
		</section>
	</div>
{/if}

<style>
	.sleep-screen {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 4rem);
		overflow: hidden;
		background: #020810;
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 20%,
			rgba(2, 8, 16, 0.7) 55%,
			rgba(2, 8, 16, 0.95) 85%
		);
		pointer-events: none;
		z-index: 5;
	}

	.scan-sweep {
		position: absolute;
		inset: 0;
		z-index: 6;
		pointer-events: none;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 212, 255, 0.03) 50%,
			transparent 51%,
			transparent 100%
		);
		background-size: 100% 200%;
		animation: sweep 8s linear infinite;
	}

	@keyframes sweep {
		0% {
			background-position: 0% -100%;
		}
		100% {
			background-position: 0% 200%;
		}
	}

	.ping-ring {
		position: absolute;
		display: inline-flex;
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		background-color: rgba(0, 212, 255, 0.75);
		opacity: 0.75;
		animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	@keyframes ping {
		75%,
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	/* Custom init button */
	.init-button {
		position: relative;
		padding: 14px 36px;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: 'Orbitron', sans-serif;
		transition: all 0.3s ease;
	}

	.init-button:hover {
		transform: scale(1.02);
	}

	.init-button:hover .init-button-border {
		border-color: rgba(0, 212, 255, 0.8);
		box-shadow:
			0 0 15px rgba(0, 212, 255, 0.3),
			inset 0 0 15px rgba(0, 212, 255, 0.05);
	}

	.init-button:hover .init-button-text {
		text-shadow:
			0 0 10px rgba(0, 212, 255, 0.8),
			0 0 20px rgba(0, 212, 255, 0.4);
	}

	.init-button-border {
		position: absolute;
		inset: 0;
		border: 1px solid rgba(0, 212, 255, 0.4);
		transition: all 0.3s ease;
	}

	.init-button-border::before,
	.init-button-border::after {
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		border-color: rgba(0, 212, 255, 0.8);
		border-style: solid;
	}

	.init-button-border::before {
		top: -1px;
		left: -1px;
		border-width: 2px 0 0 2px;
	}

	.init-button-border::after {
		bottom: -1px;
		right: -1px;
		border-width: 0 2px 2px 0;
	}

	.init-button-text {
		position: relative;
		font-size: 0.75rem;
		letter-spacing: 0.3em;
		color: rgba(0, 212, 255, 0.9);
		text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
	}

	.dashboard-enter {
		opacity: 0;
		transform: translateY(20px);
		transition:
			opacity 0.8s ease-out,
			transform 0.8s ease-out;
	}

	.dashboard-enter.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.healing-badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9px;
		letter-spacing: 0.1em;
		color: rgba(0, 212, 255, 0.9);
		background: rgba(0, 212, 255, 0.1);
		border: 1px solid rgba(0, 212, 255, 0.3);
		padding: 1px 6px;
		animation: healing-pulse 0.8s ease-in-out infinite;
	}

	@keyframes healing-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>
