<script lang="ts">
	import {
		HUDPanel,
		DataGrid,
		Badge,
		Button,
		Input,
		ThreatMeter,
		AlertBanner,
		ProgressBar
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

	// Tweet predictor
	let tweetUrl = $state('');
	let selectedModel = $state('');
	let predicting = $state(false);

	interface PredictResult {
		label: string;
		confidence?: number;
		model: string;
		available_models: string[];
		account?: {
			username: string;
			grifter_score: number | null;
			grifter_category: string;
			total_claims: number;
		};
	}

	let predictResult: PredictResult | null = $state(null);
	let predictError: string | null = $state(null);

	async function predictTweet() {
		if (!tweetUrl.trim()) return;
		predicting = true;
		predictResult = null;
		predictError = null;

		try {
			const body: Record<string, string> = { url: tweetUrl.trim() };
			if (selectedModel.trim()) body.model = selectedModel.trim();

			const res = await fetch('/api/predict', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const err = await res.json();
				predictError = err.error || `Error: ${res.status}`;
				return;
			}

			predictResult = await res.json();
		} catch {
			predictError = 'Failed to connect to API. Is the backend running?';
		} finally {
			predicting = false;
		}
	}

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
				DEFENSE STOCKS
			</h1>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Stock universe // Credibility metrics // Ticker accuracy
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

			<!-- Top Tickers -->
			<HUDPanel title="Most Active Tickers">
				<div class="space-y-3">
					{#each topTickers.slice(0, 8) as t (t.ticker)}
						<div class="flex items-center justify-between">
							<a href="/intel/{t.ticker}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
								{t.ticker}
							</a>
							<span class="font-mono text-[10px] tabular-nums text-text-dim">{t.count} claims</span>
						</div>
					{/each}
					{#if topTickers.length === 0}
						<p class="font-mono text-xs text-text-dim">No data yet</p>
					{/if}
				</div>
			</HUDPanel>
		</div>
	</div>

	<!-- Bottom Row -->
	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<!-- Tweet Predictor -->
		<HUDPanel title="Claim Predictor">
			<div class="space-y-4">
				<div>
					<label class="mb-1 block font-mono text-[10px] tracking-wider text-text-dim">TWEET URL</label>
					<Input
						bind:value={tweetUrl}
						placeholder="https://x.com/user/status/123..."
						label=""
					/>
				</div>
				<div class="flex items-end gap-3">
					<div class="flex-1">
						<Input bind:value={selectedModel} placeholder="Model (optional)" label="MODEL" />
					</div>
					<Button
						variant="primary"
						size="sm"
						disabled={predicting || !tweetUrl.trim()}
						onclick={predictTweet}
					>
						{predicting ? 'ANALYZING...' : 'ANALYZE'}
					</Button>
				</div>

				{#if predictError}
					<AlertBanner variant="danger">
						{predictError}
					</AlertBanner>
				{/if}

				{#if predictResult}
					<div class="border border-surface-border bg-surface p-4 space-y-3">
						<div class="flex items-center gap-3">
							<Badge variant={labelBadgeVariant(predictResult.label)}>
								{predictResult.label.toUpperCase()}
							</Badge>
							{#if predictResult.confidence != null}
								<span class="font-mono text-xs text-text-dim">
									{(predictResult.confidence * 100).toFixed(1)}% confidence
								</span>
							{/if}
							<span class="font-mono text-xs text-text-dim">
								Model: {predictResult.model}
							</span>
						</div>
						{#if predictResult.account}
							<div class="flex items-center gap-2 border-t border-surface-border/50 pt-2">
								<a href="/accounts/{predictResult.account.username}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
									@{predictResult.account.username}
								</a>
								{#if predictResult.account.grifter_score != null}
									<Badge variant={predictResult.account.grifter_score >= 0.8 ? 'danger' : predictResult.account.grifter_score >= 0.5 ? 'warning' : predictResult.account.grifter_score >= 0.2 ? 'info' : 'success'}>
										{(predictResult.account.grifter_score * 100).toFixed(0)}% GRIFTER
									</Badge>
								{/if}
								<span class="font-mono text-[10px] text-text-dim">
									{predictResult.account.total_claims} prior claims
								</span>
							</div>
						{/if}
						{#if predictResult.available_models.length > 1}
							<div>
								<div class="font-mono text-[10px] text-text-dim mb-1">AVAILABLE MODELS</div>
								<div class="flex flex-wrap gap-2">
									{#each predictResult.available_models as model (model)}
										<Badge variant={model === predictResult.model ? 'info' : 'default'}>
											{model}
										</Badge>
									{/each}
								</div>
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

