<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		variant = 'default',
		children
	}: {
		open?: boolean;
		title?: string;
		variant?: 'default' | 'danger';
		children: Snippet;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}

	let borderColor = $derived(variant === 'danger' ? 'border-danger' : 'border-holo-dim');
	let headerColor = $derived(variant === 'danger' ? 'text-danger' : 'text-holo');
</script>

{#if open}
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		onkeydown={handleKeydown}
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-surface/80 backdrop-blur-sm"
			onclick={() => (open = false)}
			aria-label="Close modal"
			tabindex="-1"
		></button>

		<!-- Modal -->
		<div
			class="relative w-full max-w-lg border {borderColor} bg-surface-light shadow-[0_0_30px_rgba(0,212,255,0.1)]"
			style="animation: fade-in-up 0.2s ease-out;"
		>
			<!-- Corner decorations -->
			<div class="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 {borderColor}"></div>
			<div class="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 {borderColor}"></div>
			<div class="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 {borderColor}"></div>
			<div class="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 {borderColor}"></div>

			{#if title}
				<div class="flex items-center justify-between border-b {borderColor} px-5 py-3">
					<h3 class="font-display text-sm tracking-[0.2em] uppercase {headerColor}">{title}</h3>
					<button
						onclick={() => (open = false)}
						class="font-mono text-text-dim transition-colors hover:text-text-primary"
					>
						[X]
					</button>
				</div>
			{/if}

			<div class="p-5">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
