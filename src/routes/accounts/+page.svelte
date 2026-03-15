<script lang="ts">
	import {
		HUDPanel,
		DataGrid,
		Badge,
		ThreatMeter
	} from '$lib/components/ui';

	interface Account {
		username: string;
		is_bot: boolean;
		grifter_score: number | null;
		total_claims: number;
		exaggerated_count: number;
		accurate_count: number;
		last_seen: string | null;
	}

	let { data } = $props();

	const accounts: Account[] = $derived(data.accounts ?? []);

	function grifterCategory(score: number | null): { label: string; variant: 'danger' | 'warning' | 'info' | 'success' | 'default' } {
		if (score === null) return { label: 'UNSCORED', variant: 'default' };
		if (score >= 0.8) return { label: 'GRIFTER', variant: 'danger' };
		if (score >= 0.5) return { label: 'MOSTLY WRONG', variant: 'warning' };
		if (score >= 0.2) return { label: 'NORMAL', variant: 'info' };
		return { label: 'HIGH SIGNAL', variant: 'success' };
	}

	const columns = [
		{ key: 'username', label: 'Account', width: '160px' },
		{ key: 'score', label: 'Grifter Score', width: '120px' },
		{ key: 'category', label: 'Category', width: '130px' },
		{ key: 'total', label: 'Claims', width: '80px' },
		{ key: 'exaggerated', label: 'Exaggerated', width: '100px' },
		{ key: 'accurate', label: 'Accurate', width: '90px' },
		{ key: 'last_seen', label: 'Last Active', width: '120px' }
	];

	const rows = $derived(
		accounts.map((a) => {
			const cat = grifterCategory(a.grifter_score);
			return {
				username: `@${a.username}`,
				score: a.grifter_score != null ? `${(a.grifter_score * 100).toFixed(0)}%` : '—',
				category: cat.label,
				total: a.total_claims,
				exaggerated: a.exaggerated_count,
				accurate: a.accurate_count,
				last_seen: a.last_seen
					? new Date(a.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
					: '—'
			};
		})
	);

	// Summary stats
	const totalAccounts = $derived(accounts.length);
	const grifterCount = $derived(accounts.filter((a) => a.grifter_score != null && a.grifter_score >= 0.8).length);
	const signalCount = $derived(accounts.filter((a) => a.grifter_score != null && a.grifter_score < 0.2).length);
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
				{#if rows.length > 0}
					<DataGrid {columns} {rows} />
				{:else}
					<p class="py-8 text-center font-mono text-sm text-text-dim">
						No account data available. The backend needs to classify accounts first.
					</p>
				{/if}
			</HUDPanel>
		</div>
	</div>
</div>
