<script lang="ts">
	let {
		columns = [],
		rows = [],
		class: className = ''
	}: {
		columns?: { key: string; label: string; width?: string }[];
		rows?: Record<string, string | number>[];
		class?: string;
	} = $props();
</script>

<div class="overflow-x-auto {className}">
	<table class="w-full border-collapse font-mono text-sm">
		<thead>
			<tr class="border-b border-matrix-dim/50 bg-matrix-dark/30">
				{#each columns as col}
					<th
						class="px-4 py-2.5 text-left font-display text-[10px] font-semibold tracking-[0.2em] uppercase text-matrix"
						style={col.width ? `width: ${col.width}` : ''}
					>
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i}
				<tr
					class="border-b border-surface-border transition-colors hover:bg-matrix-dark/20"
					style="animation: fade-in-up 0.3s ease-out {i * 50}ms both;"
				>
					{#each columns as col}
						<td class="px-4 py-2.5 text-text-primary">
							{row[col.key] ?? '—'}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
