<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import Modal from './Modal.svelte';
	import Badge from './Badge.svelte';

	interface Claim {
		tweet_id?: number;
		text?: string;
		username?: string;
		created_at?: string;
		ticker?: string;
		company_name?: string;
		price_change_pct?: number | null;
		has_catalyst?: boolean;
		catalyst_type?: string | null;
		label?: string;
		claimed_direction?: string;
		actual_direction?: string;
	}

	let {
		claim = null,
		open = $bindable(false)
	}: {
		claim?: Claim | null;
		open?: boolean;
	} = $props();

	function labelVariant(label: string): 'danger' | 'success' | 'info' | 'default' {
		if (label === 'exaggerated') return 'danger';
		if (label === 'accurate') return 'success';
		if (label === 'understated') return 'info';
		return 'default';
	}
</script>

<Modal bind:open title="Claim Details">
	{#if claim}
		<div class="space-y-4">
			<!-- Header: user + ticker + label -->
			<div class="flex items-center gap-3 flex-wrap">
				<a
					href="/accounts/{claim.username}"
					class="font-mono text-sm text-holo hover:text-holo-bright transition-colors"
				>
					@{claim.username ?? '?'}
				</a>
				{#if claim.ticker}
					<a
						href="/stocks/{claim.ticker}"
						class="font-mono text-xs text-holo-accent hover:text-holo-bright transition-colors"
					>
						${claim.ticker}
					</a>
				{/if}
				{#if claim.label}
					<Badge variant={labelVariant(claim.label)}>
						{claim.label.toUpperCase()}
					</Badge>
				{/if}
			</div>

			<!-- Full tweet text -->
			<div class="border border-surface-border bg-surface/50 p-3">
				<p class="font-mono text-xs leading-relaxed text-text-primary">
					{claim.text ?? 'No text available'}
				</p>
			</div>

			<!-- Details grid -->
			<div class="grid grid-cols-2 gap-3">
				{#if claim.created_at}
					<div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim mb-0.5">TIME</div>
						<div class="font-mono text-xs text-text-primary">
							{new Date(claim.created_at).toLocaleString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</div>
					</div>
				{/if}

				{#if claim.price_change_pct != null}
					<div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim mb-0.5">PRICE CHANGE</div>
						<div class="font-mono text-xs {claim.price_change_pct >= 0 ? 'text-holo' : 'text-danger'}">
							{claim.price_change_pct >= 0 ? '+' : ''}{claim.price_change_pct.toFixed(2)}%
						</div>
					</div>
				{/if}

				{#if claim.claimed_direction || claim.actual_direction}
					<div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim mb-0.5">DIRECTION</div>
						<div class="font-mono text-xs text-text-primary">
							{claim.claimed_direction ?? '?'} → {claim.actual_direction ?? '?'}
						</div>
					</div>
				{/if}

				{#if claim.catalyst_type}
					<div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim mb-0.5">CATALYST</div>
						<div class="font-mono text-xs text-text-primary">
							{claim.catalyst_type}
						</div>
					</div>
				{/if}

				{#if claim.company_name}
					<div>
						<div class="font-mono text-[9px] tracking-wider text-text-dim mb-0.5">COMPANY</div>
						<div class="font-mono text-xs text-text-primary">
							{claim.company_name}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</Modal>
