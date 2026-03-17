import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { apiPost } from '$lib/server/api';

interface PredictResponse {
	label: string;
	confidence?: number;
	model: string;
	available_models: string[];
	account?: {
		username: string;
		naive?: {
			grifter_score: number | null;
			grifter_category: string;
			total_claims: number;
		};
		improved?: {
			grifter_score: number | null;
			grifter_category: string;
			total_claims: number;
		};
	};
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const body = await request.json();

	try {
		const result = await apiPost<PredictResponse>('/api/predict', body, fetch);
		return json(result);
	} catch (e) {
		return json({ error: 'Prediction failed' }, { status: 502 });
	}
};
