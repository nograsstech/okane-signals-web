import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth";

export const Route = createFileRoute("/auth/login/")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
			{/* Animated Background Grid */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.03]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			{/* Ambient Gradient Orbs */}
			<div className="bg-foreground/5 pointer-events-none absolute top-1/4 -left-32 h-96 w-96 rounded-full blur-3xl" />
			<div className="bg-foreground/5 pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full blur-3xl" />

			{/* Scanline Effect */}
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-size-[100%_4px]" />

			<AuthForm mode="signin" />
		</div>
	);
}
