/** PostgREST caps a response at 1 000 rows; read past it page by page. */
export const PAGE_SIZE = 1000;

type PageResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/**
 * `page(from, to)` must build a fresh query with `.range(from, to)` and a stable order.
 * Stops at `max` rows when given.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PageResult<T>,
  options: { max?: number } = {},
): Promise<T[]> {
  const rows: T[] = [];
  const max = options.max ?? Number.POSITIVE_INFINITY;
  for (let from = 0; from < max; from += PAGE_SIZE) {
    const to = Math.min(from + PAGE_SIZE, max) - 1;
    const { data, error } = await page(from, to);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < to - from + 1) break;
  }
  return rows;
}
