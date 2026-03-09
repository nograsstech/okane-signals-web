import { Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteStrategy } from "@/hooks/use-delete-strategy";
import { cn } from "@/lib/utils";

interface StrategyDeleteButtonProps {
	id: string;
	strategy: string;
	ticker: string;
	variant?: "icon" | "text" | "subtle";
	size?: "sm" | "xs";
	className?: string;
}

export function StrategyDeleteButton({
	id,
	strategy,
	ticker,
	variant = "text",
	size = "sm",
	className = "",
}: StrategyDeleteButtonProps) {
	const deleteStrategy = useDeleteStrategy();

	const trigger =
		variant === "icon" ? (
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground/50 hover:text-destructive"
				disabled={deleteStrategy.isPending}
				onClick={(e) => e.stopPropagation()}
			>
				<Trash2 className="h-3 w-3" />
			</Button>
		) : variant === "subtle" ? (
			<Button
				variant="link"
				size="sm"
				className={cn(
					"text-muted-foreground/70 hover:text-destructive transition-colors",
					"h-auto p-0",
					className,
				)}
				disabled={deleteStrategy.isPending}
				onClick={(e) => e.stopPropagation()}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		) : (
			<Button
				variant="outline"
				size={size}
				className={cn(
					"text-muted-foreground/70 border-transparent",
					"hover:text-destructive",
					"transition-all duration-200",
					className,
				)}
				disabled={deleteStrategy.isPending}
				onClick={(e) => e.stopPropagation()}
			>
				<Trash2 className="h-3.5 w-3.5" />
				<span className="ml-1.5 hidden group-hover:inline">Delete</span>
			</Button>
		);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia>
						<Trash2 className="h-6 w-6 text-destructive" />
					</AlertDialogMedia>
					<AlertDialogTitle>Delete Strategy?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete <strong>{strategy}</strong> for{" "}
						<strong>{ticker}</strong>. This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => deleteStrategy.mutate(id)}
						disabled={deleteStrategy.isPending}
					>
						{deleteStrategy.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
