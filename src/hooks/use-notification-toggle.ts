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
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["strategies"] });

			// Snapshot previous value
			const previousStrategies = queryClient.getQueryData<
				KeyStrategyBacktestStats[]
			>(["strategies"]);

			// Optimistically update
			queryClient.setQueryData(
				["strategies"],
				(old: KeyStrategyBacktestStats[] | undefined) => {
					if (!old) return old;
					return old.map((strategy) =>
						strategy.id === variables.id
							? { ...strategy, notificationsOn: variables.notificationsOn }
							: strategy,
					);
				},
			);

			// Return context with previous value
			return { previousStrategies };
		},
		onError: (error, variables, context) => {
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
			queryClient.setQueryData(
				["strategies"],
				(old: KeyStrategyBacktestStats[] | undefined) => {
					if (!old) return old;
					return old.map((strategy) =>
						strategy.id === data.id ? { ...strategy, ...data } : strategy,
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
