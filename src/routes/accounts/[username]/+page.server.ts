import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import { error } from '@sveltejs/kit';

interface AccountDetail {
	username: string;
	is_bot: boolean;
	account_type: string;
	bot_reason: string | null;
	total_claims: number;
	exaggerated_count: number;
	accurate_count: number;
	naive_grifter_score: number | null;
	improved_grifter_score: number | null;
	grifter_score: number | null;
	first_seen: string;
	last_seen: string;
	classified_at: string | null;
	claims: {
		tweet_id: number;
		text: string;
		ticker: string;
		label: string;
		price_change_pct: number | null;
		created_at: string;
		confidence?: number;
	}[];
}

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const labels = url.searchParams.get('labels') ?? 'naive';

	try {
		const account = await apiFetch<AccountDetail>(`/api/accounts/${params.username}?labels=${labels}`, fetch);
		return { account, labels };
	} catch {
		error(404, `Account @${params.username} not found`);
	}
};
