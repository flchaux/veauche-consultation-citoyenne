import { eq, and, desc, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { questions, responses, answers, pageViews, InsertQuestion, InsertResponse, InsertAnswer } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Questions
export async function getAllQuestions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions).orderBy(questions.orderIndex);
}

export async function createQuestion(question: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questions).values(question).returning();
  return result[0];
}

export async function updateQuestion(id: number, data: Partial<InsertQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
  return result[0];
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(questions).where(eq(questions.id, id));
}

export async function reorderQuestions(questionIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (let i = 0; i < questionIds.length; i++) {
    await db.update(questions).set({ orderIndex: i }).where(eq(questions.id, questionIds[i]));
  }
}

// Responses
export async function createResponse(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(responses).values({ sessionId }).returning();
  return result[0];
}

export async function getResponseBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(responses).where(eq(responses.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function completeResponse(responseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(responses).set({ completedAt: new Date() }).where(eq(responses.id, responseId));
}

export async function getAllResponses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(responses).orderBy(desc(responses.createdAt));
}

// Answers
export async function saveAnswer(answer: InsertAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if answer already exists
  const existing = await db.select().from(answers)
    .where(and(
      eq(answers.responseId, answer.responseId),
      eq(answers.questionId, answer.questionId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing answer
    const result = await db.update(answers)
      .set({ answerText: answer.answerText })
      .where(eq(answers.id, existing[0].id))
      .returning();
    return result[0];
  } else {
    // Create new answer
    const result = await db.insert(answers).values(answer).returning();
    return result[0];
  }
}

export async function getAnswersByResponseId(responseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(answers).where(eq(answers.responseId, responseId));
}

export async function getAnswerByResponseAndQuestion(responseId: number, questionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(answers)
    .where(and(
      eq(answers.responseId, responseId),
      eq(answers.questionId, questionId)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAnswers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(answers);
}

// Page Views
export async function recordPageView() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pageViews).values({}).returning();
  return result[0];
}

export async function getTotalPageViews() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(pageViews);
  return result.length;
}

export async function getPageViewsByDay() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(pageViews);
  
  // Grouper par jour
  const byDay: Record<string, number> = {};
  result.forEach(view => {
    const date = new Date(view.createdAt).toISOString().split('T')[0];
    byDay[date] = (byDay[date] || 0) + 1;
  });
  
  return Object.entries(byDay).map(([date, count]) => ({ date, count }));
}

export async function getResponsesByDay() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(responses).where(isNotNull(responses.completedAt));
  
  // Grouper par jour
  const byDay: Record<string, number> = {};
  result.forEach(response => {
    if (response.completedAt) {
      const date = new Date(response.completedAt).toISOString().split('T')[0];
      byDay[date] = (byDay[date] || 0) + 1;
    }
  });
  
  return Object.entries(byDay).map(([date, count]) => ({ date, count }));
}
