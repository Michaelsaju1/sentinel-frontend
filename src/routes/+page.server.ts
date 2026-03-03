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
}

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const stats = await apiFetch<Stats>('/api/stats', fetch);
		return { stats };
	} catch {
		return { stats: null };
	}
};
