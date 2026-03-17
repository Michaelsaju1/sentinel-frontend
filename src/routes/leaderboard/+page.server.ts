import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface LabelerStats {
	total_claims: number;
	exaggerated_count: number;
	accurate_count: number;
	understated_count: number;
	grifter_score: number | null;
	grifter_category: string;
}

interface LeaderboardAccount {
	username: string;
	is_bot: boolean;
	naive: LabelerStats;
	improved: LabelerStats;
}

interface LeaderboardResponse {
	accounts: LeaderboardAccount[];
	category: string;
	labels: string;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	const labels = url.searchParams.get('labels') ?? 'naive';

	try {
		const [grifters, signal] = await Promise.all([
			apiFetch<LeaderboardResponse>(`/api/leaderboard?category=grifters&limit=20&labels=${labels}`, fetch),
			apiFetch<LeaderboardResponse>(`/api/leaderboard?category=signal&limit=20&labels=${labels}`, fetch)
		]);
		return {
			grifters: grifters.accounts ?? grifters,
			signal: signal.accounts ?? signal,
			labels
		};
	} catch {
		return { grifters: [], signal: [], labels };
	}
};
