import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Questions table
export const questions = pgTable("questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionText: text("questionText").notNull(),
  questionType: varchar("questionType", { length: 50 }).notNull(), // 'text', 'textarea', 'radio', 'checkbox', 'select'
  options: text("options"), // JSON string for radio/checkbox/select options
  isRequired: integer("isRequired").default(1).notNull(), // 1 = required, 0 = optional
  orderIndex: integer("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// Responses table (one response = one form submission)
export const responses = pgTable("responses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(), // Unique identifier for each form submission
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Response = typeof responses.$inferSelect;
export type InsertResponse = typeof responses.$inferInsert;

// Answers table (one answer per question per response)
export const answers = pgTable("answers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  responseId: integer("responseId").notNull().references(() => responses.id, { onDelete: 'cascade' }),
  questionId: integer("questionId").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  answerText: text("answerText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = typeof answers.$inferInsert;

// Page views table (track site visits without cookies)
export const pageViews = pgTable("pageViews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;
