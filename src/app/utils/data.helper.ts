import { paginate, PaginationResult } from './helpers';

export function createDataGenerator<T, F = any>(
  fetchFn: (page: number, size: number, filters: F) => Promise<{ data: T[], total: number }>,
  filters: F,
  batchSize: number
) {
  let page = 1;
  let totalData = 0;

  async function* generatorFunc() {
    do {
      let response;
      try {
        response = await fetchFn(page, batchSize, filters);

        if (page === 1) {
          totalData = response.total;
        }
      } catch (e) {
        break;
      }

      const rows = response.data;
      if (!rows || rows.length === 0) {
        break;
      }

      yield rows;
      page++;
    } while (true);
  }

  return {
    generator: generatorFunc(),
    getTotal: () => totalData
  };
}

export class PaginationHelper {
  static paginate<T>(
    items: T[],
    page: number,
    pageSize: number,
    maxVisiblePages: number = 5
  ): PaginationResult<T> {
    return paginate(items, page, pageSize, maxVisiblePages);
  }
}
