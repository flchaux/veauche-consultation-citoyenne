import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  forms: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllForms(ctx.user.id);
    }),
    getById: publicProcedure
      .input(z.object({ formId: z.number() }))
      .query(async ({ input }) => {
        return db.getFormById(input.formId);
      }),
    create: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const formId = await db.createForm({
          title: input.title,
          description: input.description,
          userId: ctx.user.id,
        });
        return { formId };
      }),
    update: protectedProcedure
      .input(z.object({ formId: z.number(), title: z.string().optional(), description: z.string().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input }) => {
        await db.updateForm(input.formId, {
          title: input.title,
          description: input.description,
          isActive: input.isActive,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ formId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteForm(input.formId);
        return { success: true };
      }),
  }),

  questions: router({
    listByForm: publicProcedure
      .input(z.object({ formId: z.number() }))
      .query(async ({ input }) => {
        return db.getQuestionsByFormId(input.formId);
      }),
    create: protectedProcedure
      .input(z.object({
        formId: z.number(),
        questionText: z.string(),
        questionType: z.enum(["text", "textarea", "radio", "checkbox", "select"]),
        options: z.string().optional(),
        isRequired: z.number().optional(),
        orderIndex: z.number(),
      }))
      .mutation(async ({ input }) => {
        const questionId = await db.createQuestion(input);
        return { questionId };
      }),
    update: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        questionText: z.string().optional(),
        questionType: z.enum(["text", "textarea", "radio", "checkbox", "select"]).optional(),
        options: z.string().optional(),
        isRequired: z.number().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { questionId, ...updates } = input;
        await db.updateQuestion(questionId, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ questionId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.questionId);
        return { success: true };
      }),
  }),

  responses: router({
    listByForm: protectedProcedure
      .input(z.object({ formId: z.number() }))
      .query(async ({ input }) => {
        return db.getResponsesByFormId(input.formId);
      }),
    getBySessionId: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return db.getResponseBySessionId(input.sessionId);
      }),
    create: publicProcedure
      .input(z.object({ formId: z.number(), sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const responseId = await db.createResponse(input);
        return { responseId };
      }),
    updateCompletion: publicProcedure
      .input(z.object({ responseId: z.number(), isCompleted: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateResponse(input.responseId, { isCompleted: input.isCompleted });
        return { success: true };
      }),
  }),

  answers: router({
    listByResponse: protectedProcedure
      .input(z.object({ responseId: z.number() }))
      .query(async ({ input }) => {
        return db.getAnswersByResponseId(input.responseId);
      }),
    save: publicProcedure
      .input(z.object({
        responseId: z.number(),
        questionId: z.number(),
        answerText: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Check if answer already exists
        const existing = await db.getAnswerByResponseAndQuestion(input.responseId, input.questionId);
        if (existing) {
          // Update existing answer
          await db.updateAnswer(existing.id, { answerText: input.answerText });
          return { answerId: existing.id };
        } else {
          // Create new answer
          const answerId = await db.createAnswer(input);
          return { answerId };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
