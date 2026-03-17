<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let currentLabels = $derived(
		($page.url.searchParams.get('labels') as 'naive' | 'improved') ?? 'naive'
	);

	function setLabeler(labeler: 'naive' | 'improved') {
		const url = new URL($page.url);
		if (labeler === 'naive') {
			url.searchParams.delete('labels');
		} else {
			url.searchParams.set('labels', labeler);
		}
		goto(url.toString(), { replaceState: true, invalidateAll: true });
	}
</script>

<div class="flex items-center gap-1 border border-surface-border bg-surface/50 p-0.5">
	<button
		class="labeler-btn"
		class:active={currentLabels === 'naive'}
		onclick={() => setLabeler('naive')}
	>
		NAIVE
	</button>
	<button
		class="labeler-btn"
		class:active={currentLabels === 'improved'}
		onclick={() => setLabeler('improved')}
	>
		IMPROVED
	</button>
</div>

<style>
	.labeler-btn {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9px;
		letter-spacing: 0.15em;
		color: rgba(176, 196, 222, 0.6);
		background: transparent;
		border: 1px solid transparent;
		padding: 3px 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.labeler-btn:hover {
		color: rgba(0, 212, 255, 0.8);
	}

	.labeler-btn.active {
		color: rgba(0, 212, 255, 0.95);
		border-color: rgba(0, 212, 255, 0.4);
		background: rgba(0, 212, 255, 0.1);
		box-shadow: 0 0 6px rgba(0, 212, 255, 0.1);
	}
</style>
