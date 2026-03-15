<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import {
		HUDPanel,
		ProgressBar,
		DataGrid,
		ThreatMeter,
		RadarScan,
		Badge,
		Button,
		CountUp,
		StatsCard
	} from '$lib/components/ui';

	let { data } = $props();

	const stats = data.stats;
	const totalClaims = stats?.total_claims ?? 0;
	const labelDist = stats?.label_distribution ?? {};
	const exaggerated = labelDist.exaggerated ?? 0;
	const accurate = labelDist.accurate ?? 0;
	const understated = labelDist.understated ?? 0;

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

	// Initial data from SSR
	const initialClaims: Claim[] = (data.feed?.claims ?? [])
		.sort((a: Claim, b: Claim) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	// Split: latest day → live drip
	function getDateKey(dateStr: string): string {
		return new Date(dateStr).toISOString().substring(0, 10);
	}

	const latestDay = initialClaims.length > 0 ? getDateKey(initialClaims[0].created_at) : '';
	const liveClaims = initialClaims.filter((c) => c.created_at && getDateKey(c.created_at) === latestDay);

	// === Simulated live ingestion ===
	let ingestedClaims: Claim[] = $state([]);
	let ingestionActive = $state(liveClaims.length > 0);

	onMount(() => {
		if (!browser || liveClaims.length === 0) {
			ingestionActive = false;
			return;
		}

		const drip = [...liveClaims].reverse();
		let index = 0;

		ingestedClaims = [drip[0]];
		index = 1;

		const interval = setInterval(() => {
			if (index >= drip.length) {
				ingestionActive = false;
				clearInterval(interval);
				return;
			}
			ingestedClaims = [drip[index], ...ingestedClaims];
			index++;
		}, 1500 + Math.random() * 2000);

		return () => clearInterval(interval);
	});

	// === Server-side paginated table ===
	const PAGE_SIZE = 50;
	let tableClaims: Claim[] = $state(initialClaims);
	let currentPage = $state(0);
	let serverOffset = $state(initialClaims.length); // next offset to fetch from API
	let hasMore = $state(initialClaims.length >= 200); // if initial fetch was full, there's probably more
	let loading = $state(false);

	let activeFilter: string | null = $state(null);
	let activeTicker: string | null = $state(null);

	const availableTickers = $derived(
		[...new Set(tableClaims.map((c) => c.ticker).filter(Boolean))].sort()
	);

	const filteredClaims = $derived(
		tableClaims
			.filter((c) => !activeFilter || c.label === activeFilter)
			.filter((c) => !activeTicker || c.ticker === activeTicker)
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filteredClaims.length / PAGE_SIZE)));
	const pagedClaims = $derived(
		filteredClaims.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
	);

	// Fetch more claims from the backend
	async function fetchMore() {
		if (loading || !hasMore) return;
		loading = true;

		try {
			const labelParam = activeFilter ? `&label=${activeFilter}` : '';
			const res = await fetch(`/api/feed/more?limit=200&offset=${serverOffset}${labelParam}`);
			if (!res.ok) throw new Error(`${res.status}`);
			const data = await res.json();
			const newClaims: Claim[] = data.claims ?? [];

			if (newClaims.length === 0) {
				hasMore = false;
			} else {
				// Deduplicate by tweet_id
				const existingIds = new Set(tableClaims.map((c) => c.tweet_id));
				const unique = newClaims.filter((c) => !existingIds.has(c.tweet_id));
				tableClaims = [...tableClaims, ...unique]
					.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
				serverOffset += newClaims.length;
				if (newClaims.length < 200) hasMore = false;
			}
		} catch (e) {
			console.error('Failed to fetch more claims:', e);
		} finally {
			loading = false;
		}
	}

	// When navigating to the last page, prefetch more data
	$effect(() => {
		if (currentPage >= totalPages - 1 && hasMore && !loading) {
			fetchMore();
		}
	});

	const claimColumns = [
		{ key: 'time', label: 'Time', width: '140px' },
		{ key: 'ticker', label: 'Ticker', width: '70px' },
		{ key: 'user', label: 'User', width: '110px' },
		{ key: 'text', label: 'Claim' },
		{ key: 'label', label: 'Label', width: '110px' },
		{ key: 'direction', label: 'Direction', width: '100px' },
		{ key: 'price_change', label: 'Price Chg', width: '90px' }
	];

	const claimRows = $derived(
		pagedClaims.map((c) => ({
			time: c.created_at ? new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
			ticker: c.ticker ?? '—',
			user: `@${c.username ?? '?'}`,
			text: c.text ? (c.text.length > 60 ? c.text.substring(0, 60) + '...' : c.text) : '—',
			label: c.label ? c.label.toUpperCase() : '—',
			direction: `${c.claimed_direction ?? '?'} → ${c.actual_direction ?? '?'}`,
			price_change: c.price_change_pct != null ? `${c.price_change_pct >= 0 ? '+' : ''}${c.price_change_pct.toFixed(2)}%` : '—'
		}))
	);

	// Sidebar data
	const topTickers = stats?.top_tickers ?? [];
	const topExaggerators = stats?.most_exaggerated_users ?? [];

	let currentTime = $state(new Date().toISOString().replace('T', ' ').substring(0, 19));

	$effect(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
		}, 1000);
		return () => clearInterval(interval);
	});

	function labelVariant(label: string): 'danger' | 'success' | 'info' | 'default' {
		if (label === 'exaggerated') return 'danger';
		if (label === 'accurate') return 'success';
		if (label === 'understated') return 'info';
		return 'default';
	}

	function setFilter(label: string | null) {
		activeFilter = activeFilter === label ? null : label;
		currentPage = 0;
	}

	function setTicker(ticker: string | null) {
		activeTicker = activeTicker === ticker ? null : ticker;
		currentPage = 0;
	}
