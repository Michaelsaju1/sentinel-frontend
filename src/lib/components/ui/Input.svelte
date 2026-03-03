<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = '',
		label = '',
		type = 'text',
		disabled = false,
		variant = 'default',
		class: className = ''
	}: {
		value?: string;
		placeholder?: string;
		label?: string;
		type?: 'text' | 'password' | 'email' | 'number' | 'search';
		disabled?: boolean;
		variant?: 'default' | 'ghost';
		class?: string;
	} = $props();

	const styles = {
		default:
			'border-surface-border bg-surface text-text-primary focus:border-matrix focus:shadow-[0_0_8px_var(--color-matrix-dim)]',
		ghost:
			'border-transparent bg-transparent text-text-primary focus:border-matrix-dim focus:bg-surface/50'
	};
</script>

<div class="space-y-1.5 {className}">
	{#if label}
		<label class="block font-mono text-[10px] tracking-[0.2em] uppercase text-text-dim">
			{label}
		</label>
	{/if}
	<div class="relative">
		<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-matrix-dim"
			>&gt;</span
		>
		<input
			{type}
			bind:value
			{placeholder}
			{disabled}
			class="w-full border py-2 pl-7 pr-3 font-mono text-sm outline-none transition-all placeholder:text-text-dim/50 disabled:cursor-not-allowed disabled:opacity-30
				{styles[variant]}"
		/>
	</div>
</div>
