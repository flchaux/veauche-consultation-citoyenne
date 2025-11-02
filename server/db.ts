import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, questions, responses, answers, InsertQuestion, InsertResponse, InsertAnswer } from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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
