<script lang="ts">
	let {
		label = '',
		value = '',
		change = '',
		trend = 'neutral',
		icon = '',
		class: className = ''
	}: {
		label?: string;
		value?: string;
		change?: string;
		trend?: 'up' | 'down' | 'neutral';
		icon?: string;
		class?: string;
	} = $props();

	const trendColors = {
		up: 'text-matrix',
		down: 'text-danger',
		neutral: 'text-text-dim'
	};

	const trendArrows = {
		up: '+',
		down: '-',
		neutral: ''
	};
</script>

<div
	class="relative border border-surface-border bg-surface-light/60 p-4 transition-all hover:border-matrix-dim/50 hover:shadow-[0_0_12px_rgba(0,255,65,0.05)] {className}"
>
	<!-- Corner accents -->
	<div class="absolute -left-px -top-px h-2 w-2 border-l border-t border-matrix-dim/50"></div>
	<div class="absolute -right-px -top-px h-2 w-2 border-r border-t border-matrix-dim/50"></div>

	<div class="flex items-start justify-between">
		<div class="space-y-1">
			<p class="font-mono text-[10px] tracking-[0.2em] uppercase text-text-dim">{label}</p>
			<p class="font-display text-2xl font-bold text-text-bright">{value}</p>
		</div>
		{#if icon}
			<span class="text-2xl opacity-40">{icon}</span>
		{/if}
	</div>

	{#if change}
		<div class="mt-2 flex items-center gap-1 font-mono text-xs {trendColors[trend]}">
			<span>{trendArrows[trend]}{change}</span>
			<span class="text-text-dim">vs last period</span>
		</div>
	{/if}
</div>
