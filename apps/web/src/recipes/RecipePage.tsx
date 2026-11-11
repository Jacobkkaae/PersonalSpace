import { FormEvent, useEffect, useState } from 'react';

import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
  type Recipe,
  type RecipeInput,
} from '../recipes';

type RecipePageProps = {
  onLogout: () => Promise<void>;
};

type DraftIngredient = {
  id: string;
  quantity: string;
  unit: string;
  name: string;
};

type DraftInstruction = {
  id: string;
  text: string;
};

type RecipeDraft = {
  title: string;
  description: string;
  notes: string;
  category: string;
  preparationTimeMinutes: string;
  cookingTimeMinutes: string;
  servings: string;
  isFavorite: boolean;
  ingredients: DraftIngredient[];
  instructions: DraftInstruction[];
};

let draftId = 0;

const newId = () => {
  draftId += 1;
  return `draft-${draftId}`;
};

function emptyDraft(): RecipeDraft {
  return {
    title: '',
    description: '',
    notes: '',
    category: '',
    preparationTimeMinutes: '',
    cookingTimeMinutes: '',
    servings: '',
    isFavorite: false,
    ingredients: [{ id: newId(), quantity: '', unit: '', name: '' }],
    instructions: [{ id: newId(), text: '' }],
  };
}

function draftFromRecipe(recipe: Recipe): RecipeDraft {
  return {
    title: recipe.title,
    description: recipe.description ?? '',
    notes: recipe.notes ?? '',
    category: recipe.category ?? '',
    preparationTimeMinutes: recipe.preparationTimeMinutes?.toString() ?? '',
    cookingTimeMinutes: recipe.cookingTimeMinutes?.toString() ?? '',
    servings: recipe.servings?.toString() ?? '',
    isFavorite: recipe.isFavorite,
    ingredients: (recipe.ingredients ?? []).map((ingredient) => ({
      id: ingredient.id,
      quantity: ingredient.quantity ?? '',
      unit: ingredient.unit ?? '',
      name: ingredient.name,
    })),
    instructions: (recipe.instructions ?? []).map((instruction) => ({
      id: instruction.id,
      text: instruction.text,
    })),
  };
}

function inputFromDraft(draft: RecipeDraft): RecipeInput {
  const optionalNumber = (value: string) =>
    value ? Number.parseInt(value, 10) : undefined;

  return {
    title: draft.title,
    description: draft.description || undefined,
    notes: draft.notes || undefined,
    category: draft.category || undefined,
    preparationTimeMinutes: optionalNumber(draft.preparationTimeMinutes),
    cookingTimeMinutes: optionalNumber(draft.cookingTimeMinutes),
    servings: optionalNumber(draft.servings),
    isFavorite: draft.isFavorite,
    ingredients: draft.ingredients.map(({ quantity, unit, name }) => ({
      quantity: quantity || undefined,
      unit: unit || undefined,
      name,
    })),
    instructions: draft.instructions.map(({ text }) => ({ text })),
  };
}

