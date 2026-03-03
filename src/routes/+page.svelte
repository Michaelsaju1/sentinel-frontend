<script lang="ts">
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

	let awake = $state(false);
	let bootActive = $state(false);
	let dashboardVisible = $state(false);

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
		// Slight delay so the dashboard entrance animation is visible
		setTimeout(() => {
			dashboardVisible = true;
		}, 50);
	}
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

		<!-- Vignette overlay -->
		<div class="vignette"></div>

		<!-- Centered branding -->
		<div class="relative z-10 flex flex-col items-center px-4 text-center">
			<!-- Status badge -->
			<div class="mb-8 inline-flex items-center gap-2 border border-holo-dim/30 bg-base/60 px-4 py-1.5 backdrop-blur-sm">
				<span class="relative flex h-2 w-2">
					<span class="ping-ring"></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-holo"></span>
				</span>
				<span class="font-mono text-[10px] tracking-[0.3em] text-holo">SYSTEM ACTIVE</span>
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
			<p class="mb-6 font-mono text-sm tracking-[0.2em] text-holo-dim md:text-base">
				ADVANCED DEFENSE PLATFORM
			</p>

			<!-- Typewriter -->
			<div class="mb-10 h-7">
				<TypewriterText
					text="Monitoring. Analyzing. Protecting. Your digital perimeter is secure."
					speed={35}
					delay={800}
					class="text-sm text-text-dim"
				/>
			</div>

			<!-- Initialize button -->
			<Button variant="primary" size="lg" onclick={startBoot}>
				Initialize Systems
			</Button>
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
									<StatusIndicator status="online" label="Primary Defense Grid" size="sm" />
									<StatusIndicator
										status="online"
										label="Threat Intelligence Feed"
										size="sm"
									/>
									<StatusIndicator
										status="warning"
										label="Sector 7-G Perimeter"
										size="sm"
									/>
									<StatusIndicator
										status="online"
										label="Encryption Protocols"
										size="sm"
									/>
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
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, transparent 30%, rgba(4, 10, 18, 0.85) 80%);
		pointer-events: none;
		z-index: 5;
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
		75%, 100% {
			transform: scale(2);
			opacity: 0;
		}
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
</style>
