// This file was developed with the assistance of Claude Code and Opus 4.6.
import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface Stats {
	total_claims: number;
	label_distribution: Record<string, number>;
	top_tickers: { ticker: string; count: number }[];
	most_exaggerated_users: { username: string; count: number }[];
}

export const load: LayoutServerLoad = async ({ fetch, url }) => {
	const labels = url.searchParams.get('labels') ?? 'naive';

	try {
		const [health, stats] = await Promise.all([
			apiFetch<{ status: string; database: string; timestamp: string }>('/api/health', fetch),
			apiFetch<Stats>(`/api/stats?labels=${labels}`, fetch).catch(() => null)
		]);
		return { health, stats, labels };
	} catch {
		return {
			health: { status: 'offline', database: 'disconnected', timestamp: new Date().toISOString() },
			stats: null,
			labels
		};
	}
};
