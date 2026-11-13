import { z } from 'zod';

const optionalPositiveInteger = z
  .number()
  .int()
  .positive()
  .optional();

export const recipeIngredientInputSchema = z.object({
  quantity: z.string().trim().max(50).optional(),
  unit: z.string().trim().max(50).optional(),
  name: z.string().trim().min(1).max(200),
});

export const recipeInstructionInputSchema = z.object({
  text: z.string().trim().min(1).max(5000),
});

export const createRecipeInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  notes: z.string().trim().max(5000).optional(),
  preparationTimeMinutes: optionalPositiveInteger,
  cookingTimeMinutes: optionalPositiveInteger,
  servings: optionalPositiveInteger,
  category: z.string().trim().max(100).optional(),
  isFavorite: z.boolean().optional(),
  ingredients: z.array(recipeIngredientInputSchema).min(1),
  instructions: z.array(recipeInstructionInputSchema).min(1),
});

export const updateRecipeInputSchema = createRecipeInputSchema;

export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeInputSchema>;