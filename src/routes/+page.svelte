<script lang="ts">
	import { onMount } from 'svelte';
	import {
		GlobeNetwork,
		HUDPanel,
		RadarScan,
		StatsCard,
		CommandLine,
		ThreatMeter,
		StatusIndicator,
		ProgressBar,
		Badge,
		CountUp
	} from '$lib/components/ui';

	let { data } = $props();

	const stats = $derived(data.stats);
	const totalClaims = $derived(stats?.total_claims ?? 0);
	const exaggerated = $derived(stats?.label_distribution?.exaggerated ?? 0);
	const accurate = $derived(stats?.label_distribution?.accurate ?? 0);
	const understated = $derived(stats?.label_distribution?.understated ?? 0);
	const accuracyRate = $derived(totalClaims > 0 ? ((accurate / totalClaims) * 100).toFixed(1) : '0');
	const topTickerCount = $derived(stats?.top_tickers?.length ?? 0);

	const topTickers = $derived(stats?.top_tickers ?? []);
	const topExaggerators = $derived(stats?.most_exaggerated_users ?? []);

	const terminalLines = $derived([
		{ type: 'input' as const, text: 'sentinel --init --mode=credibility-analysis' },
		{ type: 'success' as const, text: 'Credibility scoring engine online.' },
		{ type: 'input' as const, text: 'scan --target=defense-stocks --source=twitter' },
		{
			type: 'output' as const,
			text: `Tracking ${topTickerCount} defense tickers across social media...`
		},
		{
			type: 'success' as const,
			text: `${totalClaims.toLocaleString()} claims labeled. ${exaggerated.toLocaleString()} exaggerated, ${accurate.toLocaleString()} accurate, ${understated.toLocaleString()} understated.`
		},
		{ type: 'input' as const, text: 'status' },
		{
			type: 'output' as const,
			text: `Scraper: ACTIVE | Labeler: ACTIVE | Bot Filter: ACTIVE | Accuracy: ${accuracyRate}%`
		},
		{ type: 'success' as const, text: 'All pipelines nominal.' }
	]);

	const terminalStats = $derived({
		totalClaims,
		exaggerated,
		accurate,
		understated,
		accuracyRate,
		topTickerCount,
		topTickers,
		topExaggerators
	});

	// ===== Self-healing status system =====
	interface LiveStatus {
		label: string;
		status: 'online' | 'warning' | 'critical';
		healing: boolean;
	}

	let statuses: LiveStatus[] = $state([
		{ label: 'Twitter Scraper', status: 'online', healing: false },
		{ label: 'Price Feed', status: 'online', healing: false },
		{ label: 'Bot Classifier', status: 'online', healing: false },
		{ label: 'Labeler Engine', status: 'online', healing: false }
	]);

	onMount(() => {
		function triggerWarning() {
			const onlineIndexes = statuses
				.map((s, i) => (s.status === 'online' && !s.healing ? i : -1))
				.filter((i) => i >= 0);
			if (onlineIndexes.length === 0) return;

			const idx = onlineIndexes[Math.floor(Math.random() * onlineIndexes.length)];
			statuses[idx].status = 'warning';
			statuses[idx].healing = false;

			const healDelay = 2000 + Math.random() * 2000;
			setTimeout(() => {
				statuses[idx].healing = true;
				setTimeout(
					() => {
						statuses[idx].status = 'online';
						statuses[idx].healing = false;
					},
					1000 + Math.random() * 1000
				);
			}, healDelay);
		}

		const interval = setInterval(
			() => triggerWarning(),
			6000 + Math.random() * 6000
		);

		const firstTimeout = setTimeout(() => triggerWarning(), 3000);

		return () => {
			clearInterval(interval);
			clearTimeout(firstTimeout);
		};
	});
</script>

<svelte:head>
	<title>SENTINEL // Home</title>
</svelte:head>

