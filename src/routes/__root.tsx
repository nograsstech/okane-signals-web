import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, TrendingUp } from "lucide-react";
import appCss from "../styles.css?url";
import { getThemeServerFn } from "@/server/theme";

interface MyRouterContext {
  queryClient: QueryClient;
}

// Helper to resolve the actual theme (handles "system" preference)
function resolveTheme(theme: string): string {
  if (theme === "system" || !theme) {
    if (typeof window === "undefined") return "";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function NotFound() {
	return (
		<div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center px-4">
			<div className="max-w-md w-full text-center">
				<div className="mb-8 flex justify-center">
					<div className="relative">
						<div className="h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center">
							<span className="text-6xl font-bold text-zinc-700">404</span>
						</div>
						<div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white text-black flex items-center justify-center rounded-full">
							<TrendingUp size={18} />
						</div>
					</div>
				</div>

				<h1 className="text-2xl font-semibold text-white mb-3">Signal Lost</h1>
				<p className="text-zinc-500 mb-8 leading-relaxed">
					The route you're looking for doesn't exist or has been moved to another sector.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<Link to="/" className="w-full sm:w-auto">
						<Button
							variant="default"
							className="w-full sm:w-auto rounded-none bg-white text-black hover:bg-zinc-200 uppercase tracking-widest text-xs font-bold px-6 h-12"
						>
							<Home size={16} className="mr-2" />
							Back to Home
						</Button>
					</Link>
					<button
						type="button"
						onClick={() => window.history.back()}
						className="w-full sm:w-auto"
					>
						<Button
							variant="outline"
							className="w-full sm:w-auto rounded-none border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 uppercase tracking-widest text-xs font-bold px-6 h-12"
						>
							<ArrowLeft size={16} className="mr-2" />
							Go Back
						</Button>
					</button>
				</div>
			</div>
		</div>
	);
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	// Load theme from cookie on server
  loader: async () => {
    return await getThemeServerFn()
  },
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Okane Signals",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        // Inline script to apply theme immediately before hydration
        children: `
            (function() {
              try {
                const getCookie = (name) => {
                  const value = '; ' + document.cookie;
                  const parts = value.split('; ' + name + '=');
                  if (parts.length === 2) return parts.pop().split(';').shift();
                };

                const theme = getCookie('theme') || 'system';
                const root = document.documentElement;
                
                root.classList.remove("light", "dark");
                
                if (theme === "system") {
                  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {}
            })();
          `,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // Get theme from loader data for server-side rendering
  const theme = Route.useLoaderData();
  const resolvedTheme = resolveTheme(theme);
  return (
    <html lang="en" className={resolvedTheme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* <ThemeProvider defaultTheme="system" storageKey="okane-ui-theme"> */}
        <ThemeProvider serverTheme={theme}>
          <TanStackQueryProvider>
            <TooltipProvider>
              {children}
              <TanStackDevtools
                config={{
                  position: "bottom-right",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  TanStackQueryDevtools,
                ]}
              />
            </TooltipProvider>
          </TanStackQueryProvider>
          <Scripts />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
