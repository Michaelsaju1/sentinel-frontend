<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import type { Snippet } from 'svelte';

	let {
		variant = 'info',
		dismissible = false,
		class: className = '',
		children
	}: {
		variant?: 'info' | 'warning' | 'danger' | 'success';
		dismissible?: boolean;
		class?: string;
		children: Snippet;
	} = $props();

	let visible = $state(true);

	const styles = {
		info: {
			border: 'border-holo/50',
			bg: 'bg-holo-dark/10',
			text: 'text-holo',
			icon: 'INFO'
		},
		warning: {
			border: 'border-warning/50',
			bg: 'bg-warning/5',
			text: 'text-warning',
			icon: 'WARN'
		},
		danger: {
			border: 'border-danger/50',
			bg: 'bg-danger-dim/10',
			text: 'text-danger',
			icon: 'CRIT'
		},
		success: {
			border: 'border-holo/50',
			bg: 'bg-holo-dark/20',
			text: 'text-holo',
			icon: ' OK '
		}
	};
</script>

{#if visible}
	<div
		class="flex items-start gap-3 border-l-2 px-4 py-3 font-mono text-sm {styles[variant].border} {styles[variant].bg} {className}"
		role="alert"
	>
		<span
			class="shrink-0 border px-1.5 py-0.5 font-display text-[10px] tracking-wider {styles[variant].border} {styles[variant].text}"
		>
			[{styles[variant].icon}]
		</span>
		<div class="min-w-0 flex-1 text-text-primary">
			{@render children()}
		</div>
		{#if dismissible}
			<button
				onclick={() => (visible = false)}
				class="shrink-0 text-text-dim transition-colors hover:text-text-primary"
				aria-label="Dismiss"
			>
				[x]
			</button>
		{/if}
	</div>
{/if}
