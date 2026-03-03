<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		class: className = '',
		onclick,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();

	const variants = {
		primary:
			'border-holo text-holo hover:bg-holo hover:text-surface hover:shadow-[0_0_12px_var(--color-holo-dim)] active:bg-holo/80',
		secondary:
			'border-holo-accent text-holo-accent hover:bg-holo-accent hover:text-surface hover:shadow-[0_0_12px_rgba(77,166,255,0.3)] active:bg-holo-accent/80',
		danger:
			'border-danger text-danger hover:bg-danger hover:text-surface hover:shadow-[0_0_12px_var(--color-danger-dim)] active:bg-danger/80',
		ghost:
			'border-text-dim/30 text-text-dim hover:border-text-primary hover:text-text-primary active:bg-surface-medium'
	};

	const sizes = {
		sm: 'px-3 py-1 text-xs',
		md: 'px-5 py-2 text-sm',
		lg: 'px-7 py-3 text-base'
	};
</script>

<button
	{onclick}
	{disabled}
	class="group relative border font-mono tracking-wider uppercase transition-all duration-200
		{variants[variant]} {sizes[size]}
		disabled:cursor-not-allowed disabled:opacity-30
		{className}"
>
	<!-- Corner accents -->
	<span class="absolute -left-px -top-px h-1.5 w-1.5 border-l border-t border-inherit transition-all group-hover:h-2.5 group-hover:w-2.5"></span>
	<span class="absolute -right-px -top-px h-1.5 w-1.5 border-r border-t border-inherit transition-all group-hover:h-2.5 group-hover:w-2.5"></span>
	<span class="absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l border-inherit transition-all group-hover:h-2.5 group-hover:w-2.5"></span>
	<span class="absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r border-inherit transition-all group-hover:h-2.5 group-hover:w-2.5"></span>
	{@render children()}
</button>
