import { Link } from "@tanstack/react-router";
import { Activity, ChevronDown, Home, LogOut, Settings, TrendingUp } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import BetterAuthHeader from "@/integrations/better-auth/header-user";
import { ModeToggle } from "./ui/mode-toggle";
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

function UserAccountMenu() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="h-9 w-9 bg-foreground/10 animate-pulse rounded-full" />
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
						className="flex items-center gap-2 rounded-full hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<Avatar size="sm" className="border border-border/50">
							<AvatarImage src={session.user.image || undefined} />
							<AvatarFallback className="text-xs font-mono font-medium">
								{initials}
							</AvatarFallback>
						</Avatar>
						<ChevronDown size={14} className="text-foreground/50" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{session.user.name || "User"}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{session.user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<a href="/settings" className="cursor-pointer">
								<Settings size={16} />
								<span>Settings</span>
							</a>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => {
							void authClient.signOut();
						}}
						className="cursor-pointer"
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
		<Button asChild size="sm" className="h-9 text-xs font-mono uppercase tracking-wider">
			<Link to="/auth">Access Terminal</Link>
		</Button>
	);
}

export default function Header() {
	return (
		<SidebarProvider defaultOpen={false}>
			<Sidebar collapsible="offcanvas">
				<SidebarHeader className="border-b border-border/50">
					<div className="flex items-center gap-2">
						<div className="h-6 w-6 bg-foreground text-background flex items-center justify-center rounded">
							<TrendingUp size={14} />
						</div>
						<span className="text-sm font-semibold">OKANE TERMINAL</span>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<Link to="/dashboard">
											<Home size={18} />
											<span className="font-mono text-xs uppercase tracking-wider">
												Dashboard
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<a href="/signals">
											<Activity size={18} />
											<span className="font-mono text-xs uppercase tracking-wider">
												Signals
											</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<a href="/settings">
											<Settings size={18} />
											<span className="font-mono text-xs uppercase tracking-wider">
												Settings
											</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter className="border-t border-border/50">
					<BetterAuthHeader />
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				{/* Top Bar */}
				<header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="flex items-center gap-4">
							<SidebarTrigger />

							<Link to="/dashboard" className="flex items-center gap-2">
								<div className="h-8 w-8 bg-foreground text-background flex items-center justify-center rounded">
									<TrendingUp size={18} />
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-semibold tracking-tight">
										OKANE SIGNALS
									</span>
									<span className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">
										Financial Terminal
									</span>
								</div>
							</Link>
						</div>

						{/* Right Side Actions */}
						<div className="flex items-center gap-4">
							{/* Terminal Status - hidden on mobile */}
							<div className="hidden sm:flex items-center gap-4">
								<div className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
									<span className="text-xs font-mono text-foreground/50">
										MARKET: OPEN
									</span>
								</div>
								<div className="text-xs font-mono text-foreground/30">
									{new Date().toLocaleTimeString("en-US", { hour12: false })}
								</div>
							</div>
							<ModeToggle />
							<UserAccountMenu />
						</div>
					</div>
				</header>
			</SidebarInset>
		</SidebarProvider>
	);
}
