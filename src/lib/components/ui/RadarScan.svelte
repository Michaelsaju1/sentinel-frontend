<script lang="ts">
	let {
		size = 200,
		class: className = ''
	}: {
		size?: number;
		class?: string;
	} = $props();
</script>

<div
	class="relative rounded-full border border-holo-dim {className}"
	style="width: {size}px; height: {size}px;"
>
	<!-- Concentric rings -->
	<div
		class="absolute rounded-full border border-holo-dim/30"
		style="inset: 15%; width: 70%; height: 70%;"
	></div>
	<div
		class="absolute rounded-full border border-holo-dim/20"
		style="inset: 30%; width: 40%; height: 40%;"
	></div>

	<!-- Cross hairs -->
	<div class="absolute top-0 bottom-0 left-1/2 w-px bg-holo-dim/30"></div>
	<div class="absolute left-0 right-0 top-1/2 h-px bg-holo-dim/30"></div>

	<!-- Sweep line -->
	<div
		class="absolute top-1/2 left-1/2 origin-bottom-left"
		style="width: {size / 2}px; height: 2px; animation: radar-sweep 3s linear infinite;"
	>
		<div
			class="h-full w-full rounded-full"
			style="background: linear-gradient(90deg, var(--color-holo), transparent);"
		></div>
	</div>

	<!-- Sweep glow cone -->
	<div
		class="absolute inset-0 rounded-full"
		style="
			background: conic-gradient(
				from 0deg at 50% 50%,
				transparent 0deg,
				rgba(0, 212, 255, 0.08) 0deg,
				transparent 40deg
			);
			animation: radar-sweep 3s linear infinite;
		"
	></div>

	<!-- Center dot -->
	<div class="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-holo shadow-[0_0_6px_var(--color-holo)]"></div>

	<!-- Blips -->
	<div
		class="absolute h-1.5 w-1.5 rounded-full bg-holo shadow-[0_0_4px_var(--color-holo)]"
		style="top: 30%; left: 60%; animation: flicker 2s ease-in-out infinite;"
	></div>
	<div
		class="absolute h-1.5 w-1.5 rounded-full bg-holo-accent shadow-[0_0_4px_var(--color-holo-accent)]"
		style="top: 55%; left: 25%; animation: flicker 3s ease-in-out infinite 1s;"
	></div>
	<div
		class="absolute h-1 w-1 rounded-full bg-holo-bright shadow-[0_0_4px_var(--color-holo-bright)]"
		style="top: 70%; left: 65%; animation: flicker 2.5s ease-in-out infinite 0.5s;"
	></div>
</div>
