<script lang="ts">
	// This file was developed with the assistance of Claude Code and Opus 4.6.
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';

	let {
		lines = [],
		prompt = 'sentinel@hq:~$',
		stats = null,
		class: className = ''
	}: {
		lines?: { type?: 'input' | 'output' | 'error' | 'success'; text: string }[];
		prompt?: string;
		stats?: {
			totalClaims: number;
			exaggerated: number;
			accurate: number;
			understated: number;
			accuracyRate: string;
			topTickerCount: number;
			topTickers: { ticker: string; count: number }[];
			topExaggerators: { username: string; count: number }[];
		} | null;
		class?: string;
	} = $props();

	type Line = { type?: 'input' | 'output' | 'error' | 'success'; text: string };

	let userLines: Line[] = $state([]);
	let inputValue = $state('');
	let cmdHistory: string[] = $state([]);
	let cmdHistoryIndex = $state(-1);
	let scrollContainer: HTMLDivElement | undefined = $state();

	// Combine initial lines (reactive to prop changes) with user-added lines
	const history = $derived([...lines, ...userLines]);

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}

	function addLines(...newLines: Line[]) {
		userLines = [...userLines, ...newLines];
		scrollToBottom();
	}

	function processCommand(raw: string) {
		const trimmed = raw.trim();
		if (!trimmed) return;

		cmdHistory = [trimmed, ...cmdHistory];
		cmdHistoryIndex = -1;
		addLines({ type: 'input', text: trimmed });

		const [cmd, ...args] = trimmed.split(/\s+/);
		const arg = args.join(' ');

		switch (cmd.toLowerCase()) {
			case 'help':
				addLines(
					{ type: 'output', text: 'Available commands:' },
					{ type: 'output', text: '  status          Pipeline health & system status' },
					{ type: 'output', text: '  stats           Current claim statistics' },
					{ type: 'output', text: '  scan <TICKER>   Look up a defense stock ticker' },
					{ type: 'output', text: '  whois <user>    Look up an account\'s credibility' },
					{ type: 'output', text: '  top tickers     Most discussed tickers' },
					{ type: 'output', text: '  top grifters    Highest grifter scores' },
					{ type: 'output', text: '  clear           Clear terminal' },
					{ type: 'output', text: '  version         System version info' },
					{ type: 'output', text: '  uptime          System uptime' },
					{ type: 'output', text: '' },
					{ type: 'output', text: '  Navigation:' },
					{ type: 'output', text: '  feed            Go to claim feed' },
					{ type: 'output', text: '  stocks          Go to defense stocks' },
					{ type: 'output', text: '  accounts        Go to account credibility' }
				);
				break;

			case 'status':
				addLines(
					{ type: 'output', text: 'SENTINEL PIPELINE STATUS' },
					{ type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
					{ type: 'success', text: 'Twitter Scraper .... ACTIVE' },
					{ type: 'success', text: 'Price Feed ......... ACTIVE' },
					{ type: 'success', text: 'Bot Classifier ..... ACTIVE' },
					{ type: 'success', text: 'Labeler Engine ..... ACTIVE' },
					{
						type: 'output',
						text: `Accuracy: ${stats?.accuracyRate ?? '—'}% | Tickers: ${stats?.topTickerCount ?? '—'} | Claims: ${stats?.totalClaims?.toLocaleString() ?? '—'}`
					},
					{ type: 'success', text: 'All systems nominal.' }
				);
				break;

			case 'stats':
				if (!stats) {
					addLines({ type: 'error', text: 'Stats unavailable. Backend may be offline.' });
				} else {
					addLines(
						{ type: 'output', text: 'CLAIM ANALYSIS REPORT' },
						{ type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
						{ type: 'output', text: `  Total claims:   ${stats.totalClaims.toLocaleString()}` },
						{ type: 'output', text: `  Exaggerated:    ${stats.exaggerated.toLocaleString()} (${stats.totalClaims > 0 ? ((stats.exaggerated / stats.totalClaims) * 100).toFixed(1) : '0'}%)` },
						{ type: 'output', text: `  Accurate:       ${stats.accurate.toLocaleString()} (${stats.totalClaims > 0 ? ((stats.accurate / stats.totalClaims) * 100).toFixed(1) : '0'}%)` },
						{ type: 'output', text: `  Understated:    ${stats.understated.toLocaleString()} (${stats.totalClaims > 0 ? ((stats.understated / stats.totalClaims) * 100).toFixed(1) : '0'}%)` },
						{ type: 'output', text: `  Tickers:        ${stats.topTickerCount}` },
						{ type: 'output', text: `  Accuracy rate:  ${stats.accuracyRate}%` }
					);
				}
				break;

			case 'scan': {
				if (!arg) {
					addLines({ type: 'error', text: 'Usage: scan <TICKER>  (e.g., scan PLTR)' });
				} else {
					const ticker = arg.toUpperCase();
					addLines(
						{ type: 'output', text: `Scanning ${ticker}...` },
						{ type: 'success', text: `Navigating to /stocks/${ticker}` }
					);
					setTimeout(() => goto(`/stocks/${ticker}`), 600);
				}
				break;
			}

			case 'whois': {
				if (!arg) {
					addLines({ type: 'error', text: 'Usage: whois <username>  (e.g., whois elonmusk)' });
				} else {
					const user = arg.replace(/^@/, '');
					addLines(
						{ type: 'output', text: `Looking up @${user}...` },
						{ type: 'success', text: `Navigating to /accounts/${user}` }
					);
					setTimeout(() => goto(`/accounts/${user}`), 600);
				}
				break;
			}

			case 'top':
				if (arg.toLowerCase() === 'tickers') {
					if (!stats?.topTickers?.length) {
						addLines({ type: 'output', text: 'No ticker data available.' });
					} else {
						addLines(
							{ type: 'output', text: 'TOP TICKERS BY CLAIM VOLUME' },
							{ type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
						);
						for (const t of stats.topTickers.slice(0, 10)) {
							addLines({
								type: 'output',
								text: `  ${t.ticker.padEnd(8)} ${t.count} claims`
							});
						}
					}
				} else if (arg.toLowerCase() === 'grifters' || arg.toLowerCase() === 'exaggerators') {
					if (!stats?.topExaggerators?.length) {
						addLines({ type: 'output', text: 'No grifter data available.' });
					} else {
						addLines(
							{ type: 'output', text: 'TOP EXAGGERATORS' },
							{ type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' }
						);
						for (const u of stats.topExaggerators.slice(0, 10)) {
							addLines({
								type: 'output',
								text: `  @${u.username.padEnd(18)} ${u.count} exaggerated`
							});
						}
					}
				} else {
					addLines({ type: 'error', text: 'Usage: top [tickers|grifters]' });
				}
				break;

			case 'clear':
				userLines = [];
				break;

			case 'version':
				addLines(
					{ type: 'output', text: 'SENTINEL Credibility Analysis Platform' },
					{ type: 'output', text: 'Version 2.1.0 // Build 2026.03.17' },
					{ type: 'output', text: 'Runtime: SvelteKit + Bun' },
					{ type: 'output', text: 'Backend: Flask + PostgreSQL' }
				);
				break;

			case 'uptime': {
				const hours = Math.floor(Math.random() * 72) + 24;
				const mins = Math.floor(Math.random() * 60);
				addLines({
					type: 'output',
					text: `up ${hours}h ${mins}m | load: 0.${Math.floor(Math.random() * 40 + 10)} | mem: ${Math.floor(Math.random() * 30 + 40)}%`
				});
				break;
			}

			case 'feed':
				addLines({ type: 'success', text: 'Navigating to claim feed...' });
				setTimeout(() => goto('/dashboard'), 400);
				break;

			case 'stocks':
			case 'intel':
				addLines({ type: 'success', text: 'Navigating to defense stocks...' });
				setTimeout(() => goto('/stocks'), 400);
				break;

			case 'accounts':
				addLines({ type: 'success', text: 'Navigating to account credibility...' });
				setTimeout(() => goto('/accounts'), 400);
				break;

			case 'sudo':
				addLines(
					{ type: 'error', text: 'Nice try. SENTINEL operates under zero-trust architecture.' },
					{ type: 'output', text: 'Your attempt has been logged.' }
				);
				break;

			case 'rm':
				addLines({ type: 'error', text: 'Destructive operations disabled. This is a credibility platform, not a shredder.' });
				break;

			case 'exit':
			case 'quit':
			case 'logout':
				addLines({ type: 'output', text: 'There is no escape from SENTINEL. You are being monitored.' });
				break;

			case 'hack':
			case 'exploit':
				addLines(
					{ type: 'error', text: 'INTRUSION DETECTED' },
					{ type: 'output', text: 'Just kidding. Type "help" for real commands.' }
				);
				break;

			case 'ping':
				addLines(
					{ type: 'output', text: `PING sentinel-backend.michaelsaju.com` },
					{ type: 'output', text: `64 bytes: seq=1 time=${(Math.random() * 20 + 5).toFixed(1)}ms` },
					{ type: 'output', text: `64 bytes: seq=2 time=${(Math.random() * 20 + 5).toFixed(1)}ms` },
					{ type: 'output', text: `64 bytes: seq=3 time=${(Math.random() * 20 + 5).toFixed(1)}ms` },
					{ type: 'success', text: 'Backend reachable.' }
				);
				break;

			case 'whoami':
				addLines({ type: 'output', text: 'OPERATOR // Clearance: FULL ACCESS // Session: ACTIVE' });
				break;

			case 'neofetch':
				addLines(
					{ type: 'output', text: '  ╔═══════════════╗   SENTINEL' },
					{ type: 'output', text: '  ║   S E N T I   ║   ────────────────────' },
					{ type: 'output', text: '  ║   N E L . .   ║   Platform: SvelteKit + Flask' },
					{ type: 'output', text: '  ║   . . . . .   ║   Host: Hetzner VPS (the wimpy $5 one)' },
					{ type: 'output', text: '  ╚═══════════════╝   Claims: ' + (stats?.totalClaims?.toLocaleString() ?? '—') },
					{ type: 'output', text: '                      Tickers: ' + (stats?.topTickerCount ?? '—') },
					{ type: 'output', text: '                      Grifters: too many' }
				);
				break;

			default:
				addLines({ type: 'error', text: `Unknown command: ${cmd}. Type "help" for available commands.` });
				break;
		}

		scrollToBottom();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			processCommand(inputValue);
			inputValue = '';
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (cmdHistory.length > 0 && cmdHistoryIndex < cmdHistory.length - 1) {
				cmdHistoryIndex++;
				inputValue = cmdHistory[cmdHistoryIndex];
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (cmdHistoryIndex > 0) {
				cmdHistoryIndex--;
				inputValue = cmdHistory[cmdHistoryIndex];
			} else {
				cmdHistoryIndex = -1;
				inputValue = '';
			}
		}
	}
</script>

<div
	class="flex flex-col overflow-hidden border border-surface-border bg-surface font-mono text-sm {className}"
>
	<!-- Title bar -->
	<div class="flex items-center gap-2 border-b border-surface-border bg-surface-light px-3 py-1.5">
		<div class="flex gap-1.5">
			<span class="h-2 w-2 rounded-full bg-danger/70"></span>
			<span class="h-2 w-2 rounded-full bg-warning/70"></span>
			<span class="h-2 w-2 rounded-full bg-holo/70"></span>
		</div>
		<span class="text-[10px] tracking-wider text-holo-dim">SENTINEL TERMINAL v2.1.0</span>
		<span class="ml-auto text-[9px] tracking-wider text-text-dim/40">type "help" for commands</span>
	</div>

	<!-- Terminal history -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={scrollContainer}
		class="terminal-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pt-3"
		onclick={() => document.getElementById('terminal-input')?.focus()}
	>
		{#each history as line, i (i)}
			<div style="animation: fade-in-up 0.2s ease-out {Math.min(i, 10) * 30}ms both;">
				{#if line.type === 'input'}
					<div class="flex gap-2">
						<span class="text-holo-dim">{prompt}</span>
						<span class="text-text-primary">{line.text}</span>
					</div>
				{:else if line.type === 'error'}
					<div class="text-danger">[ERROR] {line.text}</div>
				{:else if line.type === 'success'}
					<div class="text-holo">[OK] {line.text}</div>
				{:else}
					<div class="text-text-dim">{line.text}</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Input line (pinned to bottom) -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex items-center gap-2 border-t border-surface-border/30 px-3 py-2"
		onclick={() => document.getElementById('terminal-input')?.focus()}
	>
		<span class="flex-shrink-0 text-holo-dim">{prompt}</span>
		<input
			id="terminal-input"
			type="text"
			bind:value={inputValue}
			onkeydown={handleKeydown}
			class="flex-1 bg-transparent text-text-primary caret-holo outline-none"
			spellcheck="false"
			autocomplete="off"
		/>
	</div>
</div>

<style>
	.terminal-scroll::-webkit-scrollbar {
		width: 4px;
	}

	.terminal-scroll::-webkit-scrollbar-track {
		background: rgba(4, 10, 18, 0.5);
	}

	.terminal-scroll::-webkit-scrollbar-thumb {
		background: rgba(0, 212, 255, 0.3);
	}
</style>
