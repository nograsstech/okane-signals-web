import { relations } from "drizzle-orm/relations";
import { user, userFavoriteStrategies, backtestStats, tradeActions, userOldBackup, sessionOldBackup, account, session, accountOldBackup } from "./schema";

export const userFavoriteStrategiesRelations = relations(userFavoriteStrategies, ({one}) => ({
	user: one(user, {
		fields: [userFavoriteStrategies.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	userFavoriteStrategies: many(userFavoriteStrategies),
	accounts: many(account),
	sessions: many(session),
}));

export const tradeActionsRelations = relations(tradeActions, ({one}) => ({
	backtestStat_backtestId: one(backtestStats, {
		fields: [tradeActions.backtestId],
		references: [backtestStats.id],
		relationName: "tradeActions_backtestId_backtestStats_id"
	}),
	backtestStat_backtestId: one(backtestStats, {
		fields: [tradeActions.backtestId],
		references: [backtestStats.id],
		relationName: "tradeActions_backtestId_backtestStats_id"
	}),
}));

export const backtestStatsRelations = relations(backtestStats, ({many}) => ({
	tradeActions_backtestId: many(tradeActions, {
		relationName: "tradeActions_backtestId_backtestStats_id"
	}),
	tradeActions_backtestId: many(tradeActions, {
		relationName: "tradeActions_backtestId_backtestStats_id"
	}),
}));

export const sessionOldBackupRelations = relations(sessionOldBackup, ({one}) => ({
	userOldBackup: one(userOldBackup, {
		fields: [sessionOldBackup.userId],
		references: [userOldBackup.id]
	}),
}));

export const userOldBackupRelations = relations(userOldBackup, ({many}) => ({
	sessionOldBackups: many(sessionOldBackup),
	accountOldBackups: many(accountOldBackup),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountOldBackupRelations = relations(accountOldBackup, ({one}) => ({
	userOldBackup: one(userOldBackup, {
		fields: [accountOldBackup.userId],
		references: [userOldBackup.id]
	}),
}));