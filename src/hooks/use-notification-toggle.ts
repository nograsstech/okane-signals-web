// Tanstack Query mutation hook for toggling notifications
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleNotification } from "@/api/strategy-api";
import type { KeyStrategyBacktestStats } from "@/lib/types/strategy";

export function useNotificationToggle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			notificationsOn,
		}: {
			id: string;
			notificationsOn: boolean;
		}) => {
			return toggleNotification({ id, notificationsOn });
		},
		onMutate: (variables) => {
			// Snapshot previous value for rollback
			const previousStrategies = queryClient.getQueryData<
				KeyStrategyBacktestStats[]
			>(["strategies"]);

			// Optimistically update immediately (synchronous)
			queryClient.setQueryData(
				["strategies"],
				(old: KeyStrategyBacktestStats[] | undefined) => {
					if (!old) return old;
					return old.map((strategy) =>
						String(strategy.id) === String(variables.id)
							? { ...strategy, notificationsOn: variables.notificationsOn }
							: strategy,
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
			toast.error("Failed to update notification", {
				description: error.message,
			});
		},
		onSuccess: (data, variables) => {
			// Update cache with server response to confirm the update
			// (no refetch/flash - directly update the cached item)
			queryClient.setQueryData(
				["strategies"],
				(old: KeyStrategyBacktestStats[] | undefined) => {
					if (!old) return old;
					return old.map((strategy) =>
						String(strategy.id) === String(data.id)
							? { ...strategy, ...data }
							: strategy,
					);
				},
			);

			// Show success toast
			toast.success(
				`Notifications ${variables.notificationsOn ? "enabled" : "disabled"}`,
				{
					description: `Strategy ${data.strategy} will ${variables.notificationsOn ? "send" : "not send"} notifications`,
				},
			);
		},
	});
}
