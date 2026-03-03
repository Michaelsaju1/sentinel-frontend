<script lang="ts">
	import {
		HUDPanel,
		StatusIndicator,
		ProgressBar,
		DataGrid,
		ThreatMeter,
		RadarScan,
		Badge,
		AlertBanner,
		Button,
		CountUp,
		StatsCard,
		NetworkGraph
	} from '$lib/components/ui';

	const systemModules = [
		{ name: 'Intrusion Detection', status: 'online' as const, uptime: '99.99%', load: 34 },
		{ name: 'Packet Inspector', status: 'online' as const, uptime: '99.98%', load: 67 },
		{ name: 'Threat Classifier', status: 'online' as const, uptime: '99.95%', load: 45 },
		{ name: 'Anomaly Detector', status: 'warning' as const, uptime: '99.87%', load: 89 },
		{ name: 'Log Aggregator', status: 'online' as const, uptime: '99.99%', load: 22 },
		{ name: 'Response Engine', status: 'online' as const, uptime: '99.96%', load: 51 }
	];

	const recentEvents = {
		columns: [
			{ key: 'time', label: 'Timestamp', width: '160px' },
			{ key: 'type', label: 'Type' },
			{ key: 'source', label: 'Source' },
			{ key: 'action', label: 'Action' },
			{ key: 'severity', label: 'Severity' }
		],
		rows: [
			{
				time: '2026-03-02 14:32:07',
				type: 'INTRUSION',
				source: '194.28.112.44',
				action: 'BLOCKED',
				severity: 'HIGH'
			},
			{
				time: '2026-03-02 14:31:52',
				type: 'SCAN',
				source: '10.0.0.0/24',
				action: 'COMPLETED',
				severity: 'INFO'
			},
			{
				time: '2026-03-02 14:31:18',
				type: 'AUTH FAIL',
				source: '203.0.113.15',
				action: 'LOGGED',
				severity: 'MED'
			},
			{
				time: '2026-03-02 14:30:44',
				type: 'MALWARE',
				source: 'email-gw-03',
				action: 'QUARANTINED',
				severity: 'CRIT'
			},
			{
				time: '2026-03-02 14:30:02',
				type: 'POLICY',
				source: 'fw-rule-847',
				action: 'UPDATED',
				severity: 'LOW'
			},
			{
				time: '2026-03-02 14:29:33',
				type: 'DDoS',
				source: '45.33.32.156',
				action: 'MITIGATED',
				severity: 'HIGH'
			}
		]
	};

	let currentTime = $state(new Date().toISOString().replace('T', ' ').substring(0, 19));

	$effect(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>SENTINEL // Dashboard</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="font-display text-2xl tracking-wider text-text-bright">OPERATIONS DASHBOARD</h1>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Real-time defense monitoring // {currentTime} UTC
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Badge variant="success">ALL SYSTEMS NOMINAL</Badge>
			<Button variant="ghost" size="sm">Export Report</Button>
		</div>
	</div>

	<!-- Alerts -->
	<div class="mb-6 space-y-2">
		<AlertBanner variant="warning" dismissible={true}>
			Anomaly detected in Sector 7-G. Automated countermeasures engaged. Investigating.
		</AlertBanner>
	</div>

	<!-- Stats Row -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatsCard label="Events / sec" value="1,247" change="5.3%" trend="up" />
		<StatsCard label="Blocked Today" value="3,891" change="12.7%" trend="up" />
		<StatsCard label="Avg Latency" value="0.28ms" change="2.1%" trend="down" />
		<StatsCard label="Active Rules" value="12,403" change="48" trend="up" />
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-4">
		<!-- Left sidebar -->
		<div class="space-y-6 lg:col-span-1">
			<!-- Radar -->
			<HUDPanel title="Threat Radar" glow={true}>
				<div class="flex justify-center py-2">
					<RadarScan size={160} />
				</div>
			</HUDPanel>

			<!-- Threat Level -->
			<HUDPanel title="Threat Level">
				<ThreatMeter level={2} />
			</HUDPanel>

			<!-- System Modules -->
			<HUDPanel title="System Modules">
				<div class="space-y-3">
					{#each systemModules as mod (mod.name)}
						<div class="flex items-center justify-between">
							<StatusIndicator status={mod.status} label={mod.name} size="sm" />
							<span class="font-mono text-[10px] tabular-nums text-text-dim">{mod.load}%</span>
						</div>
					{/each}
				</div>
			</HUDPanel>
		</div>

		<!-- Main content -->
		<div class="space-y-6 lg:col-span-3">
			<!-- Network Visualization -->
			<HUDPanel title="Live Network Map">
				<div class="h-48 md:h-64">
					<NetworkGraph />
				</div>
				<div class="mt-4 grid grid-cols-4 gap-4">
					<div class="text-center">
						<div class="font-display text-lg text-holo">
							<CountUp target={2847} duration={2000} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">ENDPOINTS</div>
					</div>
					<div class="text-center">
						<div class="font-display text-lg text-holo-accent">
							<CountUp target={156} duration={1500} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">GATEWAYS</div>
					</div>
					<div class="text-center">
						<div class="font-display text-lg text-holo">
							<CountUp target={42} duration={1800} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">SEGMENTS</div>
					</div>
					<div class="text-center">
						<div class="font-display text-lg text-warning">
							<CountUp target={3} duration={1000} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">ALERTS</div>
					</div>
				</div>
			</HUDPanel>

			<!-- Event Log -->
			<HUDPanel title="Recent Events">
				<DataGrid columns={recentEvents.columns} rows={recentEvents.rows} />
			</HUDPanel>

			<!-- System Health -->
			<HUDPanel title="System Health">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-3">
						<ProgressBar value={34} label="CPU Usage" variant="default" />
						<ProgressBar value={62} label="Memory" variant="info" />
						<ProgressBar value={45} label="Disk I/O" variant="default" />
					</div>
					<div class="space-y-3">
						<ProgressBar value={89} label="Bandwidth" variant="warning" />
						<ProgressBar value={22} label="Error Rate" variant="danger" />
						<ProgressBar value={97} label="Cache Hit" variant="info" />
					</div>
				</div>
			</HUDPanel>
		</div>
	</div>
</div>
