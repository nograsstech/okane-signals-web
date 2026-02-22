import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { AuthInput } from "./Input";
import { AuthButton } from "./Button";
import { SocialButton } from "./SocialButton";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthFormProps {
	mode: AuthMode;
	onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
	const currentMode = mode;
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		name: "",
	});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email format";
		}

		if (currentMode !== "forgot") {
			if (!formData.password) {
				newErrors.password = "Password is required";
			} else if (formData.password.length < 8) {
				newErrors.password = "Password must be at least 8 characters";
			}
		}

		if (currentMode === "signup" && !formData.name) {
			newErrors.name = "Name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);
		setErrors({});

		try {
			if (currentMode === "signin") {
				await authClient.signIn.email({
					email: formData.email,
					password: formData.password,
				});
			} else if (currentMode === "signup") {
				await authClient.signUp.email({
					email: formData.email,
					password: formData.password,
					name: formData.name,
				});
			} else if (currentMode === "forgot") {
				// TODO: Implement forgot password
				throw new Error("Forgot password not yet implemented");
			}

			onSuccess?.();
			navigate({ to: "/" });
		} catch (error) {
			setErrors({
				form: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSocialSignIn = async (provider: "google" | "github") => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({
				provider,
				callbackURL: "/",
			});
		} catch (error) {
			setErrors({
				form: error instanceof Error ? error.message : "An error occurred",
			});
			setIsLoading(false);
		}
	};

	const titles = {
		signin: "Access Terminal",
		signup: "Register Terminal",
		forgot: "Recover Access",
	};

	const subtitles = {
		signin: "Enter your credentials to access the trading terminal",
		signup: "Create a new terminal access account",
		forgot: "Enter your email to receive recovery instructions",
	};

	return (
		<div className="w-full max-w-md mx-auto">
			{/* Terminal Header */}
			<div className="mb-8 text-center">
				<div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-border/30 rounded-full">
					<span className="w-2 h-2 rounded-full bg-foreground/40 animate-pulse" />
					<span className="text-xs font-mono uppercase tracking-widest text-foreground/60">
						Okane Signals Terminal
					</span>
				</div>
				<h1 className="text-2xl font-bold tracking-tight mb-2">
					{titles[currentMode]}
				</h1>
				<p className="text-sm text-foreground/60 font-mono">
					{subtitles[currentMode]}
				</p>
			</div>

			{/* Form Container */}
			<div className="relative">
				{/* Terminal Corner Decorations */}
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-foreground/20" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-foreground/20" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />

				<form
					onSubmit={handleSubmit}
					className="space-y-5 p-6 bg-background/30 border border-border/30"
				>
					{errors.form && (
						<div className="p-3 text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded">
							{errors.form}
						</div>
					)}

					{currentMode === "signup" && (
						<AuthInput
							label="Full Name"
							type="text"
							placeholder="ENTER YOUR NAME"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							error={errors.name}
							disabled={isLoading}
						/>
					)}

					<AuthInput
						label="Email Address"
						type="email"
						placeholder="ENTER YOUR EMAIL"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						error={errors.email}
						disabled={isLoading}
						autoComplete={currentMode === "signup" ? "email" : "username"}
					/>

					{currentMode !== "forgot" && (
						<div className="space-y-1">
							<div className="flex items-center justify-between">
								<label className="text-xs uppercase tracking-widest text-foreground/60 font-mono">
									Password
								</label>
								{currentMode === "signin" && (
									<button
										type="button"
										onClick={() => {
											/* TODO: forgot password */
										}}
										className="text-xs font-mono text-foreground/40 hover:text-foreground/60 transition-colors"
									>
										Forgot?
									</button>
								)}
							</div>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="ENTER YOUR PASSWORD"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									disabled={isLoading}
									className={cn(
										"w-full bg-background/50 border border-border/50",
										"font-mono text-sm px-4 py-3 pr-10",
										"focus:outline-none focus:border-accent-foreground focus:bg-background/80",
										"transition-all duration-200",
										"placeholder:text-foreground/30",
										errors.password && "border-destructive/50",
									)}
									autoComplete={
										currentMode === "signup"
											? "new-password"
											: "current-password"
									}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
							{errors.password && (
								<span className="text-xs text-destructive font-mono">
									{errors.password}
								</span>
							)}
						</div>
					)}

					<AuthButton type="submit" loading={isLoading} className="w-full">
						{currentMode === "signin" && "Access Terminal"}
						{currentMode === "signup" && "Create Account"}
						{currentMode === "forgot" && "Send Recovery"}
					</AuthButton>
				</form>
			</div>

			{/* Social Login */}
			{currentMode !== "forgot" && (
				<>
					<div className="flex items-center gap-4 my-6">
						<div className="flex-1 h-px bg-border/30" />
						<span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">
							Or continue with
						</span>
						<div className="flex-1 h-px bg-border/30" />
					</div>

					<div className="space-y-3">
						<SocialButton
							provider="google"
							loading={isLoading}
							onClick={() => handleSocialSignIn("google")}
						>
							Google
						</SocialButton>
					</div>
				</>
			)}

			{/* Mode Switch */}
			<div className="mt-6 text-center">
				{currentMode === "signin" && (
					<p className="text-sm text-foreground/60">
						Don't have terminal access?{" "}
						<button
							type="button"
							onClick={() => navigate({ to: "/auth/register" })}
							className="font-mono text-xs uppercase tracking-wider text-foreground hover:underline"
						>
							Register
						</button>
					</p>
				)}
				{currentMode === "signup" && (
					<p className="text-sm text-foreground/60">
						Already have access?{" "}
						<button
							type="button"
							onClick={() => navigate({ to: "/auth/login" })}
							className="font-mono text-xs uppercase tracking-wider text-foreground hover:underline"
						>
							Sign In
						</button>
					</p>
				)}
				{currentMode === "forgot" && (
					<p className="text-sm text-foreground/60">
						Remember your password?{" "}
						<button
							type="button"
							onClick={() => navigate({ to: "/auth/login" })}
							className="font-mono text-xs uppercase tracking-wider text-foreground hover:underline"
						>
							Back to Sign In
						</button>
					</p>
				)}
			</div>

			{/* Terminal Status Bar */}
			<div className="mt-8 flex items-center justify-between text-xs font-mono text-foreground/30">
				<span>STATUS: {isLoading ? "CONNECTING..." : "READY"}</span>
				<span>v1.0.0</span>
			</div>
		</div>
	);
}

function cn(...classes: (string | boolean | undefined | null)[]) {
	return classes.filter(Boolean).join(" ");
}
