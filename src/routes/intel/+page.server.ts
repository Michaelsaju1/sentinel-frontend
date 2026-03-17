import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface Stocks {
	stocks: Record<string, string | null>;
	ticker_names: Record<string, string>;
}

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
		const [stocks, stats] = await Promise.all([
			apiFetch<Stocks>('/api/stocks', fetch),
			apiFetch<Stats>(`/api/stats?labels=${labels}`, fetch)
		]);
		return { stocks, stats, labels };
	} catch {
		return { stocks: null, stats: null, labels };
	}
};
