<script lang="ts">
	import { onMount } from 'svelte';

	let {
		text = '',
		speed = 50,
		delay = 0,
		cursor = true,
		class: className = ''
	}: {
		text?: string;
		speed?: number;
		delay?: number;
		cursor?: boolean;
		class?: string;
	} = $props();

	let displayed = $state('');
	let showCursor = $state(true);

	onMount(() => {
		const timeout = setTimeout(() => {
			let i = 0;
			const interval = setInterval(() => {
				if (i < text.length) {
					displayed += text[i];
					i++;
				} else {
					clearInterval(interval);
				}
			}, speed);
			return () => clearInterval(interval);
		}, delay);
		return () => clearTimeout(timeout);
	});

	$effect(() => {
		if (!cursor) return;
		const interval = setInterval(() => {
			showCursor = !showCursor;
		}, 530);
		return () => clearInterval(interval);
	});
</script>

<span class="font-mono text-matrix {className}">
	{displayed}{#if cursor}<span class="inline-block w-2" class:opacity-0={!showCursor}>_</span>{/if}
</span>
