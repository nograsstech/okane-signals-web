import * as React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteToggle, useIsFavorite } from "@/hooks/use-favorites";
import type { FavoriteStrategyConfig } from "@/lib/types/favorite";

interface FavoriteToggleProps {
	config: FavoriteStrategyConfig;
	className?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
	disabled?: boolean;
	onClick?: (event: React.MouseEvent) => void;
	/**
	 * Accessible label for screen readers
	 * @default "Favorite this strategy"
	 */
	ariaLabel?: string;
}

const FavoriteToggle = React.forwardRef<HTMLButtonElement, FavoriteToggleProps>(
	({
		config,
		className,
		variant = "outline",
		size = "default",
		disabled = false,
		onClick,
		ariaLabel = "Favorite this strategy"
	}, ref) => {
		const { isFavorite } = useIsFavorite(config);
		const mutate = useFavoriteToggle();

		const handleClick = React.useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();
				onClick?.(event);

				if (!disabled && !mutate.isPending) {
					mutate.mutate({
						...config,
						isCurrentlyFavorite: isFavorite ?? false
					});
				}
			},
			[config, isFavorite, disabled, mutate, onClick]
		);

		const buttonClasses = `${className} ${
			isFavorite
				? "text-red-500 hover:text-red-600"
				: "text-muted-foreground hover:text-accent-foreground"
		}`;

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				disabled={disabled || mutate.isPending}
				onClick={handleClick}
				aria-label={ariaLabel}
				aria-pressed={isFavorite ?? false}
				className={buttonClasses}
				data-favorite={isFavorite ? "true" : "false"}
			>
				<Heart
					className={isFavorite ? "fill-current" : ""}
					style={{
						color: isFavorite ? "#ef4444" : undefined
					}}
				/>
				<span className="sr-only">
					{isFavorite ? "Remove from favorites" : "Add to favorites"}
				</span>
			</Button>
		);
	}
);

FavoriteToggle.displayName = "FavoriteToggle";

export { FavoriteToggle };