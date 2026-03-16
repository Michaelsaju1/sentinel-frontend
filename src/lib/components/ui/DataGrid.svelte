<script lang="ts">
	let {
		columns = [],
		rows = [],
		onRowClick,
		class: className = ''
	}: {
		columns?: { key: string; label: string; width?: string }[];
		rows?: Record<string, string | number>[];
		onRowClick?: (index: number) => void;
		class?: string;
	} = $props();
</script>

<div class="overflow-x-auto {className}">
	<table class="w-full border-collapse font-mono text-sm">
		<thead>
			<tr class="border-b border-holo-dim/50 bg-holo-dark/30">
				{#each columns as col (col.key)}
					<th
						class="px-4 py-2.5 text-left font-display text-[10px] font-semibold tracking-[0.2em] uppercase text-holo"
						style={col.width ? `width: ${col.width}` : ''}
					>
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (i)}
				<tr
					class="border-b border-surface-border transition-colors hover:bg-holo-dark/20 hover:shadow-[inset_0_0_20px_rgba(0,212,255,0.03)] {onRowClick ? 'cursor-pointer' : ''}"
					style="animation: fade-in-up 0.3s ease-out {i * 50}ms both;"
					onclick={() => onRowClick?.(i)}
				>
					{#each columns as col (col.key)}
						<td class="px-4 py-2.5 text-text-primary">
							{row[col.key] ?? '—'}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
