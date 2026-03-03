import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const health = await apiFetch<{ status: string; database: string; timestamp: string }>(
			'/api/health',
			fetch
		);
		return { health };
	} catch {
		return {
			health: { status: 'offline', database: 'disconnected', timestamp: new Date().toISOString() }
		};
	}
};
