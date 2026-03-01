import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Home, Plus, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
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
import BetterAuthHeader from "@/integrations/better-auth/header-user";

interface LayoutProps {
  children: ReactNode;
}

const STORAGE_KEY = "okane-sidebar-state";

export default function Layout({ children }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Initialize state from localStorage after mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    }
  }, [isOpen, isMounted]);

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard", subtitle: "WIP" },
    { to: "/strategy", icon: BarChart3, label: "Strategies", exact: true },
    { to: "/strategy/create", icon: Plus, label: "Create Strategy" },
  ];

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
      <Sidebar collapsible="icon" className="border-border/50 border-r">
        <SidebarHeader className="border-border/50 bg-background border-b">
          <div className="flex items-start justify-start gap-3 px-0 py-3 data-[collapsed=true]:justify-center">
            <div className="relative shrink-0">
              <div className="bg-primary/20 absolute inset-0 blur-lg" />
              <div className="from-primary to-primary/60 text-primary-foreground relative flex h-8 w-8 items-center justify-center bg-gradient-to-br">
                <TrendingUp size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsed=true]:hidden">
              <span className="text-foreground/90 text-xs font-bold tracking-widest">
                OKANE
              </span>
              <span className="text-foreground/50 font-mono text-[10px] tracking-wider uppercase text-nowrap">
                Terminal v1.0
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-background/50 backdrop-blur-sm">
          <SidebarGroup className="px-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map(({ to, icon: Icon, label, subtitle, exact }) => {
                  const isActive = exact
                    ? currentPath === to
                    : currentPath === to || currentPath.startsWith(to + "/");
                  return (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton
                        asChild
                        className={`group relative overflow-hidden transition-all duration-200 	 ${
                          isActive
                            ? "bg-muted text-foreground	 shadow-sm"
                            : "hover:bg-primary/30 hover:text-primary-foreground"
                        } `}
                        tooltip={label}
                      >
                        <Link to={to} className="w-full">
                          {isActive && (
                            <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 bg-white/30" />
                          )}
                          <Icon
                            size={16}
                            className={` ${
                              isActive
                                ? "text-primary"
                                : "text-foreground/70 group-hover:text-foreground group-data-[active=true]:text-accent-foreground"
                            } `}
                            strokeWidth={2.5}
                          />
                          <div className="flex flex-col items-start">
                            <span
                              className={`font-mono text-xs font-semibold tracking-wider uppercase ${isActive ? "text-primary" : "text-foreground/80 group-hover:text-foreground"} `}
                            >
                              {label}
                            </span>
                            {subtitle && (
                              <span className="font-mono text-[9px] tracking-wider uppercase opacity-60">
                                {subtitle}
                              </span>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-border/50 border-t">
          <BetterAuthHeader />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top Bar */}
        <header className="border-border/50 bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />

              <Link to="/dashboard" className="group flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="bg-primary/10 group-hover:bg-primary/20 absolute inset-0 blur-md transition-colors" />
                  <div className="from-foreground to-foreground/70 text-background relative flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br">
                    <TrendingUp size={18} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground/90 text-sm font-bold tracking-tight">
                    OKANE SIGNALS
                  </span>
                  <span className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                    Financial Terminal
                  </span>
                </div>
              </Link>
            </div>

            {/* Terminal Status & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-4 sm:flex">
                <div className="bg-muted/40 flex items-center gap-2 rounded px-2 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-foreground/60 font-mono text-[10px] font-semibold tracking-wider uppercase">
                    Market Open
                  </span>
                </div>
                <div className="text-foreground/30 font-mono text-[10px] tabular-nums">
                  {new Date().toLocaleTimeString("en-US", { hour12: false })}
                </div>
              </div>
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
