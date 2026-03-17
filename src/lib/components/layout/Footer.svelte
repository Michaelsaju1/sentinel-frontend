<script lang="ts">
	let year = new Date().getFullYear();
</script>

<footer class="border-t border-surface-border bg-surface/80 backdrop-blur-sm shadow-[0_-1px_12px_rgba(0,212,255,0.05)]">
	<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
		<div class="grid gap-8 md:grid-cols-3">
			<!-- Brand -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center border border-holo-dim bg-holo-dark/30 font-display text-[8px] font-bold text-holo"
					>
						S
					</div>
					<span class="font-display text-xs tracking-[0.25em] text-holo-dim">SENTINEL</span>
				</div>
				<p class="font-mono text-xs leading-relaxed text-text-dim">
					Defense stock credibility platform. Tracking who's right and who's full of it
					since {year}.
				</p>
			</div>

			<!-- Links -->
			<div class="space-y-3">
				<h4 class="font-display text-[10px] tracking-[0.2em] uppercase text-text-dim">
					Navigation
				</h4>
				<div class="flex flex-col gap-1.5">
					{#each [{ href: '/', label: 'Home' }, { href: '/dashboard', label: 'Feed' }, { href: '/intel', label: 'Stocks' }, { href: '/accounts', label: 'Accounts' }, { href: '/leaderboard', label: 'Leaderboard' }] as link (link.href)}
						<a
							href={link.href}
							class="font-mono text-xs text-text-dim transition-colors hover:text-holo"
						>
							<span class="text-holo-dim">&gt;</span>
							{link.label}
						</a>
					{/each}
				</div>
			</div>

			<!-- Status -->
			<div class="space-y-3">
				<h4 class="font-display text-[10px] tracking-[0.2em] uppercase text-text-dim">
					System Status
				</h4>
				<div class="space-y-2 font-mono text-xs">
					<div class="flex items-center justify-between">
						<span class="text-text-dim">Scraper</span>
						<span class="text-holo">ACTIVE</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-text-dim">Labeler</span>
						<span class="text-holo">ACTIVE</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-text-dim">Bot Classifier</span>
						<span class="text-holo">NOMINAL</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="holo-line mt-8"></div>
		<div
			class="flex flex-col items-center justify-between gap-2 pt-6 md:flex-row"
		>
			<p class="font-mono text-[10px] text-text-dim">
				&copy; {year} SENTINEL DEFENSE SYSTEMS. CLASSIFIED.
			</p>
			<p class="font-mono text-[10px] text-text-dim">
				CREDIBILITY MONITORING // REAL-TIME // BOT-FILTERED
			</p>
		</div>
	</div>
</footer>
