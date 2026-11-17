import { PromptsTableHead } from '@/features/prompts/components/PromptsTableHead';
import { PROMPTS_ROW_CLASS, PROMPTS_TABLE_CLASS } from '@/features/prompts/components/table-styles';
import { Skeleton } from '@/shared/ui/Skeleton';

const ROWS = 10;

/**
 * The Suspense fallback, part of the static shell. Same filter bar, table
 * header and 10 fixed-height rows as the real region, so nothing shifts.
 */
export function PromptsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex flex-col gap-1 text-sm">
            <Skeleton className="my-0.5 h-4 w-16" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
        ))}
      </div>
      <div className="border-border bg-surface-1 overflow-x-auto rounded-lg border">
        <table aria-hidden className={PROMPTS_TABLE_CLASS}>
          <PromptsTableHead />
          <tbody>
            {Array.from({ length: ROWS }, (_, index) => (
              <tr key={index} className={PROMPTS_ROW_CLASS}>
                <td className="px-2">
                  <Skeleton className="size-6" />
                </td>
                <td className="px-2">
                  <Skeleton className="h-4 w-3/4" />
                </td>
                {[0, 1, 2, 3].map((cell) => (
                  <td key={cell} className="px-2">
                    <Skeleton className="h-4 w-12" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
