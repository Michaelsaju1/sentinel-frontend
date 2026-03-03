<script lang="ts">
	import { page } from '$app/state';

	let mobileOpen = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/intel', label: 'Intel' },
		{ href: '/about', label: 'Mission' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="relative z-40 border-b border-matrix-dim/30 bg-surface/90 backdrop-blur-md">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
		<!-- Logo -->
		<a href="/" class="group flex items-center gap-3">
			<div
				class="flex h-8 w-8 items-center justify-center border border-matrix bg-matrix-dark/50 font-display text-xs font-bold text-matrix shadow-[0_0_8px_var(--color-matrix-dim)] transition-all group-hover:shadow-[0_0_16px_var(--color-matrix-dim)]"
			>
				S
			</div>
			<div>
				<span class="font-display text-sm tracking-[0.3em] text-matrix">SENTINEL</span>
				<div class="font-mono text-[8px] tracking-widest text-text-dim">DEFENSE SYSTEM v3.1</div>
			</div>
		</a>

		<!-- Desktop links -->
		<div class="hidden items-center gap-1 md:flex">
			{#each links as link}
				<a
					href={link.href}
					class="relative px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase transition-all
						{isActive(link.href)
						? 'text-matrix text-glow'
						: 'text-text-dim hover:text-text-primary'}"
				>
					{#if isActive(link.href)}
						<span class="absolute bottom-0 left-2 right-2 h-px bg-matrix shadow-[0_0_4px_var(--color-matrix)]"></span>
					{/if}
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Status indicator -->
		<div class="hidden items-center gap-3 md:flex">
			<div class="flex items-center gap-2 border border-surface-border px-3 py-1.5">
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full rounded-full bg-matrix opacity-75"
						style="animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-matrix shadow-[0_0_4px_var(--color-matrix)]"></span>
				</span>
				<span class="font-mono text-[10px] tracking-wider text-matrix">ONLINE</span>
			</div>
		</div>

		<!-- Mobile toggle -->
		<button
			class="flex flex-col gap-1 md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle menu"
		>
			<span
				class="block h-0.5 w-5 bg-matrix transition-transform {mobileOpen ? 'translate-y-[6px] rotate-45' : ''}"
			></span>
			<span class="block h-0.5 w-5 bg-matrix transition-opacity {mobileOpen ? 'opacity-0' : ''}"></span>
			<span
				class="block h-0.5 w-5 bg-matrix transition-transform {mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}"
			></span>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div
			class="border-t border-matrix-dim/20 bg-surface/95 backdrop-blur-md md:hidden"
			style="animation: fade-in-up 0.2s ease-out;"
		>
			{#each links as link}
				<a
					href={link.href}
					onclick={() => (mobileOpen = false)}
					class="block border-b border-surface-border px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors
						{isActive(link.href) ? 'bg-matrix-dark/20 text-matrix' : 'text-text-dim hover:bg-surface-light hover:text-text-primary'}"
				>
					{#if isActive(link.href)}
						<span class="mr-2 text-matrix">&gt;</span>
					{/if}
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</nav>
