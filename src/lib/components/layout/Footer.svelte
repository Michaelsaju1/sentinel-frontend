<script lang="ts">
	let year = new Date().getFullYear();
</script>

<footer class="border-t border-surface-border bg-surface/80 backdrop-blur-sm">
	<div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
		<div class="grid gap-8 md:grid-cols-3">
			<!-- Brand -->
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center border border-matrix-dim bg-matrix-dark/30 font-display text-[8px] font-bold text-matrix"
					>
						S
					</div>
					<span class="font-display text-xs tracking-[0.25em] text-matrix-dim">SENTINEL</span>
				</div>
				<p class="font-mono text-xs leading-relaxed text-text-dim">
					Advanced threat detection and monitoring platform. Protecting digital infrastructure
					since {year}.
				</p>
			</div>

			<!-- Links -->
			<div class="space-y-3">
				<h4 class="font-display text-[10px] tracking-[0.2em] uppercase text-text-dim">
					Navigation
				</h4>
				<div class="flex flex-col gap-1.5">
					{#each [{ href: '/', label: 'Home' }, { href: '/dashboard', label: 'Dashboard' }, { href: '/intel', label: 'Intel' }, { href: '/about', label: 'Mission' }] as link}
						<a
							href={link.href}
							class="font-mono text-xs text-text-dim transition-colors hover:text-matrix"
						>
							<span class="text-matrix-dim">&gt;</span>
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
						<span class="text-text-dim">Core Systems</span>
						<span class="text-matrix">OPERATIONAL</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-text-dim">Threat Engine</span>
						<span class="text-matrix">ACTIVE</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-text-dim">Data Pipeline</span>
						<span class="text-matrix">NOMINAL</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom bar -->
		<div
			class="mt-8 flex flex-col items-center justify-between gap-2 border-t border-surface-border pt-6 md:flex-row"
		>
			<p class="font-mono text-[10px] text-text-dim">
				&copy; {year} SENTINEL DEFENSE SYSTEMS. CLASSIFIED.
			</p>
			<p class="font-mono text-[10px] text-text-dim">
				SESSION ENCRYPTED // AES-256-GCM // SECURE CHANNEL
			</p>
		</div>
	</div>
</footer>
