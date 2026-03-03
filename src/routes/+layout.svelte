<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { NavBar } from '$lib/components/layout';
	import { Footer } from '$lib/components/layout';
	import { ScanlineOverlay } from '$lib/components/ui';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SENTINEL // Defense System</title>
</svelte:head>

<ScanlineOverlay opacity={0.02} />

<div class="flex min-h-screen flex-col">
	<NavBar />
	<main class="relative flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
