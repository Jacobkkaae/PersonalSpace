import { describe, expect, it } from 'vitest';

import { createRecipeInputSchema } from './schema.js';

describe('recipe input validation', () => {
  it('accepts a minimally complete recipe', () => {
    const result = createRecipeInputSchema.safeParse({
      title: 'Pancakes',
      ingredients: [{ name: 'Flour' }],
      instructions: [{ text: 'Mix the ingredients.' }],
    });

    expect(result.success).toBe(true);
  });

  it('rejects recipes without a title, ingredient, or instruction', () => {
    const result = createRecipeInputSchema.safeParse({
      title: '',
      ingredients: [],
      instructions: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects non-positive numeric values', () => {
    const result = createRecipeInputSchema.safeParse({
      title: 'Pancakes',
      servings: 0,
      ingredients: [{ name: 'Flour' }],
      instructions: [{ text: 'Mix the ingredients.' }],
    });

    expect(result.success).toBe(false);
  });
});
