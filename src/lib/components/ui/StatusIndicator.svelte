<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	let {
		status = 'online',
		label = '',
		size = 'md',
		class: className = ''
	}: {
		status?: 'online' | 'offline' | 'warning' | 'critical';
		label?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const colors = {
		online: { bg: 'bg-holo', shadow: 'shadow-[0_0_6px_var(--color-holo)]', text: 'text-holo' },
		offline: { bg: 'bg-text-dim', shadow: '', text: 'text-text-dim' },
		warning: { bg: 'bg-warning', shadow: 'shadow-[0_0_6px_var(--color-warning)]', text: 'text-warning' },
		critical: { bg: 'bg-danger', shadow: 'shadow-[0_0_6px_var(--color-danger)]', text: 'text-danger' }
	};

	const sizes = {
		sm: 'h-1.5 w-1.5',
		md: 'h-2.5 w-2.5',
		lg: 'h-3.5 w-3.5'
	};

	const textSizes = {
		sm: 'text-[10px]',
		md: 'text-xs',
		lg: 'text-sm'
	};
</script>

<div class="flex items-center gap-2 {className}">
	<span class="relative flex {sizes[size]}">
		{#if status === 'online' || status === 'critical'}
			<span
				class="absolute inline-flex h-full w-full rounded-full {colors[status].bg} opacity-75"
				style="animation: pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"
			></span>
		{/if}
		<span class="relative inline-flex rounded-full {sizes[size]} {colors[status].bg} {colors[status].shadow}"></span>
	</span>
	{#if label}
		<span class="font-mono {textSizes[size]} {colors[status].text} tracking-wider uppercase"
			>{label}</span
		>
	{/if}
</div>
