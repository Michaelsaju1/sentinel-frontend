// This file was developed with the assistance of Claude Code and Opus 4.6.
import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface Stats {
	total_claims: number;
	label_distribution: Record<string, number>;
	catalyst_type_distribution: Record<string, number>;
	top_tickers: { ticker: string; count: number }[];
	most_exaggerated_users: { username: string; count: number }[];
	accuracy_by_ticker: {
		ticker: string;
		total: number;
		accurate: number;
		exaggerated: number;
		understated: number;
	}[];
	labels: string;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	const labels = url.searchParams.get('labels') ?? 'naive';

	try {
		const stats = await apiFetch<Stats>(`/api/stats?labels=${labels}`, fetch);
		return { stats, labels };
	} catch {
		return { stats: null, labels };
	}
};
