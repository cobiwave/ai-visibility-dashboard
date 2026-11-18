'use client';

import { useMutation, type QueryKey } from '@tanstack/react-query';
import { toggleTracked } from '@/features/prompts/actions/toggle-tracked';
import { promptKeys } from '@/features/prompts/queries/keys';
import type { Paginated, PromptRow } from '@/features/prompts/types';

interface ToggleVariables {
  promptId: string;
  tracked: boolean;
  simulateFailure: boolean;
}

function patchTracked(
  page: Paginated<PromptRow> | undefined,
  { promptId, tracked }: ToggleVariables,
): Paginated<PromptRow> | undefined {
  if (!page) return page;
  return {
    ...page,
    items: page.items.map((row) => (row.id === promptId ? { ...row, tracked } : row)),
  };
}

/**
 * Optimistic ★: the cache changes before the server answers.
 * 1. onMutate: cancel in-flight list fetches (they'd overwrite the patch),
 *    snapshot every cached list, patch the prompt in all of them.
 * 2. onError: put the snapshots back and tell the caller.
 * 3. onSettled: refetch the lists either way, so the cache ends up matching
 *    the server whether the toggle worked or not.
 */
export function useToggleTracked({ onFailure }: { onFailure: (promptId: string) => void }) {
  return useMutation({
    mutationFn: async (variables: ToggleVariables) => {
      const result = await toggleTracked(variables);
      // The action returns error codes instead of throwing; throwing here is
      // what routes the failure into onError.
      if (!result.ok) throw new Error(result.error);
      return result;
    },
    onMutate: async (variables, { client }) => {
      await client.cancelQueries({ queryKey: promptKeys.lists() });
      const snapshot: [QueryKey, Paginated<PromptRow> | undefined][] = client.getQueriesData({
        queryKey: promptKeys.lists(),
      });
      client.setQueriesData<Paginated<PromptRow>>({ queryKey: promptKeys.lists() }, (page) =>
        patchTracked(page, variables),
      );
      return { snapshot };
    },
    onError: (_error, variables, onMutateResult, { client }) => {
      for (const [queryKey, data] of onMutateResult?.snapshot ?? []) {
        client.setQueryData(queryKey, data);
      }
      onFailure(variables.promptId);
    },
    onSettled: (_data, _error, _variables, _onMutateResult, { client }) =>
      client.invalidateQueries({ queryKey: promptKeys.lists() }),
  });
}
