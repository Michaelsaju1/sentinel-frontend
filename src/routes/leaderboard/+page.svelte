<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import {
		HUDPanel,
		Badge,
		LabelerToggle
	} from '$lib/components/ui';
	import { page } from '$app/stores';

	interface LabelerStats {
		total_claims: number;
		exaggerated_count: number;
		accurate_count: number;
		understated_count: number;
		grifter_score: number | null;
		grifter_category: string;
	}

	interface LeaderboardAccount {
		username: string;
		naive: LabelerStats;
		improved: LabelerStats;
	}

	let { data } = $props();

	const grifters: LeaderboardAccount[] = $derived(data.grifters ?? []);
	const signal: LeaderboardAccount[] = $derived(data.signal ?? []);
	const currentLabels = $derived($page.url.searchParams.get('labels') ?? 'naive');

	function getStats(account: LeaderboardAccount): LabelerStats {
		return currentLabels === 'improved' ? account.improved : account.naive;
	}

	function grifterCategory(score: number | null): { label: string; variant: 'danger' | 'warning' | 'info' | 'success' } {
		if (score === null || score >= 0.8) return { label: 'GRIFTER', variant: 'danger' };
		if (score >= 0.5) return { label: 'MOSTLY WRONG', variant: 'warning' };
		if (score >= 0.2) return { label: 'NORMAL', variant: 'info' };
		return { label: 'HIGH SIGNAL', variant: 'success' };
	}
</script>

<svelte:head>
	<title>SENTINEL // Leaderboard</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="font-display text-2xl tracking-wider text-text-bright">CREDIBILITY LEADERBOARD</h1>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Account rankings by prediction accuracy // Minimum 5 claims
			</p>
		</div>
		<div class="flex items-center gap-3">
			<LabelerToggle />
			<Badge variant="danger">{grifters.length} GRIFTERS</Badge>
			<Badge variant="success">{signal.length} HIGH SIGNAL</Badge>
		</div>
	</div>

	<!-- Two-column leaderboard -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Top Grifters -->
		<HUDPanel title="Worst Track Records" variant="warning">
			<p class="mb-4 font-mono text-[10px] tracking-wider text-text-dim">
				Accounts that consistently exaggerate claims ({currentLabels} labeler)
			</p>
			{#if grifters.length > 0}
				<div class="space-y-3">
					{#each grifters as account, i (account.username)}
						{@const stats = getStats(account)}
						{@const cat = grifterCategory(stats.grifter_score)}
						<div
							class="flex items-center gap-4 border border-surface-border bg-surface/50 px-4 py-3 transition-colors hover:border-warning/30"
							style="animation: fade-in-up 0.3s ease-out {i * 50}ms both;"
						>
							<span class="font-display text-lg text-warning/60 w-8 text-center">
								{i + 1}
							</span>
							<div class="flex-1 min-w-0">
								<a href="/accounts/{account.username}{currentLabels !== 'naive' ? '?labels=' + currentLabels : ''}" class="font-mono text-sm text-holo hover:text-holo-bright transition-colors">
									@{account.username}
								</a>
								<div class="mt-1 flex items-center gap-2">
									<Badge variant={cat.variant}>{cat.label}</Badge>
									<span class="font-mono text-[10px] text-text-dim">
										{stats.total_claims} claims
									</span>
								</div>
							</div>
							<div class="text-right">
								<div class="font-display text-lg text-warning">
									{stats.grifter_score != null ? (stats.grifter_score * 100).toFixed(0) : '—'}%
								</div>
								<div class="font-mono text-[9px] text-text-dim">GRIFTER</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="py-8 text-center font-mono text-sm text-text-dim">
					No accounts with enough data yet. Collect more claims.
				</p>
			{/if}
		</HUDPanel>

		<!-- High Signal -->
		<HUDPanel title="Best Track Records" variant="info">
			<p class="mb-4 font-mono text-[10px] tracking-wider text-text-dim">
				Accounts with the most accurate predictions ({currentLabels} labeler)
			</p>
			{#if signal.length > 0}
				<div class="space-y-3">
					{#each signal as account, i (account.username)}
						{@const stats = getStats(account)}
						{@const cat = grifterCategory(stats.grifter_score)}
						<div
							class="flex items-center gap-4 border border-surface-border bg-surface/50 px-4 py-3 transition-colors hover:border-holo/30"
							style="animation: fade-in-up 0.3s ease-out {i * 50}ms both;"
						>
							<span class="font-display text-lg text-holo/60 w-8 text-center">
								{i + 1}
							</span>
							<div class="flex-1 min-w-0">
								<a href="/accounts/{account.username}{currentLabels !== 'naive' ? '?labels=' + currentLabels : ''}" class="font-mono text-sm text-holo hover:text-holo-bright transition-colors">
									@{account.username}
								</a>
								<div class="mt-1 flex items-center gap-2">
									<Badge variant={cat.variant}>{cat.label}</Badge>
									<span class="font-mono text-[10px] text-text-dim">
										{stats.total_claims} claims
									</span>
								</div>
							</div>
							<div class="text-right">
								<div class="font-display text-lg text-holo">
									{stats.grifter_score != null ? ((1 - stats.grifter_score) * 100).toFixed(0) : '—'}%
								</div>
								<div class="font-mono text-[9px] text-text-dim">ACCURATE</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="py-8 text-center font-mono text-sm text-text-dim">
					No accounts with enough data yet. Collect more claims.
				</p>
			{/if}
		</HUDPanel>
	</div>
</div>