function RecipeForm({
  draft,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  draft: RecipeDraft;
  isSaving: boolean;
  onChange: (draft: RecipeDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  function updateIngredient(
    id: string,
    field: keyof Omit<DraftIngredient, 'id'>,
    value: string,
  ) {
    onChange({
      ...draft,
      ingredients: draft.ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    });
  }

  function updateInstruction(id: string, text: string) {
    onChange({
      ...draft,
      instructions: draft.instructions.map((instruction) =>
        instruction.id === id ? { ...instruction, text } : instruction,
      ),
    });
  }

  return (
    <form className="recipe-form" onSubmit={onSubmit}>
      <label>
        Title
        <input
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
          required
        />
      </label>

      <label>
        Short description
        <textarea
          value={draft.description}
          onChange={(event) =>
            onChange({ ...draft, description: event.target.value })
          }
          rows={3}
        />
      </label>

      <div className="field-grid">
        <label>
          Category
          <input
            value={draft.category}
            onChange={(event) =>
              onChange({ ...draft, category: event.target.value })
            }
          />
        </label>
        <label>
          Servings
          <input
            type="number"
            min="1"
            value={draft.servings}
            onChange={(event) =>
              onChange({ ...draft, servings: event.target.value })
            }
          />
        </label>
        <label>
          Prep. minutes
          <input
            type="number"
            min="1"
            value={draft.preparationTimeMinutes}
            onChange={(event) =>
              onChange({
                ...draft,
                preparationTimeMinutes: event.target.value,
              })
            }
          />
        </label>
        <label>
          Cooking minutes
          <input
            type="number"
            min="1"
            value={draft.cookingTimeMinutes}
            onChange={(event) =>
              onChange({ ...draft, cookingTimeMinutes: event.target.value })
            }
          />
        </label>
      </div>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={draft.isFavorite}
          onChange={(event) =>
            onChange({ ...draft, isFavorite: event.target.checked })
          }
        />
        Favorite recipe
      </label>

      <div className="editor-section">
        <div className="section-heading">
          <h3>Ingredients</h3>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              onChange({
                ...draft,
                ingredients: [
                  ...draft.ingredients,
                  { id: newId(), quantity: '', unit: '', name: '' },
                ],
              })
            }
          >
            + Add ingredient
          </button>
        </div>
        {draft.ingredients.map((ingredient, index) => (
          <div className="ingredient-row" key={ingredient.id}>
            <span className="row-number">{index + 1}</span>
            <input
              aria-label={`Ingredient ${index + 1} quantity`}
              placeholder="Qty"
              value={ingredient.quantity}
              onChange={(event) =>
                updateIngredient(ingredient.id, 'quantity', event.target.value)
              }
            />
            <input
              aria-label={`Ingredient ${index + 1} unit`}
              placeholder="Unit"
              value={ingredient.unit}
              onChange={(event) =>
                updateIngredient(ingredient.id, 'unit', event.target.value)
              }
            />
            <input
              aria-label={`Ingredient ${index + 1} name`}
              placeholder="Ingredient name"
              value={ingredient.name}
              onChange={(event) =>
                updateIngredient(ingredient.id, 'name', event.target.value)
              }
              required
            />
            <button
              type="button"
              className="icon-button"
              aria-label="Remove ingredient"
              disabled={draft.ingredients.length === 1}
              onClick={() =>
                onChange({
                  ...draft,
                  ingredients: draft.ingredients.filter(
                    (item) => item.id !== ingredient.id,
                  ),
                })
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="editor-section">
        <div className="section-heading">
          <h3>Method</h3>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              onChange({
                ...draft,
                instructions: [
                  ...draft.instructions,
                  { id: newId(), text: '' },
                ],
              })
            }
          >
            + Add step
          </button>
        </div>
        {draft.instructions.map((instruction, index) => (
          <div className="instruction-row" key={instruction.id}>
            <span className="step-number">{index + 1}</span>
            <textarea
              aria-label={`Instruction step ${index + 1}`}
              placeholder="Describe this step"
              value={instruction.text}
              onChange={(event) =>
                updateInstruction(instruction.id, event.target.value)
              }
              required
              rows={3}
            />
            <button
              type="button"
              className="icon-button"
              aria-label="Remove step"
              disabled={draft.instructions.length === 1}
              onClick={() =>
                onChange({
                  ...draft,
                  instructions: draft.instructions.filter(
                    (item) => item.id !== instruction.id,
                  ),
                })
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <label>
        Notes
        <textarea
          value={draft.notes}
          onChange={(event) => onChange({ ...draft, notes: event.target.value })}
          placeholder="Variations, serving ideas, or things to remember"
          rows={4}
        />
      </label>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function RecipePage({ onLogout }: RecipePageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    listRecipes()
      .then(setRecipes)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'Could not load recipes.'),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const visibleRecipes = recipes.filter((recipe) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      recipe.title.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  });

  function openRecipe(recipe: Recipe) {
    setError(null);
    setSelectedRecipe(null);
    getRecipe(recipe.id)
      .then((loadedRecipe) => {
        setSelectedRecipe(loadedRecipe);
        setDraft(draftFromRecipe(loadedRecipe));
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : 'Could not load recipe.'),
      );
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const recipe = await createRecipe(inputFromDraft(draft));
      setRecipes((current) => [recipe, ...current]);
      setIsCreating(false);
      setDraft(emptyDraft());
      openRecipe(recipe);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecipe) return;
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateRecipe(selectedRecipe.id, inputFromDraft(draft));
      setRecipes((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedRecipe(updated);
      setDraft(draftFromRecipe(updated));
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRecipe || !window.confirm(`Delete "${selectedRecipe.title}"?`)) return;
    setError(null);
    try {
      await deleteRecipe(selectedRecipe.id);
      setRecipes((current) => current.filter((item) => item.id !== selectedRecipe.id));
      setSelectedRecipe(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete recipe.');
    }
  }

  return (
    <div className="recipe-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">PERSONAL SPACE</p>
          <h1>Recipes</h1>
        </div>
        <button type="button" className="secondary-button" onClick={onLogout}>
          Log out
        </button>
      </header>

      {selectedRecipe ? (
        <section className="recipe-detail">
          <button type="button" className="back-button" onClick={() => setSelectedRecipe(null)}>
            ← All recipes
          </button>
          {isEditing ? (
            <>
              <div className="page-heading">
                <p className="eyebrow">EDIT RECIPE</p>
                <h2>{selectedRecipe.title}</h2>
              </div>
              <RecipeForm
                draft={draft}
                isSaving={isSaving}
                onChange={setDraft}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setDraft(draftFromRecipe(selectedRecipe));
                  setIsEditing(false);
                }}
                submitLabel="Save changes"
              />
            </>
          ) : (
            <>
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">{selectedRecipe.category || 'RECIPE'}</p>
                  <h2>{selectedRecipe.title}</h2>
                  {selectedRecipe.description && <p className="lead">{selectedRecipe.description}</p>}
                </div>
                <div className="detail-actions">
                  <button type="button" className="primary-button" onClick={() => setIsEditing(true)}>
                    Edit recipe
                  </button>
                  <button type="button" className="danger-button" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="recipe-meta">
                {selectedRecipe.preparationTimeMinutes && <span>Prep {selectedRecipe.preparationTimeMinutes} min</span>}
                {selectedRecipe.cookingTimeMinutes && <span>Cook {selectedRecipe.cookingTimeMinutes} min</span>}
                {selectedRecipe.servings && <span>{selectedRecipe.servings} servings</span>}
                {selectedRecipe.isFavorite && <span>★ Favorite</span>}
              </div>
              <div className="detail-grid">
                <div>
                  <h3>Ingredients</h3>
                  <ul className="ingredient-list">
                    {(selectedRecipe.ingredients ?? []).map((ingredient) => (
                      <li key={ingredient.id}>
                        <span>{[ingredient.quantity, ingredient.unit].filter(Boolean).join(' ')}</span>
                        <strong>{ingredient.name}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Method</h3>
                  <ol className="instruction-list">
                    {(selectedRecipe.instructions ?? []).map((instruction) => (
                      <li key={instruction.id}>{instruction.text}</li>
                    ))}
                  </ol>
                </div>
              </div>
              {selectedRecipe.notes && (
                <aside className="notes-card">
                  <h3>Notes</h3>
                  <p>{selectedRecipe.notes}</p>
                </aside>
              )}
            </>
          )}
        </section>
      ) : (
        <>
          <div className="toolbar">
            <div>
              <p className="lead">A quiet place for the recipes you want to keep.</p>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setIsCreating(true);
                setDraft(emptyDraft());
              }}
            >
              + New recipe
            </button>
          </div>
          <label className="search-field">
            <span>Search recipes</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or category"
            />
          </label>
          {isCreating && (
            <section className="editor-card">
              <div className="page-heading">
                <p className="eyebrow">NEW RECIPE</p>
                <h2>Create a recipe</h2>
              </div>
              <RecipeForm
                draft={draft}
                isSaving={isSaving}
                onChange={setDraft}
                onSubmit={handleCreate}
                onCancel={() => setIsCreating(false)}
                submitLabel="Create recipe"
              />
            </section>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
          {isLoading ? (
            <p className="empty-state">Loading your recipes...</p>
          ) : visibleRecipes.length === 0 ? (
            <div className="empty-state">
              <h2>{search ? 'No matching recipes' : 'Your recipe collection is empty'}</h2>
              <p>{search ? 'Try another search.' : 'Create your first recipe to get started.'}</p>
            </div>
          ) : (
            <div className="recipe-grid">
              {visibleRecipes.map((recipe) => (
                <button type="button" className="recipe-card" key={recipe.id} onClick={() => openRecipe(recipe)}>
                  <div className="card-topline">
                    <span>{recipe.category || 'Recipe'}</span>
                    {recipe.isFavorite && <span aria-label="Favorite">★</span>}
                  </div>
                  <h2>{recipe.title}</h2>
                  <p>{recipe.description || 'Open recipe to view ingredients and method.'}</p>
                  <span className="card-link">View recipe →</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {error && selectedRecipe && <p className="error-message" role="alert">{error}</p>}
    </div>
  );
}
