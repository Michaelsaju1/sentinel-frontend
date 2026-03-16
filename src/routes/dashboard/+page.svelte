<script lang="ts">
	import {
		HUDPanel,
		ProgressBar,
		ThreatMeter,
		RadarScan,
		Badge,
		Button,
		CountUp,
		StatsCard,
		ClaimPopup,
		LabelerToggle
	} from '$lib/components/ui';
	import { page } from '$app/stores';

	let { data } = $props();

	const currentLabels = $derived($page.url.searchParams.get('labels') ?? 'naive');

	const stats = $derived(data.stats);
	const totalClaims = $derived(stats?.total_claims ?? 0);
	const labelDist = $derived(stats?.label_distribution ?? {});
	const exaggerated = $derived(labelDist.exaggerated ?? 0);
	const accurate = $derived(labelDist.accurate ?? 0);
	const understated = $derived(labelDist.understated ?? 0);

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

	// === Server-side paginated table ===
	const PAGE_SIZE = 50;

	// The SSR data gives us the newest page of claims (fetched from end of dataset)
	// API returns oldest-first, so reverse to show newest-first
	const initialClaims = $derived([...(data.feed?.claims ?? [])].reverse() as Claim[]);

	let tableClaims: Claim[] = $state([]);
	let currentPage = $state(0);
	let loading = $state(false);

	let activeFilter: string | null = $state(null);
	let activeTicker: string | null = $state(null);

	// Initialize tableClaims from SSR data
	$effect(() => {
		if (initialClaims.length > 0 && tableClaims.length === 0) {
			tableClaims = initialClaims;
		}
	});

	// Total count depends on active label filter
	const totalCount = $derived.by(() => {
		if (activeFilter) {
			return labelDist[activeFilter] ?? 0;
		}
		return totalClaims;
	});

	const totalPages = $derived(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));

	// Available tickers from currently loaded claims
	const availableTickers = $derived(
		[...new Set(tableClaims.map((c) => c.ticker).filter(Boolean))].sort()
	);

	// Apply ticker filter client-side (API doesn't support ticker param)
	const displayClaims = $derived(
		activeTicker ? tableClaims.filter((c) => c.ticker === activeTicker) : tableClaims
	);

	// Fetch a specific page of claims from the server
	async function fetchPage(page: number) {
		loading = true;
		try {
			const total = totalCount;
			// API returns oldest-first. To show newest-first, calculate offset from end.
			// Page 0 = newest claims, Page 1 = next newest, etc.
			const offsetFromEnd = (page + 1) * PAGE_SIZE;
			const offset = Math.max(0, total - offsetFromEnd);
			const limit = Math.min(PAGE_SIZE, total - page * PAGE_SIZE);

			if (limit <= 0) {
				tableClaims = [];
				return;
			}

			const labelParam = activeFilter ? `&label=${activeFilter}` : '';
			const res = await fetch(`/api/feed/more?limit=${limit}&offset=${offset}${labelParam}&labels=${currentLabels}`);
			if (!res.ok) throw new Error(`${res.status}`);
			const result = await res.json();
			const claims: Claim[] = result.claims ?? [];

			// Reverse to show newest-first
			tableClaims = [...claims].reverse();
		} catch (e) {
			console.error('Failed to fetch claims:', e);
		} finally {
			loading = false;
		}
	}

	function goToPage(page: number) {
		if (page < 0 || page >= totalPages || page === currentPage) return;
		currentPage = page;
		fetchPage(page);
	}

	function setFilter(label: string | null) {
		activeFilter = activeFilter === label ? null : label;
		activeTicker = null;
		currentPage = 0;
		fetchPage(0);
	}

	function setTicker(ticker: string | null) {
		activeTicker = activeTicker === ticker ? null : ticker;
	}

	// === Recent Activity (latest 15 claims from SSR data) ===
	const recentClaims = $derived(initialClaims.slice(0, 15));

	const claimColumns = [
		{ key: 'time', label: 'Time', width: '140px' },
		{ key: 'ticker', label: 'Ticker', width: '70px' },
		{ key: 'user', label: 'User', width: '110px' },
		{ key: 'text', label: 'Claim' },
		{ key: 'label', label: 'Label', width: '110px' },
		{ key: 'direction', label: 'Direction', width: '100px' },
		{ key: 'price_change', label: 'Price Chg', width: '90px' }
	];

	// Sidebar data
	const topTickers = $derived(stats?.top_tickers ?? []);
	const topExaggerators = $derived(stats?.most_exaggerated_users ?? []);

	// Claim detail modal
	let modalOpen = $state(false);
	let selectedClaim: Claim | null = $state(null);

	function openClaim(index: number) {
		selectedClaim = displayClaims[index] ?? null;
		if (selectedClaim) modalOpen = true;
	}

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

	// Claim popup state
	let popupOpen = $state(false);
	let selectedClaim: Claim | null = $state(null);

	function openClaim(claim: Claim) {
		selectedClaim = claim;
		popupOpen = true;
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
			<LabelerToggle />
			<Badge variant="default">{totalClaims.toLocaleString()} TOTAL CLAIMS</Badge>
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
				<ThreatMeter
					level={totalClaims > 0
						? Math.min(Math.round((exaggerated / totalClaims) * 5), 5)
						: 0}
				/>
			</HUDPanel>

			<HUDPanel title="Top Tickers">
				<div class="space-y-3">
					{#each topTickers.slice(0, 6) as t (t.ticker)}
						<div class="flex items-center justify-between">
							<a
								href="/intel/{t.ticker}"
								class="font-mono text-xs text-holo transition-colors hover:text-holo-bright"
							>
								{t.ticker}
							</a>
							<span class="font-mono text-[10px] tabular-nums text-text-dim">{t.count}</span
							>
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
							<a
								href="/accounts/{user.username}"
								class="font-mono text-xs text-holo transition-colors hover:text-holo-bright"
							>
								@{user.username}
							</a>
							<span class="font-mono text-[10px] tabular-nums text-warning"
								>{user.count}</span
							>
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
			<!-- Recent Activity -->
			<HUDPanel title="Recent Activity" glow={true}>
				<div class="recent-feed h-80 space-y-2 overflow-y-auto">
					{#each recentClaims as claim (claim.tweet_id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="claim-entry flex items-start gap-3 border-b border-surface-border/30 pb-2 cursor-pointer hover:bg-holo-dark/20 transition-colors rounded px-1"
							onclick={() => openClaim(claim)}
						>
							<div class="flex-shrink-0 pt-0.5">
								<Badge variant={labelVariant(claim.label)}>
									{claim.label?.toUpperCase() ?? '?'}
								</Badge>
							</div>
							<div class="min-w-0 flex-1">
								<div class="mb-0.5 flex items-center gap-2">
									<a
										href="/accounts/{claim.username}"
										class="font-mono text-[11px] text-holo transition-colors hover:text-holo-bright"
									>
										@{claim.username}
									</a>
									<a
										href="/intel/{claim.ticker}"
										class="font-mono text-[10px] text-text-dim transition-colors hover:text-holo"
									>
										{claim.ticker}
									</a>
									{#if claim.price_change_pct != null}
										<span
											class="font-mono text-[10px] {claim.price_change_pct >= 0
												? 'text-holo'
												: 'text-danger'}"
										>
											{claim.price_change_pct >= 0 ? '+' : ''}{claim.price_change_pct.toFixed(
												2
											)}%
										</span>
									{/if}
									<span class="ml-auto font-mono text-[9px] text-text-dim/50">
										{claim.created_at
											? new Date(claim.created_at).toLocaleString('en-US', {
													month: 'short',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})
											: ''}
									</span>
								</div>
								<p class="font-mono text-xs leading-relaxed text-text-primary/80">
									{claim.text
										? claim.text.length > 120
											? claim.text.substring(0, 120) + '...'
											: claim.text
										: '—'}
								</p>
							</div>
						</div>
					{/each}
					{#if recentClaims.length === 0}
						<div class="flex h-full items-center justify-center">
							<p class="font-mono text-xs text-text-dim">
								No recent claims available.
							</p>
						</div>
					{/if}
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-surface-border/50 pt-3"
				>
					<span class="font-mono text-[10px] text-text-dim">
						Showing {recentClaims.length} most recent claims
					</span>
					<div class="flex items-center gap-4">
						<div class="text-center">
							<span class="font-display text-sm text-holo"
								><CountUp target={totalClaims} duration={2000} /></span
							>
							<span class="ml-1 font-mono text-[9px] text-text-dim">TOTAL</span>
						</div>
						<div class="text-center">
							<span class="font-display text-sm text-warning"
								><CountUp target={exaggerated} duration={1800} /></span
							>
							<span class="ml-1 font-mono text-[9px] text-text-dim">FLAGGED</span>
						</div>
					</div>
				</div>
			</HUDPanel>

			<!-- Claims Table -->
			<HUDPanel title="All Claims — {totalCount.toLocaleString()} total">
				<!-- Filters row -->
				<div class="mb-4 flex flex-col gap-3">
					<!-- Label filters -->
					<div class="flex flex-wrap gap-2">
						<button
							class="filter-btn"
							class:active={activeFilter === null}
							onclick={() => setFilter(null)}>ALL</button
						>
						<button
							class="filter-btn"
							class:active={activeFilter === 'exaggerated'}
							onclick={() => setFilter('exaggerated')}>EXAGGERATED</button
						>
						<button
							class="filter-btn"
							class:active={activeFilter === 'accurate'}
							onclick={() => setFilter('accurate')}>ACCURATE</button
						>
						<button
							class="filter-btn"
							class:active={activeFilter === 'understated'}
							onclick={() => setFilter('understated')}>UNDERSTATED</button
						>
					</div>

					<!-- Ticker filter -->
					{#if availableTickers.length > 0}
						<div class="flex flex-wrap gap-1.5">
							<button
								class="filter-btn ticker-btn"
								class:active={activeTicker === null}
								onclick={() => setTicker(null)}>ALL TICKERS</button
							>
							{#each availableTickers as ticker (ticker)}
								<button
									class="filter-btn ticker-btn"
									class:active={activeTicker === ticker}
									onclick={() => setTicker(ticker)}>{ticker}</button
								>
							{/each}
						</div>
					{/if}
				</div>

				{#if loading}
					<div class="flex items-center justify-center py-12">
						<p class="font-mono text-sm text-holo animate-pulse">LOADING CLAIMS...</p>
					</div>
				{:else if displayClaims.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full border-collapse font-mono text-sm">
							<thead>
								<tr class="border-b border-holo-dim/50 bg-holo-dark/30">
									{#each claimColumns as col (col.key)}
										<th
											class="px-4 py-2.5 text-left font-display text-[10px] font-semibold tracking-[0.2em] uppercase text-holo"
											style={col.width ? `width: ${col.width}` : ''}
										>
											{col.label}
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each displayClaims as claim, i (claim.tweet_id ?? i)}
									<tr
										class="border-b border-surface-border transition-colors hover:bg-holo-dark/20 hover:shadow-[inset_0_0_20px_rgba(0,212,255,0.03)] cursor-pointer"
										style="animation: fade-in-up 0.3s ease-out {Math.min(i, 10) * 50}ms both;"
										onclick={() => openClaim(claim)}
									>
										<td class="px-4 py-2.5 text-text-primary">
											{claim.created_at
												? new Date(claim.created_at).toLocaleString('en-US', {
														month: 'short',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})
												: '—'}
										</td>
										<td class="px-4 py-2.5 text-text-primary">{claim.ticker ?? '—'}</td>
										<td class="px-4 py-2.5 text-text-primary">@{claim.username ?? '?'}</td>
										<td class="px-4 py-2.5 text-text-primary">
											{claim.text ? (claim.text.length > 60 ? claim.text.substring(0, 60) + '...' : claim.text) : '—'}
										</td>
										<td class="px-4 py-2.5 text-text-primary">{claim.label ? claim.label.toUpperCase() : '—'}</td>
										<td class="px-4 py-2.5 text-text-primary">{claim.claimed_direction ?? '?'} → {claim.actual_direction ?? '?'}</td>
										<td class="px-4 py-2.5 text-text-primary">
											{claim.price_change_pct != null
												? `${claim.price_change_pct >= 0 ? '+' : ''}${claim.price_change_pct.toFixed(2)}%`
												: '—'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No claims found{activeFilter ? ` with label "${activeFilter}"` : ''}{activeTicker
							? ` for ${activeTicker}`
							: ''}.
					</p>
				{/if}

				<!-- Pagination -->
				<div
					class="mt-4 flex items-center justify-between border-t border-surface-border/50 pt-3"
				>
					<span class="font-mono text-[10px] text-text-dim">
						Page {currentPage + 1} of {totalPages}
					</span>
					<div class="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							disabled={currentPage === 0 || loading}
							onclick={() => goToPage(0)}
						>
							FIRST
						</Button>
						<Button
							variant="ghost"
							size="sm"
							disabled={currentPage === 0 || loading}
							onclick={() => goToPage(currentPage - 1)}
						>
							PREV
						</Button>
						<span class="font-mono text-[10px] tabular-nums text-text-dim">
							{currentPage + 1} / {totalPages}
						</span>
						<Button
							variant="ghost"
							size="sm"
							disabled={currentPage >= totalPages - 1 || loading}
							onclick={() => goToPage(currentPage + 1)}
						>
							NEXT
						</Button>
						<Button
							variant="ghost"
							size="sm"
							disabled={currentPage >= totalPages - 1 || loading}
							onclick={() => goToPage(totalPages - 1)}
						>
							LAST
						</Button>
					</div>
				</div>
			</HUDPanel>

			<!-- Label Distribution -->
			<HUDPanel title="Label Distribution">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-3">
						<ProgressBar
							value={totalClaims > 0 ? Math.round((accurate / totalClaims) * 100) : 0}
							label="Accurate"
							variant="default"
						/>
						<ProgressBar
							value={totalClaims > 0
								? Math.round((exaggerated / totalClaims) * 100)
								: 0}
							label="Exaggerated"
							variant="warning"
						/>
						<ProgressBar
							value={totalClaims > 0
								? Math.round((understated / totalClaims) * 100)
								: 0}
							label="Understated"
							variant="info"
						/>
					</div>
					<div class="space-y-3">
						{#each Object.entries(stats?.catalyst_type_distribution ?? {}).slice(0, 3) as [type, count] (type)}
							<ProgressBar
								value={totalClaims > 0
									? Math.round(((count as number) / totalClaims) * 100)
									: 0}
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

<ClaimPopup bind:open={popupOpen} claim={selectedClaim} />

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

	.recent-feed::-webkit-scrollbar {
		width: 4px;
	}

	.recent-feed::-webkit-scrollbar-track {
		background: rgba(4, 10, 18, 0.5);
	}

	.recent-feed::-webkit-scrollbar-thumb {
		background: rgba(0, 212, 255, 0.3);
	}
</style>
