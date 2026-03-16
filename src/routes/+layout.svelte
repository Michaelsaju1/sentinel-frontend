<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import { NavBar } from '$lib/components/layout';
	import { Footer } from '$lib/components/layout';
	import {
		ScanlineOverlay,
		BootSequence,
		GlobeNetwork,
		GlitchText,
		TypewriterText
	} from '$lib/components/ui';

	let { data, children } = $props();

	// Boot gate: block all pages until boot sequence completes
	const wasBooted = browser && sessionStorage.getItem('sentinel-booted') === 'true';
	let booted = $state(wasBooted);
	let bootActive = $state(false);

	function startBoot() {
		bootActive = true;
	}

	function onBootComplete() {
		bootActive = false;
		booted = true;
		if (browser) sessionStorage.setItem('sentinel-booted', 'true');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SENTINEL // Defense System</title>
</svelte:head>

<ScanlineOverlay opacity={0.02} />

{#if !booted}
	<!-- Boot gate: blocks ALL pages until boot sequence runs -->
	<BootSequence active={bootActive} onComplete={onBootComplete} />

	{#if !bootActive}
		<section class="sleep-screen">
			<!-- Globe background -->
			<div class="absolute inset-0">
				<GlobeNetwork nodeCount={40} rotationSpeed={0.002} opacity={0.7} />
			</div>

			<!-- Dark vignette -->
			<div class="vignette"></div>

			<!-- Scan line sweep -->
			<div class="scan-sweep"></div>

			<!-- Centered branding -->
			<div class="relative z-10 flex flex-col items-center px-4 text-center">
				<!-- Status badge -->
				<div
					class="mb-8 inline-flex items-center gap-2 border border-holo-dim/20 bg-base/70 px-4 py-1.5 backdrop-blur-sm"
				>
					<span class="relative flex h-2 w-2">
						<span class="ping-ring"></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-holo"></span>
					</span>
					<span class="font-mono text-[10px] tracking-[0.3em] text-holo/80"
						>AWAITING AUTHORIZATION</span
					>
				</div>

				<!-- Title -->
				<h1 class="mb-3">
					<GlitchText
						tag="span"
						class="block font-display text-6xl font-bold tracking-wider text-text-bright md:text-8xl"
						intensity="low"
					>
						SENTINEL
					</GlitchText>
				</h1>
				<p class="mb-2 font-mono text-sm tracking-[0.2em] text-holo-dim/70 md:text-base">
					DEFENSE STOCK CREDIBILITY PLATFORM
				</p>
				<p class="mb-8 font-mono text-[10px] tracking-[0.25em] text-text-dim/50">
					CLASSIFICATION: UNCLASSIFIED // FOUO
				</p>

				<!-- Typewriter -->
				<div class="mb-10 h-7">
					<TypewriterText
						text="Systems dormant. Authorization required to initialize credibility monitoring."
						speed={40}
						delay={1000}
						class="text-sm text-text-dim/70"
					/>
				</div>

				<!-- Initialize button -->
				<button class="init-button" onclick={startBoot}>
					<span class="init-button-border"></span>
					<span class="init-button-text">INITIALIZE SYSTEMS</span>
				</button>
			</div>
		</section>
	{/if}
{:else}
	<div class="flex min-h-screen flex-col">
		<NavBar apiStatus={data.health?.status ?? 'offline'} />
		<main class="relative flex-1">
			{@render children()}
		</main>
		<Footer />
	</div>
{/if}

<style>
	.sleep-screen {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		overflow: hidden;
		background: #020810;
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 20%,
			rgba(2, 8, 16, 0.7) 55%,
			rgba(2, 8, 16, 0.95) 85%
		);
		pointer-events: none;
		z-index: 5;
	}

	.scan-sweep {
		position: absolute;
		inset: 0;
		z-index: 6;
		pointer-events: none;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 212, 255, 0.03) 50%,
			transparent 51%,
			transparent 100%
		);
		background-size: 100% 200%;
		animation: sweep 8s linear infinite;
	}

	@keyframes sweep {
		0% {
			background-position: 0% -100%;
		}
		100% {
			background-position: 0% 200%;
		}
	}

	.ping-ring {
		position: absolute;
		display: inline-flex;
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		background-color: rgba(0, 212, 255, 0.75);
		opacity: 0.75;
		animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	@keyframes ping {
		75%,
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.init-button {
		position: relative;
		padding: 14px 36px;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: 'Orbitron', sans-serif;
		transition: all 0.3s ease;
	}

	.init-button:hover {
		transform: scale(1.02);
	}

	.init-button:hover .init-button-border {
		border-color: rgba(0, 212, 255, 0.8);
		box-shadow:
			0 0 15px rgba(0, 212, 255, 0.3),
			inset 0 0 15px rgba(0, 212, 255, 0.05);
	}

	.init-button:hover .init-button-text {
		text-shadow:
			0 0 10px rgba(0, 212, 255, 0.8),
			0 0 20px rgba(0, 212, 255, 0.4);
	}

	.init-button-border {
		position: absolute;
		inset: 0;
		border: 1px solid rgba(0, 212, 255, 0.4);
		transition: all 0.3s ease;
	}

	.init-button-border::before,
	.init-button-border::after {
		content: '';
		position: absolute;
		width: 8px;
		height: 8px;
		border-color: rgba(0, 212, 255, 0.8);
		border-style: solid;
	}

	.init-button-border::before {
		top: -1px;
		left: -1px;
		border-width: 2px 0 0 2px;
	}

	.init-button-border::after {
		bottom: -1px;
		right: -1px;
		border-width: 0 2px 2px 0;
	}

	.init-button-text {
		position: relative;
		font-size: 0.75rem;
		letter-spacing: 0.3em;
		color: rgba(0, 212, 255, 0.9);
		text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
	}
</style>