</script>

<svelte:head>
	<title>SENTINEL // Feed</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="font-display text-2xl tracking-wider text-text-bright">CLAIM FEED</h1>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Credibility monitoring // {currentTime} UTC
			</p>
		</div>
		<div class="flex items-center gap-3">
			{#if ingestionActive}
				<Badge variant="success" pulse={true}>INGESTING</Badge>
			{:else if liveClaims.length > 0}
				<Badge variant="info">INGESTION COMPLETE</Badge>
			{/if}
			<Badge variant="default">{tableClaims.length} LOADED</Badge>
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
			<HUDPanel title="Signal Monitor" glow={true}>
				<div class="flex justify-center py-2">
					<RadarScan size={160} />
				</div>
			</HUDPanel>

			<HUDPanel title="Exaggeration Index">
				<ThreatMeter level={totalClaims > 0 ? Math.min(Math.round((exaggerated / totalClaims) * 5), 5) : 0} />
			</HUDPanel>

			<HUDPanel title="Top Tickers">
				<div class="space-y-3">
					{#each topTickers.slice(0, 6) as t (t.ticker)}
						<div class="flex items-center justify-between">
							<a href="/intel/{t.ticker}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
								{t.ticker}
							</a>
							<span class="font-mono text-[10px] tabular-nums text-text-dim">{t.count}</span>
						</div>
					{/each}
					{#if topTickers.length === 0}
						<p class="font-mono text-xs text-text-dim">No data yet</p>
					{/if}
				</div>
			</HUDPanel>

			<HUDPanel title="Top Exaggerators" variant="warning">
				<div class="space-y-3">
					{#each topExaggerators.slice(0, 5) as user (user.username)}
						<div class="flex items-center justify-between">
							<a href="/accounts/{user.username}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
								@{user.username}
							</a>
							<span class="font-mono text-[10px] tabular-nums text-warning">{user.count}</span>
						</div>
					{/each}
					{#if topExaggerators.length === 0}
						<p class="font-mono text-xs text-text-dim">No data yet</p>
					{/if}
				</div>
			</HUDPanel>
		</div>

		<!-- Main content -->
		<div class="space-y-6 lg:col-span-3">
			<!-- Live Ingestion Feed -->
			<HUDPanel title="Live Ingestion — {latestDay}" glow={ingestionActive}>
				<div class="live-feed space-y-2 h-80 overflow-y-auto">
					{#each ingestedClaims as claim, i (claim.tweet_id)}
						<div
							class="claim-entry flex items-start gap-3 border-b border-surface-border/30 pb-2"
							class:latest={i === 0 && ingestionActive}
						>
							<div class="flex-shrink-0 pt-0.5">
								<Badge variant={labelVariant(claim.label)}>
									{claim.label?.toUpperCase() ?? '?'}
								</Badge>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-0.5">
									<a href="/accounts/{claim.username}" class="font-mono text-[11px] text-holo hover:text-holo-bright transition-colors">
										@{claim.username}
									</a>
									<a href="/intel/{claim.ticker}" class="font-mono text-[10px] text-text-dim hover:text-holo transition-colors">
										{claim.ticker}
									</a>
									{#if claim.price_change_pct != null}
										<span class="font-mono text-[10px] {claim.price_change_pct >= 0 ? 'text-holo' : 'text-danger'}">
											{claim.price_change_pct >= 0 ? '+' : ''}{claim.price_change_pct.toFixed(2)}%
										</span>
									{/if}
								</div>
								<p class="font-mono text-xs text-text-primary/80 leading-relaxed">
									{claim.text ? (claim.text.length > 120 ? claim.text.substring(0, 120) + '...' : claim.text) : '—'}
								</p>
							</div>
						</div>
					{/each}
					{#if ingestedClaims.length === 0 && ingestionActive}
						<div class="flex h-full items-center justify-center">
							<p class="font-mono text-xs text-text-dim animate-pulse">
								Waiting for claims...
							</p>
						</div>
					{:else if liveClaims.length === 0}
						<div class="flex h-full items-center justify-center">
							<p class="font-mono text-xs text-text-dim">
								No claims for the latest day. All data shown in the table below.
							</p>
						</div>
					{/if}
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-surface-border/50 pt-3">
					<span class="font-mono text-[10px] text-text-dim">
						{ingestedClaims.length} / {liveClaims.length} ingested
					</span>
					<div class="flex items-center gap-4">
						<div class="text-center">
							<span class="font-display text-sm text-holo"><CountUp target={totalClaims} duration={2000} /></span>
							<span class="font-mono text-[9px] text-text-dim ml-1">TOTAL</span>
						</div>
						<div class="text-center">
							<span class="font-display text-sm text-warning"><CountUp target={exaggerated} duration={1800} /></span>
							<span class="font-mono text-[9px] text-text-dim ml-1">FLAGGED</span>
						</div>
					</div>
				</div>
			</HUDPanel>

			<!-- Recent Claims Table -->
			<HUDPanel title="Recent Claims — {filteredClaims.length} of {totalClaims.toLocaleString()}">
				<!-- Filters row -->
				<div class="mb-4 flex flex-col gap-3">
					<!-- Label filters -->
					<div class="flex flex-wrap gap-2">
						<button class="filter-btn" class:active={activeFilter === null} onclick={() => setFilter(null)}>ALL</button>
						<button class="filter-btn" class:active={activeFilter === 'exaggerated'} onclick={() => setFilter('exaggerated')}>EXAGGERATED</button>
						<button class="filter-btn" class:active={activeFilter === 'accurate'} onclick={() => setFilter('accurate')}>ACCURATE</button>
						<button class="filter-btn" class:active={activeFilter === 'understated'} onclick={() => setFilter('understated')}>UNDERSTATED</button>
					</div>

					<!-- Ticker filter -->
					{#if availableTickers.length > 0}
						<div class="flex flex-wrap gap-1.5">
							<button class="filter-btn ticker-btn" class:active={activeTicker === null} onclick={() => setTicker(null)}>ALL TICKERS</button>
							{#each availableTickers as ticker (ticker)}
								<button class="filter-btn ticker-btn" class:active={activeTicker === ticker} onclick={() => setTicker(ticker)}>{ticker}</button>
							{/each}
						</div>
					{/if}
				</div>

				{#if claimRows.length > 0}
					<DataGrid columns={claimColumns} rows={claimRows} />

					<!-- Pagination -->
					<div class="mt-4 flex items-center justify-between border-t border-surface-border/50 pt-3">
						<span class="font-mono text-[10px] text-text-dim">
							Page {currentPage + 1} of {totalPages}
							{#if loading}
								<span class="text-holo animate-pulse ml-2">LOADING...</span>
							{:else if hasMore}
								<span class="text-text-dim/50 ml-2">· more available</span>
							{/if}
						</span>
						<div class="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								disabled={currentPage === 0}
								onclick={() => (currentPage = Math.max(0, currentPage - 1))}
							>
								PREV
							</Button>
							<span class="font-mono text-[10px] text-text-dim tabular-nums">
								{currentPage + 1} / {totalPages}
							</span>
							<Button
								variant="ghost"
								size="sm"
								disabled={currentPage >= totalPages - 1 && !hasMore}
								onclick={() => {
									currentPage = currentPage + 1;
								}}
							>
								NEXT
							</Button>
						</div>
					</div>
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No claims found{activeFilter ? ` with label "${activeFilter}"` : ''}{activeTicker ? ` for ${activeTicker}` : ''}.
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

	.filter-btn.ticker-btn {
		font-size: 9px;
		padding: 3px 8px;
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

	.claim-entry {
		animation: fade-in-up 0.4s ease-out both;
	}

	.claim-entry.latest {
		background: rgba(0, 212, 255, 0.03);
		border-left: 2px solid rgba(0, 212, 255, 0.4);
		padding-left: 8px;
		animation: claim-flash 0.6s ease-out;
	}

	@keyframes claim-flash {
		0% {
			background: rgba(0, 212, 255, 0.12);
			border-left-color: rgba(0, 212, 255, 0.8);
		}
		100% {
			background: rgba(0, 212, 255, 0.03);
			border-left-color: rgba(0, 212, 255, 0.4);
		}
	}

	.live-feed::-webkit-scrollbar {
		width: 4px;
	}

	.live-feed::-webkit-scrollbar-track {
		background: rgba(4, 10, 18, 0.5);
	}

	.live-feed::-webkit-scrollbar-thumb {
		background: rgba(0, 212, 255, 0.3);
	}
</style>
