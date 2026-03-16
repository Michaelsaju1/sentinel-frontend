<script lang="ts">
	import {
		HUDPanel,
		Badge,
		ThreatMeter,
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

	interface Account {
		username: string;
		is_bot: boolean;
		bot_reason: string | null;
		naive: LabelerStats;
		improved: LabelerStats;
		first_seen: string;
		last_seen: string | null;
		classified_at: string | null;
	}

	let { data } = $props();

	const accounts: Account[] = $derived(data.accounts ?? []);
	const currentLabels = $derived($page.url.searchParams.get('labels') ?? 'naive');

	// Get the active labeler stats for an account
	function getStats(a: Account): LabelerStats {
		return currentLabels === 'improved' ? a.improved : a.naive;
	}

	function grifterCategory(score: number | null): { label: string; variant: 'danger' | 'warning' | 'info' | 'success' | 'default' } {
		if (score === null) return { label: 'UNSCORED', variant: 'default' };
		if (score >= 0.8) return { label: 'GRIFTER', variant: 'danger' };
		if (score >= 0.5) return { label: 'MOSTLY WRONG', variant: 'warning' };
		if (score >= 0.2) return { label: 'NORMAL', variant: 'info' };
		return { label: 'HIGH SIGNAL', variant: 'success' };
	}

	// Sorting state
	type SortKey = 'username' | 'grifter_score' | 'total_claims' | 'exaggerated_count' | 'accurate_count' | 'last_seen';
	let sortKey: SortKey = $state('grifter_score');
	let sortAsc = $state(false);

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = key;
			sortAsc = key === 'username';
		}
	}

	const sortedAccounts = $derived.by(() => {
		const sorted = [...accounts];
		sorted.sort((a, b) => {
			let aVal: string | number | null;
			let bVal: string | number | null;

			const aStats = getStats(a);
			const bStats = getStats(b);

			switch (sortKey) {
				case 'username':
					aVal = a.username.toLowerCase();
					bVal = b.username.toLowerCase();
					break;
				case 'grifter_score':
					aVal = aStats.grifter_score ?? -1;
					bVal = bStats.grifter_score ?? -1;
					break;
				case 'total_claims':
					aVal = aStats.total_claims;
					bVal = bStats.total_claims;
					break;
				case 'exaggerated_count':
					aVal = aStats.exaggerated_count;
					bVal = bStats.exaggerated_count;
					break;
				case 'accurate_count':
					aVal = aStats.accurate_count;
					bVal = bStats.accurate_count;
					break;
				case 'last_seen':
					aVal = a.last_seen ?? '';
					bVal = b.last_seen ?? '';
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return sortAsc ? -1 : 1;
			if (aVal > bVal) return sortAsc ? 1 : -1;
			return 0;
		});
		return sorted;
	});

	const columns: { key: SortKey; label: string; width: string }[] = [
		{ key: 'username', label: 'Account', width: '160px' },
		{ key: 'grifter_score', label: 'Grifter Score', width: '120px' },
		{ key: 'total_claims', label: 'Claims', width: '80px' },
		{ key: 'exaggerated_count', label: 'Exaggerated', width: '100px' },
		{ key: 'accurate_count', label: 'Accurate', width: '90px' },
		{ key: 'last_seen', label: 'Last Active', width: '120px' }
	];

	// Summary stats
	const totalAccounts = $derived(accounts.length);
	const grifterCount = $derived(accounts.filter((a) => {
		const s = getStats(a).grifter_score;
		return s != null && s >= 0.8;
	}).length);
	const signalCount = $derived(accounts.filter((a) => {
		const s = getStats(a).grifter_score;
		return s != null && s < 0.2;
	}).length);
</script>

<svelte:head>
	<title>SENTINEL // Accounts</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="font-display text-2xl tracking-wider text-text-bright">ACCOUNT CREDIBILITY</h1>
			<p class="mt-1 font-mono text-xs text-text-dim">
				Track records of social media accounts posting defense stock claims
			</p>
		</div>
		<div class="flex items-center gap-3">
			<LabelerToggle />
			<Badge variant="default">{totalAccounts} ACCOUNTS</Badge>
			<Badge variant="danger">{grifterCount} GRIFTERS</Badge>
			<Badge variant="success">{signalCount} HIGH SIGNAL</Badge>
		</div>
	</div>

	<!-- Main Grid -->
	<div class="grid gap-6 lg:grid-cols-4">
		<!-- Sidebar -->
		<div class="space-y-6 lg:col-span-1">
			<HUDPanel title="Score Legend">
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<Badge variant="success">HIGH SIGNAL</Badge>
						<span class="font-mono text-[10px] text-text-dim">0–20%</span>
					</div>
					<div class="flex items-center justify-between">
						<Badge variant="info">NORMAL</Badge>
						<span class="font-mono text-[10px] text-text-dim">20–50%</span>
					</div>
					<div class="flex items-center justify-between">
						<Badge variant="warning">MOSTLY WRONG</Badge>
						<span class="font-mono text-[10px] text-text-dim">50–80%</span>
					</div>
					<div class="flex items-center justify-between">
						<Badge variant="danger">GRIFTER</Badge>
						<span class="font-mono text-[10px] text-text-dim">80–100%</span>
					</div>
				</div>
				<div class="mt-4 border-t border-surface-border pt-4">
					<p class="font-mono text-[10px] leading-relaxed text-text-dim">
						Grifter Score = exaggerated claims / total claims.
						Only scored after 5+ labeled claims.
						<br /><br />
						Using <span class="text-holo">{currentLabels.toUpperCase()}</span> labeler.
					</p>
				</div>
			</HUDPanel>

			<HUDPanel title="Grifter Index" variant="warning">
				<ThreatMeter level={totalAccounts > 0 ? Math.min(Math.round((grifterCount / totalAccounts) * 5), 5) : 0} label="Grifter Density" />
			</HUDPanel>
		</div>

		<!-- Account Table -->
		<div class="lg:col-span-3">
			<HUDPanel title="All Accounts">
				{#if sortedAccounts.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full border-collapse font-mono text-sm">
							<thead>
								<tr class="border-b border-holo-dim/50 bg-holo-dark/30">
									{#each columns as col (col.key)}
										<th
											class="sort-header px-4 py-2.5 text-left font-display text-[10px] font-semibold tracking-[0.2em] uppercase text-holo cursor-pointer select-none hover:text-holo-bright transition-colors"
											style="width: {col.width}"
											onclick={() => toggleSort(col.key)}
										>
											{col.label}
											{#if sortKey === col.key}
												<span class="ml-1 text-holo-bright">{sortAsc ? '▲' : '▼'}</span>
											{/if}
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each sortedAccounts as account, i (account.username)}
									{@const stats = getStats(account)}
									<tr
										class="border-b border-surface-border transition-colors hover:bg-holo-dark/20 hover:shadow-[inset_0_0_20px_rgba(0,212,255,0.03)]"
										style="animation: fade-in-up 0.3s ease-out {Math.min(i, 10) * 50}ms both;"
									>
										<td class="px-4 py-2.5">
											<a href="/accounts/{account.username}{currentLabels !== 'naive' ? '?labels=' + currentLabels : ''}" class="text-holo hover:text-holo-bright transition-colors">
												@{account.username}
											</a>
										</td>
										<td class="px-4 py-2.5 text-text-primary">
											{stats.grifter_score != null ? `${(stats.grifter_score * 100).toFixed(0)}%` : '—'}
										</td>
										<td class="px-4 py-2.5 text-text-primary">{stats.total_claims}</td>
										<td class="px-4 py-2.5 text-text-primary">{stats.exaggerated_count}</td>
										<td class="px-4 py-2.5 text-text-primary">{stats.accurate_count}</td>
										<td class="px-4 py-2.5 text-text-primary">
											{account.last_seen
												? new Date(account.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
												: '—'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No account data available. The backend needs to classify accounts first.
					</p>
				{/if}
			</HUDPanel>
		</div>
	</div>
</div>

<style>
	.sort-header:hover {
		background: rgba(0, 212, 255, 0.05);
	}
</style>
