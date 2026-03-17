<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import {
		HUDPanel,
		Badge,
		Button,
		Input,
		ThreatMeter,
		AlertBanner,
		ProgressBar,
		LabelerToggle
	} from '$lib/components/ui';
	import { page } from '$app/stores';

	let { data } = $props();

	const tickerNames: Record<string, string> = $derived(data.stocks?.ticker_names ?? {});
	const stats = $derived(data.stats);
	const accuracyByTicker = $derived(stats?.accuracy_by_ticker ?? []);
	const totalClaims = $derived(stats?.total_claims ?? 0);
	const exaggerated = $derived(stats?.label_distribution?.exaggerated ?? 0);
	const currentLabels = $derived($page.url.searchParams.get('labels') ?? 'naive');

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
			const acc = accuracyByTicker.find((a: { ticker: string }) => a.ticker === ticker);
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
			naive?: {
				grifter_score: number | null;
				grifter_category: string;
				total_claims: number;
			};
			improved?: {
				grifter_score: number | null;
				grifter_category: string;
				total_claims: number;
			};
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
			if (selectedModel) body.model = selectedModel;

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

	function grifterBadgeVariant(score: number): 'danger' | 'warning' | 'info' | 'success' {
		if (score >= 0.8) return 'danger';
		if (score >= 0.5) return 'warning';
		if (score >= 0.2) return 'info';
		return 'success';
	}
</script>

<svelte:head>
	<title>SENTINEL // Stocks</title>
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
			<LabelerToggle />
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
					<div class="overflow-x-auto">
						<table class="w-full border-collapse font-mono text-sm">
							<thead>
								<tr class="border-b border-holo-dim/50 bg-holo-dark/30">
									{#each stockColumns as col (col.key)}
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
								{#each stockRows as row, i (row.ticker)}
									<tr
										class="border-b border-surface-border transition-colors hover:bg-holo-dark/20 hover:shadow-[inset_0_0_20px_rgba(0,212,255,0.03)] cursor-pointer"
										style="animation: fade-in-up 0.3s ease-out {i * 50}ms both;"
										onclick={() => window.location.href = `/stocks/${row.ticker}${currentLabels !== 'naive' ? '?labels=' + currentLabels : ''}`}
									>
										<td class="px-4 py-2.5">
											<a href="/stocks/{row.ticker}{currentLabels !== 'naive' ? '?labels=' + currentLabels : ''}" class="text-holo hover:text-holo-bright transition-colors">
												{row.ticker}
											</a>
										</td>
										<td class="px-4 py-2.5 text-text-primary">{row.company}</td>
										<td class="px-4 py-2.5 text-text-primary">{row.claims}</td>
										<td class="px-4 py-2.5 text-text-primary">{row.accurate}</td>
										<td class="px-4 py-2.5 text-text-primary">{row.exaggerated}</td>
										<td class="px-4 py-2.5 text-text-primary">{row.accuracy_pct}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No stock data available. Is the API running?
					</p>
				{/if}
			</HUDPanel>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
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
						<label class="mb-1 block font-mono text-[10px] tracking-wider text-text-dim">MODEL</label>
						<select
							bind:value={selectedModel}
							class="model-select w-full border border-surface-border bg-surface px-3 py-2 font-mono text-xs text-text-primary outline-none transition-colors focus:border-holo"
						>
							<option value="">Auto (first available)</option>
							<optgroup label="Naive Labeler">
								<option value="baseline/naive_labeler">Baseline / Naive</option>
								<option value="classical/naive_labeler">Classical / Naive</option>
								<option value="neural/naive_labeler" disabled>Neural / Naive — BERTweet needs a GPU, not a $5 VPS</option>
							</optgroup>
							<optgroup label="Improved Labeler">
								<option value="baseline/improved_labeler">Baseline / Improved</option>
								<option value="classical/improved_labeler">Classical / Improved</option>
								<option value="neural/improved_labeler" disabled>Neural / Improved — BERTweet needs a GPU, not a $5 VPS</option>
							</optgroup>
						</select>
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
							<div class="border-t border-surface-border/50 pt-2 space-y-2">
								<a href="/accounts/{predictResult.account.username}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">
									@{predictResult.account.username}
								</a>
								<div class="grid grid-cols-2 gap-2">
									{#if predictResult.account.naive}
										<div class="border border-surface-border/50 p-2">
											<div class="font-mono text-[9px] text-text-dim mb-1">NAIVE LABELER</div>
											{#if predictResult.account.naive.grifter_score != null}
												<Badge variant={grifterBadgeVariant(predictResult.account.naive.grifter_score)}>
													{(predictResult.account.naive.grifter_score * 100).toFixed(0)}% GRIFTER
												</Badge>
											{/if}
											<div class="font-mono text-[10px] text-text-dim mt-1">
												{predictResult.account.naive.total_claims} claims
											</div>
										</div>
									{/if}
									{#if predictResult.account.improved}
										<div class="border border-surface-border/50 p-2">
											<div class="font-mono text-[9px] text-text-dim mb-1">IMPROVED LABELER</div>
											{#if predictResult.account.improved.grifter_score != null}
												<Badge variant={grifterBadgeVariant(predictResult.account.improved.grifter_score)}>
													{(predictResult.account.improved.grifter_score * 100).toFixed(0)}% GRIFTER
												</Badge>
											{/if}
											<div class="font-mono text-[10px] text-text-dim mt-1">
												{predictResult.account.improved.total_claims} claims
											</div>
										</div>
									{/if}
								</div>
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
							<a href="/stocks/{t.ticker}{currentLabels !== 'naive' ? '?labels=' + currentLabels : ''}" class="font-mono text-xs text-holo hover:text-holo-bright transition-colors">{t.ticker}</a>
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
	.model-select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300d4ff' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 8px center;
		padding-right: 28px;
	}

	.model-select option,
	.model-select optgroup {
		background: #0a1628;
		color: #b0c4de;
	}
</style>
