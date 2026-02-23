import { Link } from "@tanstack/react-router";
import BetterAuthHeader from "@/integrations/better-auth/header-user";
import { Home, TrendingUp, Activity, Settings } from "lucide-react";
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

						{/* Terminal Status */}
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
					</div>
				</header>
			</SidebarInset>
		</SidebarProvider>
	);
}
