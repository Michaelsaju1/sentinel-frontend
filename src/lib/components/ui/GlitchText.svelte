<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import type { Snippet } from 'svelte';

	let {
		tag = 'span',
		class: className = '',
		intensity = 'medium',
		children
	}: {
		tag?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
		class?: string;
		intensity?: 'low' | 'medium' | 'high';
		children: Snippet;
	} = $props();

	const intensityMap = {
		low: 'hover:[animation:glitch-1_0.5s_ease-in-out]',
		medium: '[animation:glitch-1_3s_ease-in-out_infinite]',
		high: '[animation:glitch-1_0.8s_ease-in-out_infinite]'
	};
</script>

<svelte:element this={tag} class="glitch-text relative inline-block {intensityMap[intensity]} {className}">
	{@render children()}
</svelte:element>

<style>
	.glitch-text {
		text-shadow:
			2px 0 var(--color-holo-accent),
			-2px 0 var(--color-holo-bright);
	}
</style>
