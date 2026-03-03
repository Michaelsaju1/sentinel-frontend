<script lang="ts">
	import {
		MatrixRain,
		GlitchText,
		TypewriterText,
		HUDPanel,
		RadarScan,
		StatsCard,
		CommandLine,
		Button,
		ThreatMeter,
		NetworkGraph,
		StatusIndicator,
		ProgressBar,
		Badge,
		CountUp,
		BootSequence
	} from '$lib/components/ui';

	let bootActive = $state(false);
	let booted = $state(false);

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
		booted = true;
	}
</script>

<svelte:head>
	<title>SENTINEL // Home</title>
</svelte:head>

<BootSequence active={bootActive} onComplete={onBootComplete} />

<!-- Hero Section -->
<section class="relative overflow-hidden">
	<MatrixRain opacity={0.08} speed={0.8} />

	<div class="relative z-10 mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-36">
		<div class="mx-auto max-w-3xl text-center">
			<!-- Classification badge -->
			<div class="mb-8 inline-flex items-center gap-2 border border-holo-dim/50 bg-surface/80 px-4 py-1.5 backdrop-blur-sm">
				<span class="relative flex h-2 w-2">
					<span class="absolute inline-flex h-full w-full rounded-full bg-holo opacity-75" style="animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-holo"></span>
				</span>
				<span class="font-mono text-[10px] tracking-[0.3em] text-holo">SYSTEM ACTIVE // CLASSIFICATION: TOP SECRET</span>
			</div>

			<!-- Title -->
			<h1 class="mb-6">
				<GlitchText tag="span" class="block font-display text-5xl font-bold tracking-wider text-text-bright md:text-7xl" intensity="low">
					SENTINEL
				</GlitchText>
				<span class="mt-3 block font-mono text-lg tracking-[0.2em] text-holo-dim md:text-xl">
					ADVANCED DEFENSE PLATFORM
				</span>
			</h1>

			<!-- Typewriter -->
			<div class="mb-10 h-8">
				<TypewriterText
					text="Monitoring. Analyzing. Protecting. Your digital perimeter is secure."
					speed={35}
					delay={500}
					class="text-sm text-text-dim md:text-base"
				/>
			</div>

			<!-- CTA -->
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button variant="primary" size="lg">
					Access Dashboard
				</Button>
				<Button variant="ghost" size="lg">
					View Intel Brief
				</Button>
			</div>
		</div>
	</div>

	<!-- Decorative border -->
	<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-holo-dim to-transparent"></div>
</section>

<!-- Stats Section -->
<section class="relative border-b border-surface-border bg-surface-light/30 py-12" class:booted-glow={booted}>
	<div class="mx-auto max-w-7xl px-4 lg:px-8">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatsCard
				label="Threats Blocked"
				value="14,892"
				change="12.4%"
				trend="up"
			/>
			<StatsCard
				label="Active Monitors"
				value="2,847"
				change="3.1%"
				trend="up"
			/>
			<StatsCard
				label="Response Time"
				value="0.3ms"
				change="8.2%"
				trend="down"
			/>
			<StatsCard
				label="Uptime"
				value="99.97%"
				change="0.01%"
				trend="up"
			/>
		</div>
	</div>
</section>

<!-- Main Content Grid -->
<section class="py-16">
	<div class="mx-auto max-w-7xl px-4 lg:px-8">
		<!-- Section header -->
		<div class="mb-10 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">OPERATIONS CENTER</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Radar & Status Panel -->
			<div class="lg:col-span-1">
				<HUDPanel title="Surveillance Radar" glow={true}>
					<div class="flex flex-col items-center gap-4">
						<RadarScan size={180} />
						<div class="w-full space-y-3 pt-2">
							<StatusIndicator status="online" label="Primary Defense Grid" size="sm" />
							<StatusIndicator status="online" label="Threat Intelligence Feed" size="sm" />
							<StatusIndicator status="warning" label="Sector 7-G Perimeter" size="sm" />
							<StatusIndicator status="online" label="Encryption Protocols" size="sm" />
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
			<!-- Threat Level -->
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

			<!-- Network Visualization -->
			<HUDPanel title="Network Topology">
				<div class="h-64">
					<NetworkGraph />
				</div>
				<div class="mt-4 grid grid-cols-3 gap-3">
					<div class="text-center">
						<div class="font-display text-xl text-holo">
							<CountUp target={847} duration={2000} />
						</div>
						<div class="font-mono text-[10px] tracking-wider text-text-dim">NODES</div>
					</div>
					<div class="text-center">
						<div class="font-display text-xl text-holo-accent">
							<CountUp target={2341} duration={2500} />
						</div>
						<div class="font-mono text-[10px] tracking-wider text-text-dim">CONNECTIONS</div>
					</div>
					<div class="text-center">
						<div class="font-display text-xl text-warning">
							<CountUp target={12} duration={1500} />
						</div>
						<div class="font-mono text-[10px] tracking-wider text-text-dim">ANOMALIES</div>
					</div>
				</div>
			</HUDPanel>
		</div>
	</div>
</section>

<!-- Call to Action -->
<section class="border-t border-surface-border bg-surface-light/20 py-20">
	<div class="mx-auto max-w-3xl px-4 text-center lg:px-8">
		<h2 class="mb-4 font-display text-2xl tracking-wider text-text-bright md:text-3xl">
			READY TO DEPLOY?
		</h2>
		<p class="mb-8 font-mono text-sm text-text-dim">
			Initialize the Sentinel defense platform and secure your digital infrastructure. Full
			spectrum threat detection awaits.
		</p>
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<Button variant="primary" size="lg" onclick={startBoot}>Initialize Systems</Button>
			<Button variant="secondary" size="md">Request Briefing</Button>
		</div>
	</div>
</section>

<style>
	.booted-glow {
		animation: section-power-on 1.5s ease-out forwards;
	}

	@keyframes section-power-on {
		0% {
			box-shadow: inset 0 0 30px rgba(0, 212, 255, 0.15);
		}
		50% {
			box-shadow: inset 0 0 60px rgba(0, 212, 255, 0.1);
		}
		100% {
			box-shadow: none;
		}
	}
</style>
