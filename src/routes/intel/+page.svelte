<script lang="ts">
	import {
		HUDPanel,
		DataGrid,
		Badge,
		Button,
		Input,
		ThreatMeter,
		AlertBanner,
		ProgressBar,
		StatusIndicator,
		Modal
	} from '$lib/components/ui';

	let searchQuery = $state('');
	let selectedReport = $state<string | null>(null);
	let modalOpen = $state(false);

	const threatIntel = {
		columns: [
			{ key: 'id', label: 'ID', width: '100px' },
			{ key: 'threat', label: 'Threat Actor' },
			{ key: 'type', label: 'Category' },
			{ key: 'origin', label: 'Origin' },
			{ key: 'confidence', label: 'Confidence' },
			{ key: 'status', label: 'Status' }
		],
		rows: [
			{
				id: 'TI-2847',
				threat: 'APT-PHANTOM',
				type: 'State-Sponsored',
				origin: 'Eastern Europe',
				confidence: '94%',
				status: 'ACTIVE'
			},
			{
				id: 'TI-2846',
				threat: 'GHOST.SPIDER',
				type: 'Ransomware',
				origin: 'Unknown',
				confidence: '87%',
				status: 'TRACKING'
			},
			{
				id: 'TI-2845',
				threat: 'DARK.NEXUS',
				type: 'Botnet',
				origin: 'Southeast Asia',
				confidence: '91%',
				status: 'MITIGATED'
			},
			{
				id: 'TI-2844',
				threat: 'CIPHER.WORM',
				type: 'Supply Chain',
				origin: 'North America',
				confidence: '78%',
				status: 'ACTIVE'
			},
			{
				id: 'TI-2843',
				threat: 'SHADOW.BYTE',
				type: 'Zero-Day',
				origin: 'Central Asia',
				confidence: '82%',
				status: 'INVESTIGATING'
			},
			{
				id: 'TI-2842',
				threat: 'VENOM.STRIKE',
				type: 'Phishing',
				origin: 'West Africa',
				confidence: '96%',
				status: 'CONTAINED'
			}
		]
	};

	const vulnerabilities = [
		{ cve: 'CVE-2026-1847', severity: 'Critical', component: 'OpenSSL 3.2.x', score: 9.8 },
		{ cve: 'CVE-2026-1832', severity: 'High', component: 'Linux Kernel 6.x', score: 8.4 },
		{ cve: 'CVE-2026-1819', severity: 'Medium', component: 'nginx 1.25.x', score: 6.2 },
		{ cve: 'CVE-2026-1801', severity: 'High', component: 'PostgreSQL 16.x', score: 7.9 },
		{ cve: 'CVE-2026-1798', severity: 'Low', component: 'Redis 7.x', score: 3.1 }
	];

	const reports = [
		{
			id: 'RPT-0042',
			title: 'Q1 2026 Threat Landscape Analysis',
			date: '2026-03-01',
			classification: 'SECRET'
		},
		{
			id: 'RPT-0041',
			title: 'APT-PHANTOM Campaign Deep Dive',
			date: '2026-02-28',
			classification: 'TOP SECRET'
		},
		{
			id: 'RPT-0040',
			title: 'Supply Chain Attack Vector Assessment',
			date: '2026-02-25',
			classification: 'CONFIDENTIAL'
		},
		{
			id: 'RPT-0039',
			title: 'Zero-Day Vulnerability Briefing',
			date: '2026-02-22',
			classification: 'SECRET'
		}
	];

	function openReport(id: string) {
		selectedReport = id;
		modalOpen = true;
	}
</script>

