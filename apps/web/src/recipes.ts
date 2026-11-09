const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type RecipeIngredient = {
  id: string;
  quantity: string | null;
  unit: string | null;
  name: string;
  position: number;
};

export type RecipeInstruction = {
  id: string;
  text: string;
  position: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  preparationTimeMinutes: number | null;
  cookingTimeMinutes: number | null;
  servings: number | null;
  category: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients?: RecipeIngredient[];
  instructions?: RecipeInstruction[];
};

export type RecipeInput = {
  title: string;
  description?: string;
  notes?: string;
  preparationTimeMinutes?: number;
  cookingTimeMinutes?: number;
  servings?: number;
  category?: string;
  isFavorite?: boolean;
  ingredients: {
    quantity?: string;
    unit?: string;
    name: string;
  }[];
  instructions: {
    text: string;
  }[];
};

async function readError(response: Response): Promise<string> {
  const body = (await response.json()) as { error?: string };

  return body.error ?? 'The request failed.';
}

export async function listRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${apiUrl}/recipes`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Recipe[]>;
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const response = await fetch(`${apiUrl}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Recipe>;
}

export async function getRecipe(recipeId: string): Promise<Recipe> {
  const response = await fetch(`${apiUrl}/recipes/${recipeId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Recipe>;
}

export async function updateRecipe(
  recipeId: string,
  input: RecipeInput,
): Promise<Recipe> {
  const response = await fetch(`${apiUrl}/recipes/${recipeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Recipe>;
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const response = await fetch(`${apiUrl}/recipes/${recipeId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}