<script lang="ts">
	import { page } from '$app/state';

	let { apiStatus = 'offline' }: { apiStatus?: string } = $props();

	let mobileOpen = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/dashboard', label: 'Feed' },
		{ href: '/intel', label: 'Stocks' },
		{ href: '/accounts', label: 'Accounts' },
		{ href: '/leaderboard', label: 'Leaderboard' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	const statusDisplay = $derived(
		apiStatus === 'healthy'
			? { text: 'ONLINE', color: 'bg-holo', textColor: 'text-holo' }
			: apiStatus === 'degraded'
				? { text: 'DEGRADED', color: 'bg-warning', textColor: 'text-warning' }
				: { text: 'OFFLINE', color: 'bg-danger', textColor: 'text-danger' }
	);
</script>

<nav class="hologram-flicker relative z-40 border-b border-holo-dim/30 bg-surface/90 backdrop-blur-md shadow-[0_1px_12px_rgba(0,212,255,0.08)]">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
		<!-- Logo -->
		<a href="/" class="group flex items-center gap-3">
			<div
				class="flex h-8 w-8 items-center justify-center border border-holo bg-holo-dark/50 font-display text-xs font-bold text-holo shadow-[0_0_10px_var(--color-holo-dim),inset_0_0_6px_rgba(0,212,255,0.1)] transition-all group-hover:shadow-[0_0_20px_var(--color-holo-dim),inset_0_0_10px_rgba(0,212,255,0.15)]"
			>
				S
			</div>
			<div>
				<span class="font-display text-sm tracking-[0.3em] text-holo text-glow">SENTINEL</span>
				<div class="font-mono text-[8px] tracking-widest text-text-dim">DEFENSE SYSTEM v3.1</div>
			</div>
		</a>

		<!-- Desktop links -->
		<div class="hidden items-center gap-1 md:flex">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="relative px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase transition-all
						{isActive(link.href)
						? 'text-holo text-glow'
						: 'text-text-dim hover:text-text-primary'}"
				>
					{#if isActive(link.href)}
						<span class="absolute bottom-0 left-2 right-2 h-px bg-holo shadow-[0_0_6px_var(--color-holo),0_0_12px_var(--color-holo-dim)]"></span>
					{/if}
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Status indicator -->
		<div class="hidden items-center gap-3 md:flex">
			<div class="flex items-center gap-2 border border-surface-border bg-surface/50 px-3 py-1.5">
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full rounded-full {statusDisplay.color} opacity-75"
						style="animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full {statusDisplay.color} shadow-[0_0_6px_var(--color-holo)]"></span>
				</span>
				<span class="font-mono text-[10px] tracking-wider {statusDisplay.textColor}">{statusDisplay.text}</span>
			</div>
		</div>

		<!-- Mobile toggle -->
		<button
			class="flex flex-col gap-1 md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle menu"
		>
			<span
				class="block h-0.5 w-5 bg-holo transition-transform {mobileOpen ? 'translate-y-[6px] rotate-45' : ''}"
			></span>
			<span class="block h-0.5 w-5 bg-holo transition-opacity {mobileOpen ? 'opacity-0' : ''}"></span>
			<span
				class="block h-0.5 w-5 bg-holo transition-transform {mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}"
			></span>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<div
			class="border-t border-holo-dim/20 bg-surface/95 backdrop-blur-md md:hidden"
			style="animation: fade-in-up 0.2s ease-out;"
		>
			{#each links as link (link.href)}
				<a
					href={link.href}
					onclick={() => (mobileOpen = false)}
					class="block border-b border-surface-border px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors
						{isActive(link.href) ? 'bg-holo-dark/20 text-holo' : 'text-text-dim hover:bg-surface-light hover:text-text-primary'}"
				>
					{#if isActive(link.href)}
						<span class="mr-2 text-holo">&gt;</span>
					{/if}
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</nav>
