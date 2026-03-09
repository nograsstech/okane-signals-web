// Tanstack Query mutation hook for deleting strategies
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { deleteStrategy } from "@/api/strategy-api";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

export function useDeleteStrategy() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (id: string) => {
			return deleteStrategy(id);
		},
		onMutate: (variables) => {
			// Snapshot previous value for rollback
			const previousStrategies = queryClient.getQueryData<
				KeyStrategyBacktestStats[]
			>(["strategies"]);

			// Optimistically update immediately (remove the deleted item)
			queryClient.setQueryData(
				["strategies"],
				(old: KeyStrategyBacktestStats[] | undefined) => {
					if (!old) return old;
					return old.filter(
						(strategy) => String(strategy.id) !== String(variables),
					);
				},
			);

			// Return context with previous value for error rollback
			return { previousStrategies };
		},
		onError: (error, _variables, context) => {
			// Revert to previous value on error
			if (context?.previousStrategies) {
				queryClient.setQueryData(["strategies"], context.previousStrategies);
			}

			// Show error toast
			toast.error("Failed to delete strategy", {
				description: error.message,
			});
		},
		onSuccess: (_data, _variables) => {
			// Show success toast
			toast.success("Strategy deleted", {
				description: "The strategy has been permanently removed.",
			});

			// Delay refetch to ensure backend has processed the deletion
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ["strategies"] });
			}, 500);

			// Navigate back to strategy list if on detail page
			const currentPath = window.location.pathname;
			if (
				currentPath.startsWith("/strategy/") &&
				currentPath !== "/strategy/"
			) {
				navigate({ to: "/strategy" });
			}
		},
	});
}
