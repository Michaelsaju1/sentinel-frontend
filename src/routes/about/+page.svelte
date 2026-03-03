<script lang="ts">
	import {
		HUDPanel,
		GlitchText,
		TypewriterText,
		Badge,
		StatusIndicator,
		ProgressBar,
		HexGrid,
		CommandLine
	} from '$lib/components/ui';

	const teamMembers = [
		{
			callsign: 'ARCHITECT',
			role: 'System Design',
			status: 'online' as const,
			clearance: 'UNCLASSIFIED'
		},
		{
			callsign: 'CIPHER',
			role: 'Cryptography',
			status: 'online' as const,
			clearance: 'UNCLASSIFIED'
		},
		{
			callsign: 'GHOST',
			role: 'Threat Intelligence',
			status: 'online' as const,
			clearance: 'UNCLASSIFIED'
		},
		{
			callsign: 'VALKYRIE',
			role: 'Incident Response',
			status: 'warning' as const,
			clearance: 'UNCLASSIFIED'
		},
		{
			callsign: 'PHOENIX',
			role: 'Recovery Ops',
			status: 'online' as const,
			clearance: 'UNCLASSIFIED'
		},
		{
			callsign: 'SPECTER',
			role: 'Penetration Testing',
			status: 'offline' as const,
			clearance: 'UNCLASSIFIED'
		}
	];

	const timeline = [
		{ year: '2021', event: 'Project SENTINEL initiated under directive CYBER-7' },
		{ year: '2022', event: 'Core threat engine deployed. First 100 endpoints secured.' },
		{ year: '2023', event: 'AI-driven anomaly detection integrated. 1000+ endpoints.' },
		{ year: '2024', event: 'Global network expansion. Partner agency integration.' },
		{ year: '2025', event: 'Zero-trust architecture migration complete.' },
		{ year: '2026', event: 'v3.1 deployed. Full-spectrum defense capability achieved.' }
	];

	const initLog = [
		{ type: 'input' as const, text: 'cat /etc/sentinel/mission.brief' },
		{ type: 'output' as const, text: '===============================' },
		{ type: 'output' as const, text: ' SENTINEL DEFENSE SYSTEMS' },
		{ type: 'output' as const, text: ' MISSION BRIEFING // v3.1' },
		{ type: 'output' as const, text: '===============================' },
		{ type: 'output' as const, text: '' },
		{
			type: 'output' as const,
			text: 'PRIMARY OBJECTIVE: Provide autonomous, real-time'
		},
		{
			type: 'output' as const,
			text: 'threat detection and response for digital assets.'
		},
		{ type: 'output' as const, text: '' },
		{
			type: 'success' as const,
			text: 'Mission parameters loaded. All operators briefed.'
		}
	];

	const capabilities = [
		{
			name: 'Threat Detection',
			desc: 'AI-powered real-time analysis of network traffic, identifying zero-day exploits and advanced persistent threats before they breach the perimeter.',
			progress: 98
		},
		{
			name: 'Incident Response',
			desc: 'Automated containment and remediation protocols that activate within milliseconds of threat confirmation.',
			progress: 94
		},
		{
			name: 'Intelligence Gathering',
			desc: 'Multi-source fusion of OSINT, dark web monitoring, and partner intel feeds for comprehensive threat awareness.',
			progress: 91
		},
		{
			name: 'Vulnerability Management',
			desc: 'Continuous scanning and prioritized patching workflows that minimize attack surface exposure.',
			progress: 87
		}
	];
</script>

<svelte:head>
	<title>SENTINEL // Mission</title>
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden border-b border-surface-border py-20">
	<!-- Hex background -->
	<div class="absolute inset-0 opacity-30">
		<HexGrid opacity={0.06} />
	</div>

	<div class="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
		<Badge variant="info" class="mb-6">UNCLASSIFIED // FOUO</Badge>
		<h1 class="mb-4">
			<GlitchText tag="span" class="block font-display text-4xl font-bold tracking-wider text-text-bright md:text-5xl" intensity="low">
				MISSION BRIEF
			</GlitchText>
		</h1>
		<div class="mx-auto h-8 max-w-2xl">
			<TypewriterText
				text="Protecting digital infrastructure through advanced threat intelligence and autonomous defense systems."
				speed={30}
				delay={300}
				class="text-sm text-text-dim md:text-base"
			/>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-4 py-12 lg:px-8">
	<!-- Mission Terminal -->
	<div class="mb-12">
		<HUDPanel title="Mission Parameters">
			<CommandLine lines={initLog} prompt="operator@sentinel:~$" />
		</HUDPanel>
	</div>

	<!-- Core Capabilities -->
	<div class="mb-12">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">CORE CAPABILITIES</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			{#each capabilities as cap (cap.name)}
				<HUDPanel title={cap.name}>
					<p class="mb-4 font-mono text-xs leading-relaxed text-text-dim">{cap.desc}</p>
					<ProgressBar value={cap.progress} label="Readiness" variant="default" />
				</HUDPanel>
			{/each}
		</div>
	</div>

	<!-- Timeline -->
	<div class="mb-12">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">OPERATIONAL HISTORY</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<div class="relative">
			<!-- Timeline line -->
			<div class="absolute bottom-0 left-4 top-0 w-px bg-holo-dim/30 md:left-1/2"></div>

			<div class="space-y-8">
				{#each timeline as event, i (event.year)}
					<div
						class="relative flex gap-8 {i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}"
						style="animation: fade-in-up 0.5s ease-out {i * 100}ms both;"
					>
						<!-- Dot -->
						<div class="absolute left-4 z-10 hidden h-3 w-3 -translate-x-1/2 border border-holo bg-surface shadow-[0_0_6px_var(--color-holo-dim)] md:left-1/2 md:block"></div>
						<div class="absolute left-4 z-10 h-3 w-3 -translate-x-1/2 border border-holo bg-surface shadow-[0_0_6px_var(--color-holo-dim)] md:hidden"></div>

						<!-- Content -->
						<div class="ml-10 flex-1 md:ml-0 {i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}">
							<span class="font-display text-lg text-holo">{event.year}</span>
							<p class="mt-1 font-mono text-xs text-text-dim">{event.event}</p>
						</div>
						<div class="hidden flex-1 md:block"></div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Team -->
	<div class="mb-12">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">OPERATOR ROSTER</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each teamMembers as member, i (member.callsign)}
				<div
					class="border border-surface-border bg-surface-light/40 p-4 transition-all hover:border-holo-dim/50"
					style="animation: fade-in-up 0.4s ease-out {i * 80}ms both;"
				>
					<div class="mb-3 flex items-center justify-between">
						<span class="font-display text-sm tracking-wider text-text-bright">
							{member.callsign}
						</span>
						<StatusIndicator status={member.status} size="sm" />
					</div>
					<div class="space-y-1">
						<p class="font-mono text-xs text-text-dim">{member.role}</p>
						<Badge variant="info">
							{member.clearance}
						</Badge>
					</div>
				</div>
			{/each}
		</div>
	</div>

</div>
