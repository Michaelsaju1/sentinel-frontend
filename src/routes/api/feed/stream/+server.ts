// This file was developed with the assistance of Claude Code and Opus 4.6.
import type { RequestHandler } from '@sveltejs/kit';
import { getApiUrl } from '$lib/server/api';

export const GET: RequestHandler = async ({ fetch }) => {
	const upstream = await fetch(getApiUrl('/api/feed/stream'), {
		headers: { Accept: 'text/event-stream' }
	});

	return new Response(upstream.body, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
