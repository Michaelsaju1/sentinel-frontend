<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
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

	let { data } = $props();

	const stats = data.stats;
	const totalClaims = stats?.total_claims ?? 0;
	const labelDist = stats?.label_distribution ?? {};
	const exaggerated = labelDist.exaggerated ?? 0;
	const accurate = labelDist.accurate ?? 0;
	const understated = labelDist.understated ?? 0;

	// Claim feed state
	interface Claim {
		tweet_id: number;
		text: string;
		username: string;
		created_at: string;
		ticker: string;
		company_name: string;
		price_change_pct: number | null;
		has_catalyst: boolean;
		catalyst_type: string | null;
		label: string;
		claimed_direction: string;
		actual_direction: string;
	}

	let claims: Claim[] = $state(data.feed?.claims ?? []);
	let activeFilter: string | null = $state(null);
	let sseConnected = $state(false);

	const filteredClaims = $derived(
		activeFilter ? claims.filter((c) => c.label === activeFilter) : claims
	);

	// Build DataGrid data from claims
	const claimColumns = [
		{ key: 'time', label: 'Time', width: '140px' },
		{ key: 'ticker', label: 'Ticker', width: '70px' },
		{ key: 'text', label: 'Claim' },
		{ key: 'label', label: 'Label', width: '110px' },
		{ key: 'direction', label: 'Direction', width: '100px' },
		{ key: 'price_change', label: 'Price Chg', width: '90px' },
		{ key: 'catalyst', label: 'Catalyst', width: '90px' }
	];

	const claimRows = $derived(
		filteredClaims.map((c) => ({
			time: c.created_at ? new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
			ticker: c.ticker ?? '—',
			text: c.text ? (c.text.length > 60 ? c.text.substring(0, 60) + '...' : c.text) : '—',
			label: c.label ? c.label.toUpperCase() : '—',
			direction: `${c.claimed_direction ?? '?'} → ${c.actual_direction ?? '?'}`,
			price_change: c.price_change_pct != null ? `${c.price_change_pct >= 0 ? '+' : ''}${c.price_change_pct.toFixed(2)}%` : '—',
			catalyst: c.catalyst_type ?? (c.has_catalyst ? 'yes' : 'none')
		}))
	);

	// Top tickers for sidebar
	const topTickers = stats?.top_tickers ?? [];

	let currentTime = $state(new Date().toISOString().replace('T', ' ').substring(0, 19));

	$effect(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
		}, 1000);
		return () => clearInterval(interval);
	});

	// SSE connection for live updates
	onMount(() => {
		if (!browser) return;

		const eventSource = new EventSource('/api/feed/stream');

		eventSource.onopen = () => {
			sseConnected = true;
		};

		eventSource.onmessage = (event) => {
			try {
				const claim = JSON.parse(event.data) as Claim;
				claims = [claim, ...claims].slice(0, 50);
			} catch {
				// Ignore parse errors (heartbeats, etc.)
			}
		};

		eventSource.onerror = () => {
			sseConnected = false;
		};

		return () => {
			eventSource.close();
		};
	});

	function setFilter(label: string | null) {
		activeFilter = activeFilter === label ? null : label;
	}
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
				Real-time claim monitoring // {currentTime} UTC
			</p>
		</div>
		<div class="flex items-center gap-3">
			{#if sseConnected}
				<Badge variant="success" pulse={true}>LIVE STREAM</Badge>
			{:else}
				<Badge variant="warning">STREAM IDLE</Badge>
			{/if}
			<Badge variant="info">{claims.length} CLAIMS</Badge>
		</div>
	</div>

	<!-- Stats Row -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatsCard
			label="Total Claims"
			value={totalClaims.toLocaleString()}
			change="{topTickers.length} tickers"
			trend="up"
		/>
		<StatsCard
			label="Exaggerated"
			value={exaggerated.toLocaleString()}
			change="{totalClaims > 0 ? ((exaggerated / totalClaims) * 100).toFixed(1) : '0'}%"
			trend="up"
		/>
		<StatsCard
			label="Accurate"
			value={accurate.toLocaleString()}
			change="{totalClaims > 0 ? ((accurate / totalClaims) * 100).toFixed(1) : '0'}%"
			trend="up"
		/>
		<StatsCard
			label="Understated"
			value={understated.toLocaleString()}
			change="{totalClaims > 0 ? ((understated / totalClaims) * 100).toFixed(1) : '0'}%"
			trend="neutral"
		/>
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-4">
		<!-- Left sidebar -->
		<div class="space-y-6 lg:col-span-1">
			<!-- Radar -->
			<HUDPanel title="Scan Radar" glow={true}>
				<div class="flex justify-center py-2">
					<RadarScan size={160} />
				</div>
			</HUDPanel>

			<!-- Exaggeration Level -->
			<HUDPanel title="Exaggeration Level">
				<ThreatMeter level={totalClaims > 0 ? Math.min(Math.round((exaggerated / totalClaims) * 5), 5) : 0} />
			</HUDPanel>

			<!-- Top Tickers -->
			<HUDPanel title="Top Tickers">
				<div class="space-y-3">
					{#each topTickers.slice(0, 6) as t (t.ticker)}
						<div class="flex items-center justify-between">
							<StatusIndicator status="online" label={t.ticker} size="sm" />
							<span class="font-mono text-[10px] tabular-nums text-text-dim">{t.count}</span>
						</div>
					{/each}
					{#if topTickers.length === 0}
						<p class="font-mono text-xs text-text-dim">No data yet</p>
					{/if}
				</div>
			</HUDPanel>
		</div>

		<!-- Main content -->
		<div class="space-y-6 lg:col-span-3">
			<!-- Network Visualization -->
			<HUDPanel title="Claim Network">
				<div class="h-48 md:h-64">
					<NetworkGraph />
				</div>
				<div class="mt-4 grid grid-cols-4 gap-4">
					<div class="text-center">
						<div class="font-display text-lg text-holo">
							<CountUp target={totalClaims} duration={2000} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">TOTAL</div>
					</div>
					<div class="text-center">
						<div class="font-display text-lg text-holo-accent">
							<CountUp target={accurate} duration={1500} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">ACCURATE</div>
					</div>
					<div class="text-center">
						<div class="font-display text-lg text-warning">
							<CountUp target={exaggerated} duration={1800} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">EXAGGERATED</div>
					</div>
					<div class="text-center">
						<div class="font-display text-lg text-holo">
							<CountUp target={understated} duration={1000} />
						</div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim">UNDERSTATED</div>
					</div>
				</div>
			</HUDPanel>

			<!-- Claim Feed -->
			<HUDPanel title="Recent Claims">
				<!-- Label filter buttons -->
				<div class="mb-4 flex flex-wrap gap-2">
					<button
						class="filter-btn"
						class:active={activeFilter === null}
						onclick={() => setFilter(null)}
					>ALL</button>
					<button
						class="filter-btn"
						class:active={activeFilter === 'exaggerated'}
						onclick={() => setFilter('exaggerated')}
					>EXAGGERATED</button>
					<button
						class="filter-btn"
						class:active={activeFilter === 'accurate'}
						onclick={() => setFilter('accurate')}
					>ACCURATE</button>
					<button
						class="filter-btn"
						class:active={activeFilter === 'understated'}
						onclick={() => setFilter('understated')}
					>UNDERSTATED</button>
				</div>
				{#if claimRows.length > 0}
					<DataGrid columns={claimColumns} rows={claimRows} />
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No claims found. Run the scraper to collect data.
					</p>
				{/if}
			</HUDPanel>

			<!-- Label Distribution -->
			<HUDPanel title="Label Distribution">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-3">
						<ProgressBar value={totalClaims > 0 ? Math.round((accurate / totalClaims) * 100) : 0} label="Accurate" variant="default" />
						<ProgressBar value={totalClaims > 0 ? Math.round((exaggerated / totalClaims) * 100) : 0} label="Exaggerated" variant="warning" />
						<ProgressBar value={totalClaims > 0 ? Math.round((understated / totalClaims) * 100) : 0} label="Understated" variant="info" />
					</div>
					<div class="space-y-3">
						{#each Object.entries(stats?.catalyst_type_distribution ?? {}).slice(0, 3) as [type, count]}
							<ProgressBar
								value={totalClaims > 0 ? Math.round(((count as number) / totalClaims) * 100) : 0}
								label={type.charAt(0).toUpperCase() + type.slice(1)}
								variant="default"
							/>
						{/each}
					</div>
				</div>
			</HUDPanel>
		</div>
	</div>
</div>

<style>
	.filter-btn {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.15em;
		color: rgba(176, 196, 222, 0.7);
		background: transparent;
		border: 1px solid rgba(26, 48, 80, 0.8);
		padding: 4px 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-btn:hover {
		color: rgba(0, 212, 255, 0.9);
		border-color: rgba(0, 212, 255, 0.4);
		background: rgba(0, 212, 255, 0.05);
	}

	.filter-btn.active {
		color: rgba(0, 212, 255, 0.95);
		border-color: rgba(0, 212, 255, 0.6);
		background: rgba(0, 212, 255, 0.1);
		box-shadow: 0 0 8px rgba(0, 212, 255, 0.15);
	}
</style>
