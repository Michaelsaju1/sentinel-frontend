<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		pulse = false,
		class: className = '',
		children
	}: {
		variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
		pulse?: boolean;
		class?: string;
		children: Snippet;
	} = $props();

	const styles = {
		default: 'border-text-dim/50 text-text-dim',
		danger: 'border-danger/50 text-danger bg-danger-dim/10',
		warning: 'border-warning/50 text-warning bg-warning/5',
		info: 'border-holo-accent/50 text-holo-accent bg-holo-dark/10',
		success: 'border-holo/50 text-holo bg-holo-dark/20'
	};
</script>

<span
	class="inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase {styles[variant]} {className}"
	class:animate-pulse={pulse}
>
	{@render children()}
</span>
