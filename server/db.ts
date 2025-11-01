import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, forms, InsertForm, questions, InsertQuestion, responses, InsertResponse, answers, InsertAnswer } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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

// Forms queries
export async function getAllForms(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forms).where(eq(forms.userId, userId));
}

export async function getFormById(formId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createForm(form: InsertForm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(forms).values(form);
  return result[0].insertId;
}

export async function updateForm(formId: number, form: Partial<InsertForm>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(forms).set(form).where(eq(forms.id, formId));
}

export async function deleteForm(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(forms).where(eq(forms.id, formId));
}

// Questions queries
export async function getQuestionsByFormId(formId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.formId, formId)).orderBy(questions.orderIndex);
}

export async function createQuestion(question: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questions).values(question);
  return result[0].insertId;
}

export async function updateQuestion(questionId: number, question: Partial<InsertQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(questions).set(question).where(eq(questions.id, questionId));
}

export async function deleteQuestion(questionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(questions).where(eq(questions.id, questionId));
}

// Responses queries
export async function getResponsesByFormId(formId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(responses).where(eq(responses.formId, formId));
}

export async function getResponseBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(responses).where(eq(responses.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createResponse(response: InsertResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(responses).values(response);
  return result[0].insertId;
}

export async function updateResponse(responseId: number, response: Partial<InsertResponse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(responses).set(response).where(eq(responses.id, responseId));
}

// Answers queries
export async function getAnswersByResponseId(responseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(answers).where(eq(answers.responseId, responseId));
}

export async function createAnswer(answer: InsertAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(answers).values(answer);
  return result[0].insertId;
}

export async function updateAnswer(answerId: number, answer: Partial<InsertAnswer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(answers).set(answer).where(eq(answers.id, answerId));
}

export async function getAnswerByResponseAndQuestion(responseId: number, questionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(answers)
    .where(and(eq(answers.responseId, responseId), eq(answers.questionId, questionId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}
