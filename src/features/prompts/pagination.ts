export type PageItem = number | 'gap';

const SHOW_ALL_UP_TO = 7;

/**
 * Page buttons to render: always the first, last, current and its neighbours,
 * with a gap where pages are skipped. 12 pages, on 5 → 1 … 4 5 6 … 12.
 */
export function pageItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= SHOW_ALL_UP_TO) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [...new Set([1, current - 1, current, current + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((page, index) => {
    const previous = pages[index - 1];
    return previous !== undefined && page - previous > 1 ? ['gap' as const, page] : [page];
  });
}
