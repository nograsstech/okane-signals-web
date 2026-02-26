import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, BarChart2, BrainCircuit, ChevronDown, LogOut, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({ component: Landing });

function UserAccountMenu() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="h-9 w-9 bg-zinc-800 animate-pulse rounded-full" />
		);
	}

	if (session?.user) {
		const initials =
			session.user.name
				?.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2) || "U";

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex items-center gap-2 rounded-full hover:bg-zinc-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
					>
						<Avatar size="sm" className="border border-zinc-700">
							<AvatarImage src={session.user.image || undefined} />
							<AvatarFallback className="text-xs font-mono font-medium bg-zinc-800 text-zinc-100">
								{initials}
							</AvatarFallback>
						</Avatar>
						<ChevronDown size={14} className="text-zinc-500" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none text-zinc-100">
								{session.user.name || "User"}
							</p>
							<p className="text-xs leading-none text-zinc-400">
								{session.user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-zinc-800" />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<a href="/settings" className="cursor-pointer focus:bg-zinc-800">
								<Settings size={16} />
								<span>Settings</span>
							</a>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator className="bg-zinc-800" />
					<DropdownMenuItem
						onClick={() => {
							void authClient.signOut();
						}}
						className="cursor-pointer focus:bg-zinc-800"
					>
						<LogOut size={16} />
						<span>Sign out</span>
						<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Link to="/auth/login">
			<Button
				variant="ghost"
				className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white px-3"
			>
				Log In
			</Button>
		</Link>
	);
}

function Landing() {
	return (
<div className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white flex flex-col">
			{/* Nav — matches Header.tsx brand identity exactly */}
			<header className="flex items-center justify-between px-4 py-3 border-b border-zinc-900/60 shrink-0 bg-black/80 backdrop-blur-sm">
				<Link to="/" className="flex items-center gap-2">
					<div className="h-8 w-8 bg-white text-black flex items-center justify-center rounded">
						<TrendingUp size={18} />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-semibold tracking-tight">OKANE SIGNALS</span>
						<span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Financial Terminal</span>
					</div>
				</Link>

				<div className="flex items-center gap-4">
					<div className="hidden sm:flex items-center gap-4">
						<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Market: Open</span>
					</div>

					<UserAccountMenu />
				</div>
			</header>

			{/* Hero */}
			<main className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden">
				<div
					aria-hidden="true"
					className="absolute top-1/2 left-0 -translate-y-1/2 text-[18vw] font-black text-zinc-900/20 leading-none select-none pointer-events-none tracking-tighter"
				>
					QUANT
					<br />
					SYSTEM
				</div>

				<div className="max-w-4xl pt-20 pb-32 relative">
					<h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter leading-[0.88] text-white mb-8">
						Signals, backtest,
						<br />
						<span className="text-zinc-500">AI analysis.</span>
					</h1>

					<p className="max-w-xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12">
						Run equity strategies, backtest them against historical data, and get AI-powered market analysis — all in one systematic platform.
					</p>

					<div className="flex flex-col sm:flex-row items-start gap-4">
						<Link to="/dashboard" className="w-full sm:w-auto inline-block">
							<Button
								size="lg"
								className="w-full sm:w-auto rounded-none bg-white text-black hover:bg-zinc-200 uppercase tracking-widest text-xs font-bold px-8 h-14 group transition-all"
							>
								Enter Terminal
								<ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</Link>
						<Link to="/auth/register" className="w-full sm:w-auto inline-block">
							<Button
								variant="outline"
								size="lg"
								className="w-full sm:w-auto rounded-none border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 uppercase tracking-widest text-xs font-bold px-8 h-14"
							>
								Sign up free
							</Button>
						</Link>
					</div>
				</div>
			</main>

			{/* Feature strip */}
			<footer className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-900 shrink-0">
				<div className="p-8 border-b md:border-b-0 md:border-r border-zinc-900 group cursor-pointer hover:bg-zinc-950 transition-colors">
					<Activity className="w-5 h-5 text-zinc-600 mb-6 group-hover:text-white transition-colors" />
					<h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wide mb-2">Live Signals</h3>
					<p className="text-xs text-zinc-500 leading-relaxed">
						Systematic buy/sell signals generated from equity strategies running on periodically refreshed market data.
					</p>
				</div>
				<div className="p-8 border-b md:border-b-0 md:border-r border-zinc-900 group cursor-pointer hover:bg-zinc-950 transition-colors">
					<BarChart2 className="w-5 h-5 text-zinc-600 mb-6 group-hover:text-white transition-colors" />
					<h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wide mb-2">Strategy Backtesting</h3>
					<p className="text-xs text-zinc-500 leading-relaxed">
						Validate strategies against historical OHLCV data. Track performance stats, drawdowns, and trade actions.
					</p>
				</div>
				<div className="p-8 group cursor-pointer hover:bg-zinc-950 transition-colors">
					<BrainCircuit className="w-5 h-5 text-zinc-600 mb-6 group-hover:text-white transition-colors" />
					<h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wide mb-2">AI Market Analysis</h3>
					<p className="text-xs text-zinc-500 leading-relaxed">
						AI-powered analysis of ticker data and market news, surfacing context that complements quantitative signals.
					</p>
				</div>
			</footer>
		</div>
	);
}
