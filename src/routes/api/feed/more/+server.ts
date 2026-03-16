import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { apiFetch } from '$lib/server/api';

interface Feed {
	claims: Record<string, unknown>[];
	count: number;
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const limit = url.searchParams.get('limit') ?? '200';
	const offset = url.searchParams.get('offset') ?? '0';
	const label = url.searchParams.get('label');
	const labels = url.searchParams.get('labels') ?? 'naive';

	let query = `/api/feed?limit=${limit}&offset=${offset}&labels=${labels}`;
	if (label) query += `&label=${label}`;

	try {
		const result = await apiFetch<Feed>(query, fetch);
		return json(result);
	} catch {
		return json({ claims: [], count: 0 }, { status: 502 });
	}
};
