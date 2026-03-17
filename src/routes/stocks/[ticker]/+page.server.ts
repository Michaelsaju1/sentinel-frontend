// This file was developed with the assistance of Claude Code and Opus 4.6.
import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import { error } from '@sveltejs/kit';

interface StockFeed {
	claims: {
		tweet_id: number;
		text: string;
		username: string;
		created_at: string;
		label: string;
		price_change_pct: number | null;
		claimed_direction: string;
		actual_direction: string;
		confidence?: number;
		has_catalyst: boolean;
		catalyst_type: string | null;
	}[];
	count: number;
}

interface StockStats {
	ticker: string;
	total_claims: number;
	label_distribution: Record<string, number>;
	exaggeration_rate: number;
	avg_price_change: number | null;
	top_users: { username: string; count: number }[];
}

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const labels = url.searchParams.get('labels') ?? 'naive';

	try {
		const [feed, stats] = await Promise.all([
			apiFetch<StockFeed>(`/api/stocks/${params.ticker}/feed?limit=50&labels=${labels}`, fetch),
			apiFetch<StockStats>(`/api/stocks/${params.ticker}/stats?labels=${labels}`, fetch)
		]);
		return { feed, stats, ticker: params.ticker, labels };
	} catch {
		error(404, `Ticker ${params.ticker} not found`);
	}
};
