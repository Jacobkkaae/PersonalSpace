import { and, asc, desc, eq } from 'drizzle-orm';

import type {
  CreateRecipeInput,
  UpdateRecipeInput,
} from '@personal-space/shared';

import { database } from '../database/client.js';
import {
  recipeIngredients,
  recipeInstructions,
  recipes,
} from '../database/schema.js';

export async function listRecipes(userId: string) {
  return database
    .select()
    .from(recipes)
    .where(eq(recipes.userId, userId))
    .orderBy(desc(recipes.updatedAt));
}

export async function getRecipe(userId: string, recipeId: string) {
  const [recipe] = await database
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
    .limit(1);

  if (!recipe) {
    return null;
  }

  const ingredients = await database
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId))
    .orderBy(asc(recipeIngredients.position));

  const instructions = await database
    .select()
    .from(recipeInstructions)
    .where(eq(recipeInstructions.recipeId, recipeId))
    .orderBy(asc(recipeInstructions.position));

  return {
    ...recipe,
    ingredients,
    instructions,
  };
}

export async function createRecipe(
  userId: string,
  input: CreateRecipeInput,
) {
  return database.transaction(async (transaction) => {
    const [recipe] = await transaction
      .insert(recipes)
      .values({
        userId,
        title: input.title,
        description: input.description,
        notes: input.notes,
        preparationTimeMinutes: input.preparationTimeMinutes,
        cookingTimeMinutes: input.cookingTimeMinutes,
        servings: input.servings,
        category: input.category,
        isFavorite: input.isFavorite ?? false,
      })
      .returning();

    await transaction.insert(recipeIngredients).values(
      input.ingredients.map((ingredient, position) => ({
        recipeId: recipe.id,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        name: ingredient.name,
        position,
      })),
    );

    await transaction.insert(recipeInstructions).values(
      input.instructions.map((instruction, position) => ({
        recipeId: recipe.id,
        text: instruction.text,
        position,
      })),
    );

    return recipe.id;
  }).then((recipeId) => getRecipe(userId, recipeId));
}

export async function updateRecipe(
  userId: string,
  recipeId: string,
  input: UpdateRecipeInput,
) {
  const updatedRecipeId = await database.transaction(async (transaction) => {
    const [recipe] = await transaction
      .update(recipes)
      .set({
        title: input.title,
        description: input.description,
        notes: input.notes,
        preparationTimeMinutes: input.preparationTimeMinutes,
        cookingTimeMinutes: input.cookingTimeMinutes,
        servings: input.servings,
        category: input.category,
        isFavorite: input.isFavorite ?? false,
        updatedAt: new Date(),
      })
      .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
      .returning();

    if (!recipe) {
      return null;
    }

    await transaction
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId));

    await transaction
      .delete(recipeInstructions)
      .where(eq(recipeInstructions.recipeId, recipeId));

    await transaction.insert(recipeIngredients).values(
      input.ingredients.map((ingredient, position) => ({
        recipeId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        name: ingredient.name,
        position,
      })),
    );

    await transaction.insert(recipeInstructions).values(
      input.instructions.map((instruction, position) => ({
        recipeId,
        text: instruction.text,
        position,
      })),
    );

    return recipe.id;
  });

  return updatedRecipeId === null
    ? null
    : getRecipe(userId, updatedRecipeId);
}

export async function deleteRecipe(
  userId: string,
  recipeId: string,
): Promise<boolean> {
  const deleted = await database
    .delete(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
    .returning({ id: recipes.id });

  return deleted.length > 0;
}