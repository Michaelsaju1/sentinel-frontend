// This file was developed with the assistance of Claude Code and Opus 4.6.
import { env } from '$env/dynamic/private';

function getApiBase(): string {
	return env.API_URL || 'http://localhost:5000';
}

export function getApiUrl(path: string): string {
	return `${getApiBase()}${path}`;
}

export async function apiFetch<T>(path: string, fetchFn: typeof fetch = fetch): Promise<T> {
	const res = await fetchFn(`${getApiBase()}${path}`);
	if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
	return res.json() as Promise<T>;
}

export async function apiPost<T>(
	path: string,
	body: unknown,
	fetchFn: typeof fetch = fetch
): Promise<T> {
	const res = await fetchFn(`${getApiBase()}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`API POST ${path}: ${res.status}`);
	return res.json() as Promise<T>;
}
