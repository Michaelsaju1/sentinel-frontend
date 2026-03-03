// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			health?: { status: string; database: string; timestamp: string };
			stats?: {
				total_claims: number;
				label_distribution: Record<string, number>;
				catalyst_type_distribution: Record<string, number>;
				top_tickers: { ticker: string; count: number }[];
				most_exaggerated_users: { username: string; count: number }[];
				accuracy_by_ticker: {
					ticker: string;
					total: number;
					accurate: number;
					exaggerated: number;
					understated: number;
				}[];
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
