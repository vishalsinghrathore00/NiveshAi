import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).unique(),
  riskTolerance: text("risk_tolerance").default("moderate"),
  investmentGoals: text("investment_goals").array(),
  preferredSectors: text("preferred_sectors").array(),
  monthlyInvestment: text("monthly_investment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  name: text("name"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type UserPreferences = typeof userPreferences.$inferSelect
export type WatchlistItem = typeof watchlist.$inferSelect
