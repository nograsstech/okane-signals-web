// Number and date formatting utilities

export const format = {
	percentage: (value: number): string => {
		return (value * 100).toFixed(2);
	},

	decimal: (value: number): string => {
		return value.toFixed(2);
	},

	date: (date: string | Date): string => {
		return new Date(date).toLocaleString();
	},

	dateTime: (date: string | Date): string => {
		return new Date(date).toLocaleString();
	},
};
