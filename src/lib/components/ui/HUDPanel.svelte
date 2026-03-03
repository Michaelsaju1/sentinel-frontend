<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		variant = 'default',
		glow = false,
		class: className = '',
		children
	}: {
		title?: string;
		variant?: 'default' | 'danger' | 'warning' | 'info';
		glow?: boolean;
		class?: string;
		children: Snippet;
	} = $props();

	const borderColors = {
		default: 'border-matrix-dim',
		danger: 'border-danger',
		warning: 'border-warning',
		info: 'border-cyber-blue'
	};

	const headerColors = {
		default: 'text-matrix bg-matrix-dark/50',
		danger: 'text-danger bg-danger-dim/30',
		warning: 'text-warning bg-warning/10',
		info: 'text-cyber-blue bg-cyber-blue-dim/30'
	};
</script>

<div
	class="relative border {borderColors[variant]} bg-surface-light/80 backdrop-blur-sm {glow
		? 'border-glow'
		: ''} {className}"
>
	<!-- Corner decorations -->
	<div class="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 {borderColors[variant]}"></div>
	<div class="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 {borderColors[variant]}"></div>
	<div class="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 {borderColors[variant]}"></div>
	<div class="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 {borderColors[variant]}"></div>

	{#if title}
		<div class="border-b border-inherit px-4 py-2 {headerColors[variant]}">
			<span class="font-display text-xs tracking-[0.2em] uppercase">{title}</span>
		</div>
	{/if}

	<div class="p-4">
		{@render children()}
	</div>
</div>