<svelte:head>
	<title>SENTINEL // Intel</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="font-display text-2xl tracking-wider text-text-bright">
				INTELLIGENCE CENTER
			</h1>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Threat intelligence feeds // Analysis reports // Vulnerability tracking
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Input bind:value={searchQuery} placeholder="Search intel..." type="search" />
			<Button variant="primary" size="sm">Search</Button>
		</div>
	</div>

	<!-- Alert -->
	<div class="mb-6">
		<AlertBanner variant="danger">
			CRITICAL: New zero-day exploit detected targeting OpenSSL 3.2.x. Patch available. Deploy immediately.
		</AlertBanner>
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Threat Intel Table -->
		<div class="lg:col-span-2">
			<HUDPanel title="Active Threat Actors">
				<DataGrid columns={threatIntel.columns} rows={threatIntel.rows} />
			</HUDPanel>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Global Threat -->
			<HUDPanel title="Global Threat Index" variant="warning">
				<div class="space-y-4">
					<ThreatMeter level={3} label="Current Level" />
					<div class="space-y-2">
						<div class="flex items-center justify-between font-mono text-xs">
							<span class="text-text-dim">Active Campaigns</span>
							<span class="text-warning">14</span>
						</div>
						<div class="flex items-center justify-between font-mono text-xs">
							<span class="text-text-dim">Tracked Actors</span>
							<span class="text-text-primary">247</span>
						</div>
						<div class="flex items-center justify-between font-mono text-xs">
							<span class="text-text-dim">IOCs This Week</span>
							<span class="text-holo-accent">1,832</span>
						</div>
					</div>
				</div>
			</HUDPanel>

			<!-- Intel Feed Status -->
			<HUDPanel title="Feed Status">
				<div class="space-y-3">
					<StatusIndicator status="online" label="OSINT Feed" size="sm" />
					<StatusIndicator status="online" label="Dark Web Monitor" size="sm" />
					<StatusIndicator status="online" label="CERT Advisory" size="sm" />
					<StatusIndicator status="warning" label="Partner Intel" size="sm" />
					<StatusIndicator status="online" label="Malware Sandbox" size="sm" />
				</div>
			</HUDPanel>
		</div>
	</div>

	<!-- Vulnerability Tracking -->
	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<HUDPanel title="Vulnerability Tracker" variant="danger">
			<div class="space-y-3">
				{#each vulnerabilities as vuln (vuln.cve)}
					<div class="flex items-center justify-between border-b border-surface-border pb-3 last:border-0 last:pb-0">
						<div>
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm text-text-primary">{vuln.cve}</span>
								<Badge
									variant={vuln.severity === 'Critical'
										? 'danger'
										: vuln.severity === 'High'
											? 'warning'
											: vuln.severity === 'Medium'
												? 'info'
												: 'default'}
								>
									{vuln.severity}
								</Badge>
							</div>
							<span class="font-mono text-xs text-text-dim">{vuln.component}</span>
						</div>
						<div class="text-right">
							<span class="font-display text-lg {vuln.score >= 9 ? 'text-danger' : vuln.score >= 7 ? 'text-warning' : 'text-holo-accent'}">
								{vuln.score}
							</span>
							<div class="font-mono text-[9px] text-text-dim">CVSS</div>
						</div>
					</div>
				{/each}
			</div>
		</HUDPanel>

		<!-- Intelligence Reports -->
		<HUDPanel title="Intelligence Reports">
			<div class="space-y-3">
				{#each reports as report (report.id)}
					<button
						class="flex w-full items-start justify-between border-b border-surface-border pb-3 text-left transition-colors hover:bg-surface-medium/30 last:border-0 last:pb-0"
						onclick={() => openReport(report.id)}
					>
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span class="font-mono text-[10px] text-holo-dim">{report.id}</span>
								<Badge
									variant={report.classification === 'TOP SECRET' ? 'danger' : report.classification === 'SECRET' ? 'warning' : 'info'}
								>
									{report.classification}
								</Badge>
							</div>
							<p class="font-mono text-sm text-text-primary">{report.title}</p>
							<span class="font-mono text-[10px] text-text-dim">{report.date}</span>
						</div>
						<span class="font-mono text-xs text-text-dim">&gt;</span>
					</button>
				{/each}
			</div>

			<div class="mt-4 border-t border-surface-border pt-4">
				<Button variant="ghost" size="sm" class="w-full">View All Reports</Button>
			</div>
		</HUDPanel>
	</div>
</div>

<!-- Report Modal -->
<Modal bind:open={modalOpen} title="Intelligence Report">
	{#if selectedReport}
		<div class="space-y-4">
			<div class="border border-surface-border bg-surface p-4">
				<p class="font-mono text-xs text-text-dim">REPORT ID: {selectedReport}</p>
				<p class="mt-2 font-mono text-sm text-text-primary">
					{reports.find((r) => r.id === selectedReport)?.title}
				</p>
			</div>
			<AlertBanner variant="warning">
				This document is classified. Unauthorized access or distribution is prohibited under
				Section 18 U.S.C. 798.
			</AlertBanner>
			<div class="space-y-2 font-mono text-xs text-text-dim">
				<p>[EXECUTIVE SUMMARY]</p>
				<p>
					Analysis indicates an escalation in coordinated cyber operations targeting critical
					infrastructure sectors. Recommend elevated monitoring posture and accelerated patch
					deployment cycles across all protected assets.
				</p>
				<p class="mt-3">[DETAILS REDACTED - CLEARANCE LEVEL INSUFFICIENT]</p>
			</div>
			<div class="flex justify-end gap-3 pt-2">
				<Button variant="ghost" size="sm" onclick={() => (modalOpen = false)}>Close</Button>
				<Button variant="primary" size="sm">Request Access</Button>
			</div>
		</div>
	{/if}
</Modal>
