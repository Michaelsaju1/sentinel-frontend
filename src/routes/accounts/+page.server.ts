import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface Account {
	username: string;
	is_bot: boolean;
	bot_reason: string | null;
	total_claims: number;
	exaggerated_count: number;
	accurate_count: number;
	grifter_score: number | null;
	first_seen: string;
	last_seen: string;
}

interface AccountsResponse {
	accounts: Account[];
	count: number;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	const sort = url.searchParams.get('sort_by') ?? 'grifter_score';
	const order = url.searchParams.get('order') ?? 'desc';
	const minClaims = url.searchParams.get('min_claims') ?? '5';
	const isBot = url.searchParams.get('is_bot');

	try {
		let query = `/api/accounts?sort_by=${sort}&order=${order}&min_claims=${minClaims}&limit=100`;
		if (isBot !== null) query += `&is_bot=${isBot}`;

		const data = await apiFetch<AccountsResponse>(query, fetch);
		return { accounts: data.accounts ?? data, sort, order, minClaims };
	} catch {
		return { accounts: [], sort, order, minClaims };
	}
};
