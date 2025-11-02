import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
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

  // Questions management (admin only)
  questions: router({
    list: publicProcedure.query(async () => {
      return await db.getAllQuestions();
    }),
    
    create: protectedProcedure
      .input(z.object({
        questionText: z.string(),
        questionType: z.enum(["text", "textarea", "radio", "checkbox", "select"]),
        options: z.string().optional(),
        isRequired: z.number(),
        orderIndex: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.createQuestion(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        questionText: z.string().optional(),
        questionType: z.enum(["text", "textarea", "radio", "checkbox", "select"]).optional(),
        options: z.string().optional(),
        isRequired: z.number().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateQuestion(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
    
    reorder: protectedProcedure
      .input(z.object({
        questions: z.array(z.object({
          id: z.number(),
          orderIndex: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        // Mettre à jour l'ordre de chaque question
        for (const question of input.questions) {
          await db.updateQuestion(question.id, { orderIndex: question.orderIndex });
        }
        return { success: true };
      }),
  }),

  // Responses management
  responses: router({
    getOrCreate: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        let response = await db.getResponseBySessionId(input.sessionId);
        if (!response) {
          response = await db.createResponse(input.sessionId);
        }
        return response;
      }),
    
    list: protectedProcedure.query(async () => {
      return await db.getAllResponses();
    }),
    
    complete: publicProcedure
      .input(z.object({ responseId: z.number() }))
      .mutation(async ({ input }) => {
        await db.completeResponse(input.responseId);
        return { success: true };
      }),
  }),

  // Answers management
  answers: router({
    save: publicProcedure
      .input(z.object({
        responseId: z.number(),
        questionId: z.number(),
        answerText: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.saveAnswer(input);
        return { success: true };
      }),
    
    getByResponse: publicProcedure
      .input(z.object({ responseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAnswersByResponseId(input.responseId);
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getAllAnswers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
