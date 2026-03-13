import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { apiPost } from '$lib/server/api';

interface PredictResponse {
	label: string;
	model: string;
	available_models: string[];
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
