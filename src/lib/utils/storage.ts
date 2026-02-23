// Type-safe localStorage/sessionStorage wrappers with SSR safety

export const storage = {
	get: <T>(key: string, defaultValue?: T): T | null => {
		if (typeof window === "undefined") return defaultValue ?? null;
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : (defaultValue ?? null);
		} catch {
			return defaultValue ?? null;
		}
	},

	set: <T>(key: string, value: T): void => {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error("Error saving to localStorage:", error);
		}
	},

	getSession: <T>(key: string, defaultValue?: T): T | null => {
		if (typeof window === "undefined") return defaultValue ?? null;
		try {
			const item = window.sessionStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : (defaultValue ?? null);
		} catch {
			return defaultValue ?? null;
		}
	},

	setSession: <T>(key: string, value: T): void => {
		if (typeof window === "undefined") return;
		try {
			window.sessionStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error("Error saving to sessionStorage:", error);
		}
	},
};
