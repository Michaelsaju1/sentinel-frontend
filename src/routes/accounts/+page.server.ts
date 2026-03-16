import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface Account {
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
}

interface AccountsResponse {
	accounts: Account[];
	count: number;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	const labels = url.searchParams.get('labels') ?? 'naive';
	const sort = url.searchParams.get('sort_by') ?? (labels === 'improved' ? 'improved_grifter_score' : 'naive_grifter_score');
	const order = url.searchParams.get('order') ?? 'desc';
	const minClaims = url.searchParams.get('min_claims') ?? '5';
	const accountType = url.searchParams.get('account_type');

	try {
		let query = `/api/accounts?sort_by=${sort}&order=${order}&min_claims=${minClaims}&limit=100&labels=${labels}`;
		if (accountType !== null) query += `&account_type=${accountType}`;

		const data = await apiFetch<AccountsResponse>(query, fetch);
		return { accounts: data.accounts ?? data, sort, order, minClaims, labels };
	} catch {
		return { accounts: [], sort, order, minClaims, labels };
	}
};
