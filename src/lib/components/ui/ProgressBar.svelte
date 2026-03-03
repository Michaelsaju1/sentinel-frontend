<script lang="ts">
	let {
		value = 0,
		max = 100,
		label = '',
		variant = 'default',
		showValue = true,
		animated = true,
		class: className = ''
	}: {
		value?: number;
		max?: number;
		label?: string;
		variant?: 'default' | 'danger' | 'warning' | 'info';
		showValue?: boolean;
		animated?: boolean;
		class?: string;
	} = $props();

	let percent = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

	const barColors = {
		default: 'bg-matrix shadow-[0_0_8px_var(--color-matrix-dim)]',
		danger: 'bg-danger shadow-[0_0_8px_var(--color-danger-dim)]',
		warning: 'bg-warning shadow-[0_0_8px_rgba(255,102,0,0.3)]',
		info: 'bg-cyber-blue shadow-[0_0_8px_var(--color-cyber-blue-dim)]'
	};

	const textColors = {
		default: 'text-matrix',
		danger: 'text-danger',
		warning: 'text-warning',
		info: 'text-cyber-blue'
	};
</script>

<div class="space-y-1.5 {className}">
	{#if label || showValue}
		<div class="flex items-center justify-between font-mono text-xs">
			{#if label}
				<span class="tracking-wider uppercase text-text-dim">{label}</span>
			{/if}
			{#if showValue}
				<span class="{textColors[variant]} tabular-nums">{percent.toFixed(1)}%</span>
			{/if}
		</div>
	{/if}
	<div class="relative h-2 overflow-hidden border border-surface-border bg-surface">
		<div
			class="h-full transition-all duration-500 ease-out {barColors[variant]}"
			style="width: {percent}%"
		>
			{#if animated}
				<div
					class="absolute inset-0 opacity-30"
					style="
						background: repeating-linear-gradient(
							-45deg,
							transparent,
							transparent 4px,
							rgba(255,255,255,0.1) 4px,
							rgba(255,255,255,0.1) 8px
						);
						animation: data-stream 1s linear infinite;
					"
				></div>
			{/if}
		</div>
	</div>
</div>
