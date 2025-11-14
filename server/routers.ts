import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  // Questions management
  questions: router({
    list: publicProcedure.query(async () => {
      return await db.getAllQuestions();
    }),
    
    create: publicProcedure
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
    
    update: publicProcedure
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
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
    
    reorder: publicProcedure
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
    
    list: publicProcedure.query(async () => {
      return await db.getAllResponses();
    }),
    
    complete: publicProcedure
      .input(z.object({ responseId: z.number() }))
      .mutation(async ({ input }) => {
        await db.completeResponse(input.responseId);
        return { success: true };
      }),
  }),

  // Page views tracking
  pageViews: router({
    record: publicProcedure.mutation(async () => {
      await db.recordPageView();
      return { success: true };
    }),
    
    getTotal: publicProcedure.query(async () => {
      return await db.getTotalPageViews();
    }),
    
    getByDay: publicProcedure.query(async () => {
      return await db.getPageViewsByDay();
    }),
  }),
  
  // Analytics data
  analytics: router({
    getResponsesByDay: publicProcedure.query(async () => {
      return await db.getResponsesByDay();
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
    
    getAll: publicProcedure.query(async () => {
      return await db.getAllAnswers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
