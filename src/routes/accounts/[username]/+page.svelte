<script lang="ts">
	import {
		HUDPanel,
		Badge,
		DataGrid,
		ProgressBar,
		StatsCard
	} from '$lib/components/ui';

	let { data } = $props();

	interface Claim {
		tweet_id: number;
		text: string;
		ticker: string;
		label: string;
		price_change_pct: number | null;
		created_at: string;
		confidence?: number;
	}

	const account = $derived(data.account);
	const claims: Claim[] = $derived(account?.claims ?? []);

	const grifterScore = $derived(account?.grifter_score);
	const totalClaims = $derived(account?.total_claims ?? 0);
	const exaggeratedCount = $derived(account?.exaggerated_count ?? 0);
	const accurateCount = $derived(account?.accurate_count ?? 0);

	function grifterCategory(score: number | null): { label: string; variant: 'danger' | 'warning' | 'info' | 'success' | 'default' } {
		if (score === null) return { label: 'UNSCORED', variant: 'default' };
		if (score >= 0.8) return { label: 'GRIFTER', variant: 'danger' };
		if (score >= 0.5) return { label: 'MOSTLY WRONG', variant: 'warning' };
		if (score >= 0.2) return { label: 'NORMAL', variant: 'info' };
		return { label: 'HIGH SIGNAL', variant: 'success' };
	}

	const category = $derived(grifterCategory(grifterScore));

	// Build claim history table
	const claimColumns = [
		{ key: 'date', label: 'Date', width: '110px' },
		{ key: 'ticker', label: 'Ticker', width: '70px' },
		{ key: 'text', label: 'Claim' },
		{ key: 'label', label: 'Label', width: '110px' },
		{ key: 'price_change', label: 'Price Chg', width: '90px' }
	];

	const claimRows = $derived(
		claims.map((c) => ({
			date: c.created_at
				? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
				: '—',
			ticker: c.ticker ?? '—',
			text: c.text ? (c.text.length > 80 ? c.text.substring(0, 80) + '...' : c.text) : '—',
			label: c.label ? c.label.toUpperCase() : '—',
			price_change: c.price_change_pct != null
				? `${c.price_change_pct >= 0 ? '+' : ''}${c.price_change_pct.toFixed(2)}%`
				: '—'
		}))
	);

	// Per-ticker breakdown
	const tickerBreakdown = $derived.by(() => {
		const map = new Map<string, { total: number; exaggerated: number; accurate: number }>();
		for (const c of claims) {
			if (!c.ticker) continue;
			if (!map.has(c.ticker)) map.set(c.ticker, { total: 0, exaggerated: 0, accurate: 0 });
			const entry = map.get(c.ticker)!;
			entry.total++;
			if (c.label === 'exaggerated') entry.exaggerated++;
			if (c.label === 'accurate') entry.accurate++;
		}
		return [...map.entries()]
			.sort((a, b) => b[1].total - a[1].total)
			.slice(0, 8);
	});
</script>

<svelte:head>
	<title>SENTINEL // @{account?.username ?? 'Unknown'}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<div class="flex items-center gap-3 mb-2">
					<h1 class="font-display text-2xl tracking-wider text-text-bright">
						@{account?.username ?? 'Unknown'}
					</h1>
					{#if account?.is_bot}
						<Badge variant="warning">BOT</Badge>
					{/if}
					<Badge variant={category.variant}>{category.label}</Badge>
				</div>
				<p class="font-mono text-xs text-text-dim">
					{#if account?.first_seen}
						First seen: {new Date(account.first_seen).toLocaleDateString()} //
					{/if}
					{#if account?.last_seen}
						Last active: {new Date(account.last_seen).toLocaleDateString()}
					{/if}
				</p>
			</div>
			<a href="/accounts" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
				&larr; ALL ACCOUNTS
			</a>
		</div>
	</div>

	<!-- Stats Row -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatsCard
			label="Grifter Score"
			value={grifterScore != null ? `${(grifterScore * 100).toFixed(0)}%` : '—'}
			change={category.label}
			trend={grifterScore != null && grifterScore < 0.5 ? 'up' : 'down'}
		/>
		<StatsCard
			label="Total Claims"
			value={totalClaims.toString()}
			change="labeled"
			trend="neutral"
		/>
		<StatsCard
			label="Exaggerated"
			value={exaggeratedCount.toString()}
			change="{totalClaims > 0 ? ((exaggeratedCount / totalClaims) * 100).toFixed(0) : '0'}%"
			trend="down"
		/>
		<StatsCard
			label="Accurate"
			value={accurateCount.toString()}
			change="{totalClaims > 0 ? ((accurateCount / totalClaims) * 100).toFixed(0) : '0'}%"
			trend="up"
		/>
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Claim History -->
		<div class="lg:col-span-2">
			<HUDPanel title="Claim History">
				{#if claimRows.length > 0}
					<DataGrid columns={claimColumns} rows={claimRows} />
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No claims recorded for this account.
					</p>
				{/if}
			</HUDPanel>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Accuracy Breakdown -->
			<HUDPanel title="Accuracy Breakdown">
				<div class="space-y-3">
					<ProgressBar
						value={totalClaims > 0 ? Math.round((accurateCount / totalClaims) * 100) : 0}
						label="Accurate"
						variant="default"
					/>
					<ProgressBar
						value={totalClaims > 0 ? Math.round((exaggeratedCount / totalClaims) * 100) : 0}
						label="Exaggerated"
						variant="warning"
					/>
					<ProgressBar
						value={totalClaims > 0 ? Math.round(((totalClaims - accurateCount - exaggeratedCount) / totalClaims) * 100) : 0}
						label="Understated"
						variant="info"
					/>
				</div>
			</HUDPanel>

			{#if account?.is_bot && account?.bot_reason}
				<HUDPanel title="Bot Classification" variant="warning">
					<p class="font-mono text-xs leading-relaxed text-text-dim">
						{account.bot_reason}
					</p>
					{#if account.classified_at}
						<p class="mt-2 font-mono text-[10px] text-text-dim">
							Classified: {new Date(account.classified_at).toLocaleDateString()}
						</p>
					{/if}
				</HUDPanel>
			{/if}

			<!-- Top Tickers -->
			<HUDPanel title="Most Discussed Tickers">
				<div class="space-y-3">
					{#each tickerBreakdown as [ticker, stats] (ticker)}
						<div>
							<div class="mb-1 flex items-center justify-between">
								<a href="/intel/{ticker}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
									{ticker}
								</a>
								<span class="font-mono text-[10px] text-text-dim">
									{stats.accurate}/{stats.total} accurate
								</span>
							</div>
							<ProgressBar
								value={stats.total > 0 ? Math.round((stats.accurate / stats.total) * 100) : 0}
								variant={stats.total > 0 && (stats.accurate / stats.total) >= 0.5 ? 'default' : 'warning'}
							/>
						</div>
					{/each}
					{#if tickerBreakdown.length === 0}
						<p class="font-mono text-xs text-text-dim">No ticker data</p>
					{/if}
				</div>
			</HUDPanel>
		</div>
	</div>
</div>
