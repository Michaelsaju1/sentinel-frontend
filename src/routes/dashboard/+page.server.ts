import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface Claim {
	tweet_id: number;
	text: string;
	username: string;
	created_at: string;
	likes: number;
	retweets: number;
	ticker: string;
	company_name: string;
	price_at_tweet: number | null;
	price_24h_later: number | null;
	price_change_pct: number | null;
	news_headlines: string[];
	has_catalyst: boolean;
	catalyst_type: string | null;
	label: string;
	claimed_direction: string;
	actual_direction: string;
	exaggeration_score: number;
	news_summary: string | null;
	labeled_at: string;
}

interface Feed {
	claims: Claim[];
	count: number;
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
}

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const [feed, stats] = await Promise.all([
			apiFetch<Feed>('/api/feed?limit=200', fetch),
			apiFetch<Stats>('/api/stats', fetch)
		]);
		return { feed, stats };
	} catch {
		return { feed: { claims: [], count: 0 }, stats: null };
	}
};
