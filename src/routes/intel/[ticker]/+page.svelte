<script lang="ts">
	import {
		HUDPanel,
		DataGrid,
		Badge,
		StatsCard,
		ProgressBar,
		ThreatMeter,
		RadarScan
	} from '$lib/components/ui';

	interface Claim {
		tweet_id: number;
		text: string;
		username: string;
		created_at: string;
		label: string;
		price_change_pct: number | null;
		claimed_direction: string;
		actual_direction: string;
		confidence?: number;
		has_catalyst: boolean;
		catalyst_type: string | null;
	}

	let { data } = $props();

	const ticker = $derived(data.ticker);
	const feed = $derived(data.feed);
	const stats = $derived(data.stats);

	const claims: Claim[] = $derived(feed?.claims ?? []);
	const totalClaims = $derived(stats?.total_claims ?? 0);
	const labelDist = $derived(stats?.label_distribution ?? {});
	const exaggerated = $derived(labelDist.exaggerated ?? 0);
	const accurate = $derived(labelDist.accurate ?? 0);
	const understated = $derived(labelDist.understated ?? 0);
	const exaggerationRate = $derived(stats?.exaggeration_rate ?? 0);
	const topUsers = $derived(stats?.top_users ?? []);

	const claimColumns = [
		{ key: 'date', label: 'Date', width: '110px' },
		{ key: 'user', label: 'User', width: '120px' },
		{ key: 'text', label: 'Claim' },
		{ key: 'label', label: 'Label', width: '110px' },
		{ key: 'direction', label: 'Direction', width: '100px' },
		{ key: 'price_change', label: 'Price Chg', width: '90px' },
		{ key: 'catalyst', label: 'Catalyst', width: '90px' }
	];

	const claimRows = $derived(
		claims.map((c) => ({
			date: c.created_at
				? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
				: '—',
			user: `@${c.username ?? '?'}`,
			text: c.text ? (c.text.length > 60 ? c.text.substring(0, 60) + '...' : c.text) : '—',
			label: c.label ? c.label.toUpperCase() : '—',
			direction: `${c.claimed_direction ?? '?'} → ${c.actual_direction ?? '?'}`,
			price_change: c.price_change_pct != null
				? `${c.price_change_pct >= 0 ? '+' : ''}${c.price_change_pct.toFixed(2)}%`
				: '—',
			catalyst: c.catalyst_type ?? (c.has_catalyst ? 'yes' : 'none')
		}))
	);
</script>

<svelte:head>
	<title>SENTINEL // {ticker}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<div class="flex items-center gap-3 mb-2">
				<h1 class="font-display text-2xl tracking-wider text-text-bright">{ticker}</h1>
				<Badge variant="info">{totalClaims} CLAIMS</Badge>
			</div>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Per-stock claim feed // Bot-filtered // Credibility scored
			</p>
		</div>
		<a href="/intel" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
			&larr; ALL STOCKS
		</a>
	</div>

	<!-- Stats Row -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatsCard
			label="Total Claims"
			value={totalClaims.toString()}
			change="bot-filtered"
			trend="neutral"
		/>
		<StatsCard
			label="Exaggeration Rate"
			value="{(exaggerationRate * 100).toFixed(0)}%"
			change="{exaggerated} exaggerated"
			trend={exaggerationRate > 0.5 ? 'down' : 'up'}
		/>
		<StatsCard
			label="Accurate"
			value={accurate.toString()}
			change="{totalClaims > 0 ? ((accurate / totalClaims) * 100).toFixed(0) : '0'}%"
			trend="up"
		/>
		<StatsCard
			label="Avg Price Change"
			value={stats?.avg_price_change != null ? `${stats.avg_price_change >= 0 ? '+' : ''}${stats.avg_price_change.toFixed(2)}%` : '—'}
			change="24h window"
			trend="neutral"
		/>
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-4">
		<!-- Sidebar -->
		<div class="space-y-6 lg:col-span-1">
			<!-- Radar -->
			<HUDPanel title="Ticker Monitor" glow={true}>
				<div class="flex justify-center py-2">
					<RadarScan size={140} />
				</div>
			</HUDPanel>

			<!-- Exaggeration Index -->
			<HUDPanel title="Exaggeration Index" variant="warning">
				<ThreatMeter level={Math.min(Math.round(exaggerationRate * 5), 5)} label="For {ticker}" />
			</HUDPanel>

			<!-- Top Posters -->
			<HUDPanel title="Top Posters">
				<div class="space-y-3">
					{#each topUsers.slice(0, 6) as user (user.username)}
						<div class="flex items-center justify-between">
							<a href="/accounts/{user.username}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
								@{user.username}
							</a>
							<span class="font-mono text-[10px] tabular-nums text-text-dim">{user.count}</span>
						</div>
					{/each}
					{#if topUsers.length === 0}
						<p class="font-mono text-xs text-text-dim">No user data</p>
					{/if}
				</div>
			</HUDPanel>

			<!-- Label Distribution -->
			<HUDPanel title="Label Breakdown">
				<div class="space-y-3">
					<ProgressBar value={totalClaims > 0 ? Math.round((accurate / totalClaims) * 100) : 0} label="Accurate" variant="default" />
					<ProgressBar value={totalClaims > 0 ? Math.round((exaggerated / totalClaims) * 100) : 0} label="Exaggerated" variant="warning" />
					<ProgressBar value={totalClaims > 0 ? Math.round((understated / totalClaims) * 100) : 0} label="Understated" variant="info" />
				</div>
			</HUDPanel>
		</div>

		<!-- Claim Feed -->
		<div class="lg:col-span-3">
			<HUDPanel title="Claim Feed">
				{#if claimRows.length > 0}
					<DataGrid columns={claimColumns} rows={claimRows} />
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No claims found for this ticker.
					</p>
				{/if}
			</HUDPanel>
		</div>
	</div>
</div>
