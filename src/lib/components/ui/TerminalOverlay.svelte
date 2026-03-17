<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import { browser } from '$app/environment';
	import CommandLine from './CommandLine.svelte';

	let {
		stats = null
	}: {
		stats?: {
			totalClaims: number;
			exaggerated: number;
			accurate: number;
			understated: number;
			accuracyRate: string;
			topTickerCount: number;
			topTickers: { ticker: string; count: number }[];
			topExaggerators: { username: string; count: number }[];
		} | null;
	} = $props();

	let open = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
		}
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			open = false;
		}
	}

	$effect(() => {
		if (!browser) return;
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// Focus the terminal input when overlay opens
	$effect(() => {
		if (open && browser) {
			// Small delay to let the DOM render
			setTimeout(() => {
				document.getElementById('terminal-input')?.focus();
			}, 50);
		}
	});

	const bootLines = [
		{ type: 'success' as const, text: 'SENTINEL terminal ready. Type "help" for commands.' }
	];
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="terminal-backdrop" onclick={() => (open = false)}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="terminal-container" onclick={(e) => e.stopPropagation()}>
			<CommandLine lines={bootLines} {stats} />
			<div class="terminal-hint">
				<span class="hint-key">ESC</span> to close
				<span class="hint-sep">//</span>
				<span class="hint-key">Ctrl+K</span> to toggle
			</div>
		</div>
	</div>
{/if}

<style>
	.terminal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(2, 8, 16, 0.8);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 12vh;
		animation: backdrop-in 0.15s ease-out;
	}

	.terminal-container {
		width: 100%;
		max-width: 720px;
		margin: 0 1rem;
		animation: terminal-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow:
			0 0 40px rgba(0, 212, 255, 0.1),
			0 0 80px rgba(0, 212, 255, 0.05),
			0 25px 50px rgba(0, 0, 0, 0.5);
	}

	.terminal-hint {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		color: rgba(176, 196, 222, 0.3);
		letter-spacing: 0.1em;
	}

	.hint-key {
		padding: 1px 6px;
		border: 1px solid rgba(0, 212, 255, 0.2);
		color: rgba(0, 212, 255, 0.5);
		font-size: 9px;
	}

	.hint-sep {
		color: rgba(176, 196, 222, 0.15);
	}

	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes terminal-slide-in {
		from {
			opacity: 0;
			transform: translateY(-20px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
