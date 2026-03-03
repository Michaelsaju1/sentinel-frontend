<script lang="ts">
	import { onMount } from 'svelte';

	let {
		target = 0,
		duration = 2000,
		prefix = '',
		suffix = '',
		decimals = 0,
		class: className = ''
	}: {
		target?: number;
		duration?: number;
		prefix?: string;
		suffix?: string;
		decimals?: number;
		class?: string;
	} = $props();

	let current = $state(0);

	onMount(() => {
		const start = performance.now();
		function animate(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			current = eased * target;
			if (progress < 1) requestAnimationFrame(animate);
		}
		requestAnimationFrame(animate);
	});
</script>

<span class="tabular-nums {className}">{prefix}{current.toFixed(decimals)}{suffix}</span>
