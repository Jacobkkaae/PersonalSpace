import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';


import { requireAuthentication } from '../auth/guard.js';
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
} from './service.js';
import {
  createRecipeInputSchema,
  updateRecipeInputSchema,
} from '@personal-space/shared';

const recipeIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const recipeRoutes: FastifyPluginAsync = async (server) => {
  server.get(
    '/recipes',
    { preHandler: requireAuthentication },
    async (request) => {
      return listRecipes(request.user!.id);
    },
  );

  server.post(
    '/recipes',
    { preHandler: requireAuthentication },
    async (request, reply) => {
      const result = createRecipeInputSchema.safeParse(request.body);

      if (!result.success) {
        return reply.code(400).send({
          error: 'Invalid recipe data.',
          details: result.error.flatten(),
        });
      }

      const recipe = await createRecipe(request.user!.id, result.data);

      return reply.code(201).send(recipe);
    },
  );

  server.get<{
    Params: { id: string };
  }>(
    '/recipes/:id',
    { preHandler: requireAuthentication },
    async (request, reply) => {
      const params = recipeIdParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid recipe ID.',
        });
      }

      const recipe = await getRecipe(request.user!.id, params.data.id);

      if (!recipe) {
        return reply.code(404).send({
          error: 'Recipe not found.',
        });
      }

      return recipe;
    },
  );

  server.put<{
    Params: { id: string };
  }>(
    '/recipes/:id',
    { preHandler: requireAuthentication },
    async (request, reply) => {
      const params = recipeIdParamsSchema.safeParse(request.params);
      const input = updateRecipeInputSchema.safeParse(request.body);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid recipe ID.',
        });
      }

      if (!input.success) {
        return reply.code(400).send({
          error: 'Invalid recipe data.',
          details: input.error.flatten(),
        });
      }

      const recipe = await updateRecipe(
        request.user!.id,
        params.data.id,
        input.data,
      );

      if (!recipe) {
        return reply.code(404).send({
          error: 'Recipe not found.',
        });
      }

      return recipe;
    },
  );

  server.delete<{
    Params: { id: string };
  }>(
    '/recipes/:id',
    { preHandler: requireAuthentication },
    async (request, reply) => {
      const params = recipeIdParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.code(400).send({
          error: 'Invalid recipe ID.',
        });
      }

      const deleted = await deleteRecipe(
        request.user!.id,
        params.data.id,
      );

      if (!deleted) {
        return reply.code(404).send({
          error: 'Recipe not found.',
        });
      }

      return reply.code(204).send();
    },
  );
};