<!-- ===== Dashboard ===== -->
<div>
		<!-- Stats Row -->
		<section class="border-b border-surface-border bg-surface-light/30 py-12">
			<div class="mx-auto max-w-7xl px-4 lg:px-8">
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatsCard
						label="Claims Analyzed"
						value={totalClaims.toLocaleString()}
						change="{topTickerCount} tickers"
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
						change="{accuracyRate}%"
						trend="up"
					/>
					<StatsCard
						label="Understated"
						value={understated.toLocaleString()}
						change="{totalClaims > 0 ? ((understated / totalClaims) * 100).toFixed(1) : '0'}%"
						trend="neutral"
					/>
				</div>
			</div>
		</section>

		<!-- Operations Center -->
		<section class="py-16">
			<div class="mx-auto max-w-7xl px-4 lg:px-8">
				<div class="mb-10 flex items-center gap-4">
					<div class="h-px flex-1 bg-surface-border"></div>
					<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">
						CREDIBILITY OVERVIEW
					</h2>
					<div class="h-px flex-1 bg-surface-border"></div>
				</div>

				<div class="grid gap-6 lg:grid-cols-3">
					<!-- Radar & Status -->
					<div class="lg:col-span-1">
						<HUDPanel title="Pipeline Monitor" glow={true}>
							<div class="flex flex-col items-center gap-4">
								<RadarScan size={180} />
								<div class="w-full space-y-3 pt-2">
									{#each statuses as s (s.label)}
										<div class="flex items-center gap-2">
											<StatusIndicator status={s.status} label={s.label} size="sm" />
											{#if s.healing}
												<span class="healing-badge">HEALING</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						</HUDPanel>
					</div>

					<!-- Terminal -->
					<div class="lg:col-span-2">
						<HUDPanel title="System Log">
							<CommandLine lines={terminalLines} stats={terminalStats} />
						</HUDPanel>
					</div>
				</div>

				<!-- Second Row -->
				<div class="mt-6 grid gap-6 lg:grid-cols-2">
					<!-- Claim Analysis -->
					<HUDPanel title="Claim Analysis">
						<div class="space-y-5">
							<ThreatMeter level={totalClaims > 0 ? Math.min(Math.round((exaggerated / totalClaims) * 5), 5) : 0} label="Exaggeration Level" />
							<div class="space-y-3">
								<ProgressBar value={totalClaims > 0 ? Math.round((accurate / totalClaims) * 100) : 0} label="Accurate Claims" variant="default" />
								<ProgressBar value={totalClaims > 0 ? Math.round((exaggerated / totalClaims) * 100) : 0} label="Exaggerated Claims" variant="warning" />
								<ProgressBar value={totalClaims > 0 ? Math.round((understated / totalClaims) * 100) : 0} label="Understated Claims" variant="info" />
								<ProgressBar value={totalClaims > 0 ? Math.round(((Object.values(stats?.catalyst_type_distribution ?? {}).reduce((a: number, b: number) => a + b, 0) as number) / totalClaims) * 100) : 0} label="Catalyst Coverage" variant="danger" />
							</div>
							<div class="flex flex-wrap gap-2 pt-2">
								<Badge variant="success">LABELER ACTIVE</Badge>
								<Badge variant="info">SCRAPER ACTIVE</Badge>
								<Badge variant="warning" pulse={true}>MONITORING</Badge>
								</div>
						</div>
					</HUDPanel>

					<!-- Ticker Coverage (Globe in small panel) -->
					<HUDPanel title="Ticker Coverage">
						<div class="h-64">
							<GlobeNetwork nodeCount={30} rotationSpeed={0.003} />
						</div>
						<div class="mt-4 grid grid-cols-3 gap-3">
							<div class="text-center">
								<div class="font-display text-xl text-holo">
									<CountUp target={totalClaims} duration={2000} />
								</div>
								<div class="font-mono text-[10px] tracking-wider text-text-dim">
									CLAIMS
								</div>
							</div>
							<div class="text-center">
								<div class="font-display text-xl text-holo-accent">
									<CountUp target={topTickerCount} duration={1500} />
								</div>
								<div class="font-mono text-[10px] tracking-wider text-text-dim">
									TICKERS
								</div>
							</div>
							<div class="text-center">
								<div class="font-display text-xl text-warning">
									<CountUp target={exaggerated} duration={1800} />
								</div>
								<div class="font-mono text-[10px] tracking-wider text-text-dim">
									FLAGGED
								</div>
							</div>
						</div>
					</HUDPanel>
				</div>
			</div>
		</section>
	</div>

<style>
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
