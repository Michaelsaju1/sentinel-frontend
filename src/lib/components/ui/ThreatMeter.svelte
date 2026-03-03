<script lang="ts">
	let {
		level = 0,
		label = 'Threat Level',
		class: className = ''
	}: {
		level?: number;
		label?: string;
		class?: string;
	} = $props();

	let clamped = $derived(Math.min(5, Math.max(0, level)));

	const levelLabels = ['NONE', 'LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'];

	const levelColors = [
		'text-holo',
		'text-holo-accent',
		'text-holo-accent',
		'text-warning',
		'text-warning',
		'text-danger'
	];

	const barColors = [
		'bg-holo',
		'bg-holo-accent',
		'bg-holo-accent',
		'bg-warning',
		'bg-warning',
		'bg-danger'
	];
</script>

<div class="space-y-2 {className}">
	<div class="flex items-center justify-between font-mono text-xs">
		<span class="tracking-wider uppercase text-text-dim">{label}</span>
		<span class="font-display tracking-wider {levelColors[clamped]}">
			{levelLabels[clamped]}
		</span>
	</div>

	<div class="flex gap-1">
		{#each Array(5) as _, i (i)}
			<div
				class="h-3 flex-1 border transition-all duration-300
					{i < clamped
					? `${barColors[clamped]} border-transparent shadow-[0_0_6px_rgba(0,0,0,0.3)]`
					: 'border-surface-border bg-surface'}"
			></div>
		{/each}
	</div>
</div>
