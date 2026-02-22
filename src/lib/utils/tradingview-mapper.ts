// TradingView symbol mapper
// Maps ticker symbols from the backend format to TradingView format

export const TradingViewSymbolMapper: Record<string, string> = {
	"BTC-USD": "BTCUSD",
	"ETH-USD": "ETHUSD",
	"LTC-USD": "LTCUSD",
	"USDJPY=X": "USDJPY",
	"EURUSD=X": "EURUSD",
	"EURJPY=X": "EURJPY",
	"GBPUSD=X": "GBPUSD",
	"USDCHF=X": "USDCHF",
	"AUDUSD=X": "AUDUSD",
	"USDCAD=X": "USDCAD",
	"NZDUSD=X": "NZDUSD",
	"GBPJPY=X": "GBPJPY",
	"EURGBP=X": "EURGBP",
	"^SPX": "SP:SPX",
	"^DJI": "DJI",
	"^NDX": "NDX",
	"GC=F": "GOLD",
};

export function getTradingViewSymbol(ticker: string): string {
	return TradingViewSymbolMapper[ticker] || ticker;
}
