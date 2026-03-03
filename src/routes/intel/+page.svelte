<script lang="ts">
	import { onMount } from 'svelte';
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

	let { data } = $props();

	const tickerNames: Record<string, string> = data.stocks?.ticker_names ?? {};
	const stats = data.stats;
	const accuracyByTicker = stats?.accuracy_by_ticker ?? [];
	const topTickers = stats?.top_tickers ?? [];
	const totalClaims = stats?.total_claims ?? 0;
	const exaggerated = stats?.label_distribution?.exaggerated ?? 0;

	// Stock universe table
	const stockColumns = [
		{ key: 'ticker', label: 'Ticker', width: '80px' },
		{ key: 'company', label: 'Company' },
		{ key: 'claims', label: 'Claims', width: '80px' },
		{ key: 'accurate', label: 'Accurate', width: '80px' },
		{ key: 'exaggerated', label: 'Exaggerated', width: '100px' },
		{ key: 'accuracy_pct', label: 'Accuracy %', width: '100px' }
	];

	const stockRows = $derived(
		Object.entries(tickerNames).map(([ticker, name]) => {
			const acc = accuracyByTicker.find((a) => a.ticker === ticker);
			return {
				ticker,
				company: name,
				claims: acc?.total ?? 0,
				accurate: acc?.accurate ?? 0,
				exaggerated: acc?.exaggerated ?? 0,
				accuracy_pct: acc && acc.total > 0
					? `${((acc.accurate / acc.total) * 100).toFixed(1)}%`
					: '—'
			};
		}).sort((a, b) => (b.claims as number) - (a.claims as number))
	);

	// Tweet analyzer
	let tweetText = $state('');
	let analyzerTicker = $state('');
	let analyzing = $state(false);

	interface AnalyzeResult {
		label: string;
		confidence: number;
		ticker: string;
		company_name: string;
		claimed_direction: string;
		actual_direction: string;
		has_catalyst: boolean;
		catalyst_type: string | null;
		news_headlines: string[];
		price_change_24h: number | null;
		explanation: string;
	}

	let analyzeResult: AnalyzeResult | null = $state(null);
	let analyzeError: string | null = $state(null);

	async function analyzeTweet() {
		if (!tweetText.trim()) return;
		analyzing = true;
		analyzeResult = null;
		analyzeError = null;

		try {
			const body: Record<string, string> = { tweet_text: tweetText };
			if (analyzerTicker.trim()) body.ticker = analyzerTicker.trim().toUpperCase();

			const res = await fetch('http://localhost:5000/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const err = await res.json();
				analyzeError = err.error || `Error: ${res.status}`;
				return;
			}

			analyzeResult = await res.json();
		} catch (e) {
			analyzeError = 'Failed to connect to API. Is the Flask server running?';
		} finally {
			analyzing = false;
		}
	}

	// Self-healing feed statuses
	interface FeedStatus {
		label: string;
		status: 'online' | 'warning' | 'critical';
		healing: boolean;
	}

	let feeds: FeedStatus[] = $state([
		{ label: 'Twitter Scraper', status: 'online', healing: false },
		{ label: 'Price Feed', status: 'online', healing: false },
		{ label: 'News Feed', status: 'online', healing: false },
		{ label: 'Labeler Engine', status: 'online', healing: false },
		{ label: 'Database', status: 'online', healing: false }
	]);

	onMount(() => {
		function triggerFeedWarning() {
			const onlineIndexes = feeds
				.map((f, i) => (f.status === 'online' && !f.healing ? i : -1))
				.filter((i) => i >= 0);
			if (onlineIndexes.length === 0) return;

			const idx = onlineIndexes[Math.floor(Math.random() * onlineIndexes.length)];
			feeds[idx].status = 'warning';

			setTimeout(() => {
				feeds[idx].healing = true;
				setTimeout(
					() => {
						feeds[idx].status = 'online';
						feeds[idx].healing = false;
					},
					1000 + Math.random() * 1000
				);
			}, 2000 + Math.random() * 2000);
		}

		const interval = setInterval(
			() => triggerFeedWarning(),
			8000 + Math.random() * 7000
		);
		const firstTimeout = setTimeout(() => triggerFeedWarning(), 4000);

		return () => {
			clearInterval(interval);
			clearTimeout(firstTimeout);
		};
	});

	function labelBadgeVariant(label: string): 'danger' | 'success' | 'info' | 'default' {
		if (label === 'exaggerated') return 'danger';
		if (label === 'accurate') return 'success';
		if (label === 'understated') return 'info';
		return 'default';
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
				Defense stock universe // Claim analysis // Ticker accuracy
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Badge variant="info">{Object.keys(tickerNames).length} TICKERS</Badge>
			<Badge variant="default">{totalClaims} CLAIMS</Badge>
		</div>
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Stock Universe Table -->
		<div class="lg:col-span-2">
			<HUDPanel title="Defense Stock Universe">
				{#if stockRows.length > 0}
					<DataGrid columns={stockColumns} rows={stockRows} />
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No stock data available. Is the API running?
					</p>
				{/if}
			</HUDPanel>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Exaggeration Index -->
			<HUDPanel title="Exaggeration Index" variant="warning">
				<div class="space-y-4">
					<ThreatMeter level={totalClaims > 0 ? Math.min(Math.round((exaggerated / totalClaims) * 5), 5) : 0} label="Current Level" />
					<div class="space-y-2">
						<div class="flex items-center justify-between font-mono text-xs">
							<span class="text-text-dim">Total Claims</span>
							<span class="text-holo">{totalClaims}</span>
						</div>
						<div class="flex items-center justify-between font-mono text-xs">
							<span class="text-text-dim">Exaggerated</span>
							<span class="text-warning">{exaggerated}</span>
						</div>
						<div class="flex items-center justify-between font-mono text-xs">
							<span class="text-text-dim">Tickers Tracked</span>
							<span class="text-holo-accent">{Object.keys(tickerNames).length}</span>
						</div>
					</div>
				</div>
			</HUDPanel>

			<!-- Feed Status -->
			<HUDPanel title="Pipeline Status">
				<div class="space-y-3">
					{#each feeds as feed (feed.label)}
						<div class="flex items-center gap-2">
							<StatusIndicator status={feed.status} label={feed.label} size="sm" />
							{#if feed.healing}
								<span class="healing-badge">HEALING</span>
							{/if}
						</div>
					{/each}
				</div>
			</HUDPanel>
		</div>
	</div>

	<!-- Bottom Row -->
	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<!-- Tweet Analyzer -->
		<HUDPanel title="Claim Analyzer">
			<div class="space-y-4">
				<div>
					<label class="mb-1 block font-mono text-[10px] tracking-wider text-text-dim">TWEET TEXT</label>
					<textarea
						bind:value={tweetText}
						placeholder="Paste a tweet about a defense stock..."
						class="analyze-textarea"
						rows="3"
					></textarea>
				</div>
				<div class="flex items-end gap-3">
					<div class="flex-1">
						<Input bind:value={analyzerTicker} placeholder="Ticker (optional)" label="TICKER" />
					</div>
					<Button
						variant="primary"
						size="sm"
						disabled={analyzing || !tweetText.trim()}
						onclick={analyzeTweet}
					>
						{analyzing ? 'ANALYZING...' : 'ANALYZE'}
					</Button>
				</div>

				{#if analyzeError}
					<AlertBanner variant="danger">
						{analyzeError}
					</AlertBanner>
				{/if}

				{#if analyzeResult}
					<div class="border border-surface-border bg-surface p-4 space-y-3">
						<div class="flex items-center gap-3">
							<Badge variant={labelBadgeVariant(analyzeResult.label)}>
								{analyzeResult.label.toUpperCase()}
							</Badge>
							<span class="font-mono text-xs text-text-dim">
								{analyzeResult.ticker} — {analyzeResult.company_name}
							</span>
							<span class="ml-auto font-display text-lg text-holo">
								{(analyzeResult.confidence * 100).toFixed(0)}%
							</span>
						</div>
						<p class="font-mono text-xs text-text-primary">{analyzeResult.explanation}</p>
						<div class="grid grid-cols-3 gap-2 text-center">
							<div>
								<div class="font-mono text-[10px] text-text-dim">CLAIMED</div>
								<div class="font-mono text-sm text-text-primary">{analyzeResult.claimed_direction}</div>
							</div>
							<div>
								<div class="font-mono text-[10px] text-text-dim">ACTUAL</div>
								<div class="font-mono text-sm text-text-primary">{analyzeResult.actual_direction}</div>
							</div>
							<div>
								<div class="font-mono text-[10px] text-text-dim">24H CHANGE</div>
								<div class="font-mono text-sm text-text-primary">
									{analyzeResult.price_change_24h != null ? `${analyzeResult.price_change_24h >= 0 ? '+' : ''}${analyzeResult.price_change_24h.toFixed(2)}%` : '—'}
								</div>
							</div>
						</div>
						{#if analyzeResult.news_headlines && analyzeResult.news_headlines.length > 0}
							<div>
								<div class="font-mono text-[10px] text-text-dim mb-1">NEWS CATALYSTS</div>
								{#each analyzeResult.news_headlines.slice(0, 3) as headline}
									<p class="font-mono text-xs text-text-primary">• {headline}</p>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</HUDPanel>

		<!-- Per-Ticker Accuracy -->
		<HUDPanel title="Accuracy by Ticker">
			<div class="space-y-3">
				{#each accuracyByTicker.slice(0, 8) as t (t.ticker)}
					<div>
						<div class="mb-1 flex items-center justify-between">
							<span class="font-mono text-xs text-text-primary">{t.ticker}</span>
							<span class="font-mono text-[10px] text-text-dim">
								{t.accurate}/{t.total} accurate
							</span>
						</div>
						<ProgressBar
							value={t.total > 0 ? Math.round((t.accurate / t.total) * 100) : 0}
							variant={t.total > 0 && (t.accurate / t.total) >= 0.6 ? 'default' : 'warning'}
						/>
					</div>
				{/each}
				{#if accuracyByTicker.length === 0}
					<p class="py-4 text-center font-mono text-xs text-text-dim">
						No accuracy data yet. Run the scraper to collect claims.
					</p>
				{/if}
			</div>
		</HUDPanel>
	</div>
</div>

<style>
	.analyze-textarea {
		width: 100%;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		color: rgba(176, 196, 222, 0.9);
		background: rgba(4, 10, 18, 0.8);
		border: 1px solid rgba(26, 48, 80, 0.8);
		padding: 10px 12px;
		resize: vertical;
		transition: border-color 0.2s ease;
	}

	.analyze-textarea:focus {
		outline: none;
		border-color: rgba(0, 212, 255, 0.5);
		box-shadow: 0 0 8px rgba(0, 212, 255, 0.1);
	}

	.analyze-textarea::placeholder {
		color: rgba(74, 96, 128, 0.6);
	}

	.healing-badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9px;
		letter-spacing: 0.1em;
		color: rgba(0, 212, 255, 0.9);
		background: rgba(0, 212, 255, 0.1);
		border: 1px solid rgba(0, 212, 255, 0.3);
		padding: 1px 6px;
		animation: healing-pulse 0.8s ease-in-out infinite;
	}

	@keyframes healing-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>
