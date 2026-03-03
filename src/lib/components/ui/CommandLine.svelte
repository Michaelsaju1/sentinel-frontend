<script lang="ts">
	let {
		lines = [],
		prompt = 'sentinel@hq:~$',
		class: className = ''
	}: {
		lines?: { type?: 'input' | 'output' | 'error' | 'success'; text: string }[];
		prompt?: string;
		class?: string;
	} = $props();
</script>

<div
	class="overflow-hidden border border-surface-border bg-surface font-mono text-sm {className}"
>
	<!-- Title bar -->
	<div class="flex items-center gap-2 border-b border-surface-border bg-surface-light px-3 py-1.5">
		<div class="flex gap-1.5">
			<span class="h-2 w-2 rounded-full bg-danger/70"></span>
			<span class="h-2 w-2 rounded-full bg-warning/70"></span>
			<span class="h-2 w-2 rounded-full bg-holo/70"></span>
		</div>
		<span class="text-[10px] tracking-wider text-holo-dim">SENTINEL TERMINAL v2.0.4</span>
	</div>

	<!-- Terminal content -->
	<div class="max-h-64 space-y-0.5 overflow-y-auto p-3">
		{#each lines as line, i (i)}
			<div style="animation: fade-in-up 0.2s ease-out {i * 30}ms both;">
				{#if line.type === 'input'}
					<div class="flex gap-2">
						<span class="text-holo-dim">{prompt}</span>
						<span class="text-text-primary">{line.text}</span>
					</div>
				{:else if line.type === 'error'}
					<div class="text-danger">[ERROR] {line.text}</div>
				{:else if line.type === 'success'}
					<div class="text-holo">[OK] {line.text}</div>
				{:else}
					<div class="text-text-dim">{line.text}</div>
				{/if}
			</div>
		{/each}
		<div class="flex gap-2">
			<span class="text-holo-dim">{prompt}</span>
			<span class="inline-block w-2 bg-holo" style="animation: typing-cursor 1s step-end infinite;"
				>&nbsp;</span
			>
		</div>
	</div>
</div>
