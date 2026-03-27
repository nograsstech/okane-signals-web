export interface FavoriteStrategy {
	id: number;
	userId: string;
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
	notes: string | null;
	createdAt: Date;
}

export interface FavoriteStrategyConfig {
	ticker: string;
	strategy: string;
	period: string;
	interval: string;
}

export interface FavoriteWithBacktest extends FavoriteStrategyConfig {
	isFavorite: boolean;
}
