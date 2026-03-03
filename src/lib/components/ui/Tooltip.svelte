<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		text = '',
		position = 'top',
		children
	}: {
		text?: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		children: Snippet;
	} = $props();

	let show = $state(false);

	const positions = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};
</script>

<div
	class="relative inline-block"
	onmouseenter={() => (show = true)}
	onmouseleave={() => (show = false)}
	role="tooltip"
>
	{@render children()}
	{#if show && text}
		<div
			class="pointer-events-none absolute z-50 whitespace-nowrap border border-holo-dim/50 bg-surface-light px-2.5 py-1 font-mono text-xs text-holo shadow-[0_0_8px_rgba(0,212,255,0.1)] {positions[position]}"
			style="animation: fade-in-up 0.15s ease-out;"
		>
			{text}
		</div>
	{/if}
</div>
