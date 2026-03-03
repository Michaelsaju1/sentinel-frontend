import { env } from '$env/dynamic/private';

function getApiBase(): string {
	return env.API_URL || 'http://localhost:5000';
}

export async function apiFetch<T>(path: string, fetchFn: typeof fetch = fetch): Promise<T> {
	const res = await fetchFn(`${getApiBase()}${path}`);
	if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
	return res.json() as Promise<T>;
}
