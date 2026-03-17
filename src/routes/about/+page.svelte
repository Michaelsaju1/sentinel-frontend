<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import {
		HUDPanel,
		GlitchText,
		TypewriterText,
		Badge,
		ProgressBar,
		HexGrid,
		CommandLine
	} from '$lib/components/ui';

	const initLog = [
		{ type: 'input' as const, text: 'cat /etc/sentinel/mission.brief' },
		{ type: 'output' as const, text: '===============================' },
		{ type: 'output' as const, text: ' SENTINEL CREDIBILITY PLATFORM' },
		{ type: 'output' as const, text: ' PRODUCT OVERVIEW // v3.1' },
		{ type: 'output' as const, text: '===============================' },
		{ type: 'output' as const, text: '' },
		{
			type: 'output' as const,
			text: 'PRIMARY OBJECTIVE: Track and score credibility'
		},
		{
			type: 'output' as const,
			text: 'of defense stock social media claims in real-time.'
		},
		{ type: 'output' as const, text: '' },
		{
			type: 'success' as const,
			text: 'Mission parameters loaded. All pipelines active.'
		}
	];

	const capabilities = [
		{
			name: 'Bot-Free Signal',
			desc: 'LLM-as-judge filters out automated news tickers, repost bots, and spam accounts before analysis. Only human opinions are evaluated.',
			progress: 92
		},
		{
			name: 'Grifter Score',
			desc: 'Track each account\'s claims over time. What percentage were exaggerated vs. accurate? Surfaces who consistently hypes and who has real insight.',
			progress: 88
		},
		{
			name: 'Real-Time Prediction',
			desc: 'Score new tweets using trained ML models. See predictions before the 24h price window closes, with confidence scores and account credibility.',
			progress: 95
		},
		{
			name: 'News Context',
			desc: 'Relevant news articles linked to specific tweets, so users can see what actually happened and compare claims against reality.',
			progress: 85
		}
	];

	const scoreCategories = [
		{ range: '0% – 20%', label: 'HIGH SIGNAL', desc: 'Mostly right — worth following', variant: 'default' as const },
		{ range: '20% – 50%', label: 'NORMAL', desc: 'Mixed — average FinTwit user', variant: 'default' as const },
		{ range: '50% – 80%', label: 'MOSTLY WRONG', desc: 'More wrong than right', variant: 'warning' as const },
		{ range: '80% – 100%', label: 'GRIFTER', desc: 'Consistently exaggerates — noise', variant: 'danger' as const }
	];
</script>

<svelte:head>
	<title>SENTINEL // About</title>
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden border-b border-surface-border py-20">
	<div class="absolute inset-0 opacity-30">
		<HexGrid opacity={0.06} />
	</div>

	<div class="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
		<Badge variant="info" class="mb-6">DEFENSE STOCK CREDIBILITY</Badge>
		<h1 class="mb-4">
			<GlitchText tag="span" class="block font-display text-4xl font-bold tracking-wider text-text-bright md:text-5xl" intensity="low">
				ABOUT SENTINEL
			</GlitchText>
		</h1>
		<div class="mx-auto h-8 max-w-2xl">
			<TypewriterText
				text="A credibility dashboard for defense stock social media claims. Track who's full of it and who's been right."
				speed={30}
				delay={300}
				class="text-sm text-text-dim md:text-base"
			/>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-4 py-12 lg:px-8">
	<!-- Mission Terminal -->
	<div class="mb-12">
		<HUDPanel title="Mission Brief">
			<CommandLine lines={initLog} prompt="operator@sentinel:~$" />
		</HUDPanel>
	</div>

	<!-- Core Capabilities -->
	<div class="mb-12">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">CORE CAPABILITIES</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			{#each capabilities as cap (cap.name)}
				<HUDPanel title={cap.name}>
					<p class="mb-4 font-mono text-xs leading-relaxed text-text-dim">{cap.desc}</p>
					<ProgressBar value={cap.progress} label="Readiness" variant="default" />
				</HUDPanel>
			{/each}
		</div>
	</div>

	<!-- Grifter Score Explanation -->
	<div class="mb-12">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">CREDIBILITY SCORING</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<HUDPanel title="Grifter Score">
				<div class="space-y-4">
					<p class="font-mono text-xs leading-relaxed text-text-dim">
						The Grifter Score measures what percentage of an account's claims were exaggerated.
						A score of 0% means every claim was accurate. A score of 100% means every claim was exaggerated.
					</p>
					<div class="border border-surface-border bg-surface/50 p-3">
						<code class="font-mono text-xs text-holo">
							grifter_score = exaggerated_count / total_labeled_claims
						</code>
					</div>
					<p class="font-mono text-[10px] text-text-dim">
						Only scored after a minimum of 5 labeled claims to avoid noise from low-activity accounts.
					</p>
				</div>
			</HUDPanel>

			<HUDPanel title="Score Categories">
				<div class="space-y-3">
					{#each scoreCategories as cat (cat.label)}
						<div class="flex items-center justify-between border-b border-surface-border/50 pb-2">
							<div>
								<Badge variant={cat.variant}>{cat.label}</Badge>
								<p class="mt-1 font-mono text-[10px] text-text-dim">{cat.desc}</p>
							</div>
							<span class="font-mono text-xs text-holo">{cat.range}</span>
						</div>
					{/each}
				</div>
			</HUDPanel>
		</div>
	</div>

	<!-- How It Works -->
	<div class="mb-12">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px flex-1 bg-surface-border"></div>
			<h2 class="font-display text-xs tracking-[0.3em] text-text-dim">HOW IT WORKS</h2>
			<div class="h-px flex-1 bg-surface-border"></div>
		</div>

		<HUDPanel title="Pipeline Overview">
			<div class="grid gap-6 md:grid-cols-3">
				<div class="space-y-2">
					<div class="font-display text-sm text-holo">01 // COLLECT</div>
					<p class="font-mono text-xs leading-relaxed text-text-dim">
						Scrape defense stock tweets, collect 24h price changes, and gather relevant news articles for context.
					</p>
				</div>
				<div class="space-y-2">
					<div class="font-display text-sm text-holo">02 // CLASSIFY</div>
					<p class="font-mono text-xs leading-relaxed text-text-dim">
						ML models label each claim as exaggerated, accurate, or understated. LLM-as-judge identifies bot accounts.
					</p>
				</div>
				<div class="space-y-2">
					<div class="font-display text-sm text-holo">03 // SCORE</div>
					<p class="font-mono text-xs leading-relaxed text-text-dim">
						Aggregate labels per account to compute grifter scores. Track credibility over time and surface patterns.
					</p>
				</div>
			</div>
		</HUDPanel>
	</div>
</div>
