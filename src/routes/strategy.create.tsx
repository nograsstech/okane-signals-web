import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
} from "@/components/ui/field";
import { ChevronLeft, Plus } from "lucide-react";
import {
	createStrategySchema,
	type CreateStrategyFormInput,
} from "@/lib/schemas/strategy-schema";
import { ZodError } from "zod";

// Available strategies list
const AVAILABLE_STRATEGIES = [
	{ value: "ema_bollinger", label: "EMA Bollinger" },
	{ value: "super_safe_strategy", label: "Super Safe Strategy" },
	// Add more strategies as needed
];

export const Route = createFileRoute("/strategy/create")({
	component: CreateStrategyPage,
});

function CreateStrategyPage() {
	return (
		<Layout>
			<ProtectedRoute>
				<CreateStrategyContent />
			</ProtectedRoute>
		</Layout>
	);
}

function CreateStrategyContent() {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [formData, setFormData] = useState<CreateStrategyFormInput>({
		ticker: "",
		period: "60d",
		interval: "15m",
		strategy: "ema_bollinger",
		strategy_id: "",
	});

	const handleInputChange = (
		field: keyof CreateStrategyFormInput,
		value: string,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSubmitting(true);
		setServerError(null);
		setErrors({});

		// Validate with Zod
		try {
			createStrategySchema.parse(formData);
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors: Record<string, string> = {};
				error.errors.forEach((issue) => {
					if (issue.path[0]) {
						formattedErrors[issue.path[0].toString()] = issue.message;
					}
				});
				setErrors(formattedErrors);
				setIsSubmitting(false);
				return;
			}
		}

		try {
			const response = await fetch("/api/strategy/backtest", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create strategy");
			}

			// Navigate to the strategy list page after success
			navigate({ to: "/strategy" });
		} catch (error) {
			setServerError(
				error instanceof Error ? error.message : "An error occurred",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen p-6 max-w-2xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<Link to="/strategy">
					<Button variant="ghost" size="sm" className="gap-2 mb-4">
						<ChevronLeft className="h-4 w-4" />
						<span>Back to Strategies</span>
					</Button>
				</Link>
				<h1 className="text-3xl font-bold tracking-tight">
					Create New Strategy
				</h1>
				<p className="text-muted-foreground mt-2">
					Configure and run a new backtest strategy
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{serverError && (
					<div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
						{serverError}
					</div>
				)}

				<FieldGroup>
					{/* Ticker */}
					<Field>
						<Label htmlFor="ticker">Ticker Symbol</Label>
						<FieldContent>
							<Input
								id="ticker"
								placeholder="e.g., AAPL, EURJPY=X"
								value={formData.ticker}
								onChange={(e) =>
									handleInputChange("ticker", e.target.value)
								}
								aria-invalid={!!errors.ticker}
								disabled={isSubmitting}
							/>
							<FieldDescription>
								Enter the stock ticker or forex pair (e.g., AAPL,
								EURJPY=X)
							</FieldDescription>
							{errors.ticker && (
								<FieldError
									errors={[{ message: errors.ticker }]}
								/>
							)}
						</FieldContent>
					</Field>

					{/* Period */}
					<Field>
						<Label htmlFor="period">Period</Label>
						<FieldContent>
							<Input
								id="period"
								placeholder="e.g., 60d, 1w, 3m"
								value={formData.period}
								onChange={(e) =>
									handleInputChange("period", e.target.value)
								}
								aria-invalid={!!errors.period}
								disabled={isSubmitting}
							/>
							<FieldDescription>
								Time period for backtest (e.g., 60d, 1w, 3m, 1y)
							</FieldDescription>
							{errors.period && (
								<FieldError
									errors={[{ message: errors.period }]}
								/>
							)}
						</FieldContent>
					</Field>

					{/* Interval */}
					<Field>
						<Label htmlFor="interval">Interval</Label>
						<FieldContent>
							<Input
								id="interval"
								placeholder="e.g., 15m, 1h, 1d"
								value={formData.interval}
								onChange={(e) =>
									handleInputChange("interval", e.target.value)
								}
								aria-invalid={!!errors.interval}
								disabled={isSubmitting}
							/>
							<FieldDescription>
								Candlestick interval (e.g., 15m, 1h, 1d)
							</FieldDescription>
							{errors.interval && (
								<FieldError
									errors={[{ message: errors.interval }]}
								/>
							)}
						</FieldContent>
					</Field>

					{/* Strategy */}
					<Field>
						<Label htmlFor="strategy">Strategy</Label>
						<FieldContent>
							<Select
								value={formData.strategy}
								onValueChange={(value) =>
									handleInputChange("strategy", value)
								}
								disabled={isSubmitting}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a strategy" />
								</SelectTrigger>
								<SelectContent>
									{AVAILABLE_STRATEGIES.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Choose the trading strategy to backtest
							</FieldDescription>
							{errors.strategy && (
								<FieldError
									errors={[{ message: errors.strategy }]}
								/>
							)}
						</FieldContent>
					</Field>

					{/* Strategy ID (Optional) */}
					<Field>
						<Label htmlFor="strategy_id">
							Strategy ID (Optional)
						</Label>
						<FieldContent>
							<Input
								id="strategy_id"
								type="text"
								placeholder="e.g., 15"
								value={formData.strategy_id}
								onChange={(e) =>
									handleInputChange("strategy_id", e.target.value)
								}
								aria-invalid={!!errors.strategy_id}
								disabled={isSubmitting}
							/>
							<FieldDescription>
								Optional strategy ID for referencing existing
								strategies
							</FieldDescription>
							{errors.strategy_id && (
								<FieldError
									errors={[{ message: errors.strategy_id }]}
								/>
							)}
						</FieldContent>
					</Field>
				</FieldGroup>

				{/* Submit Button */}
				<div className="flex gap-3">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="flex-1"
					>
						<Plus className="w-4 h-4 mr-2" />
						{isSubmitting
							? "Creating Strategy..."
							: "Create Strategy"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/strategy" })}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
