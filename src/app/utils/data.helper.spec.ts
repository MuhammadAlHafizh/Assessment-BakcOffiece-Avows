import { PaginationHelper, createDataGenerator } from './data.helper';

describe('PaginationHelper', () => {
  it('harus memotong data dengan benar sesuai halaman', () => {
    const items = Array.from({ length: 10 }, (_, i) => i + 1);

    const res1 = PaginationHelper.paginate(items, 1, 3);
    expect(res1.paginatedItems).toEqual([1, 2, 3]);
    expect(res1.totalPages).toBe(4);
    expect(res1.pagesArray).toEqual([1, 2, 3, 4]);
    expect(res1.startIndex).toBe(1);
    expect(res1.endIndex).toBe(3);

    const res2 = PaginationHelper.paginate(items, 4, 3);
    expect(res2.paginatedItems).toEqual([10]);
    expect(res2.totalPages).toBe(4);
    expect(res2.pagesArray).toEqual([1, 2, 3, 4]);
    expect(res2.startIndex).toBe(10);
    expect(res2.endIndex).toBe(10);
  });

  it('harus menangani batas nomor halaman dengan benar', () => {
    const items = [1, 2, 3];

    const res1 = PaginationHelper.paginate(items, 0, 2);
    expect(res1.paginatedItems).toEqual([1, 2]);

    const res2 = PaginationHelper.paginate(items, 10, 2);
    expect(res2.paginatedItems).toEqual([3]);
  });
});

describe('createDataGenerator', () => {
  
  const mockFetch = async (page: number, size: number, filters: any) => {
    const allData = Array.from({ length: 35 }, (_, i) => `item-${i + 1}`);
    const start = (page - 1) * size;
    return {
      data: allData.slice(start, start + size),
      total: allData.length
    };
  };

  it('harus menghasilkan (yield) data sesuai ukuran batch yang ditentukan', async () => {
    const { generator } = createDataGenerator(mockFetch, {}, 10);

    const batch1 = await generator.next();
    expect(batch1.done).toBeFalse();
    expect(batch1.value?.length).toBe(10);
    expect(batch1.value?.[0]).toBe('item-1');

    const batch2 = await generator.next();
    expect(batch2.done).toBeFalse();
    expect(batch2.value?.length).toBe(10);
    expect(batch2.value?.[0]).toBe('item-11');
  });

  it('harus berhenti ketika tidak ada data lagi', async () => {
    const { generator } = createDataGenerator(mockFetch, {}, 20);

    await generator.next(); 
    await generator.next(); 
    const done = await generator.next(); 

    expect(done.done).toBeTrue();
  });

  it('harus menangani saat fetch gagal (melempar error)', async () => {
    const failFetch = async () => { throw new Error('Gagal ambil data'); };
    const { generator } = createDataGenerator(failFetch, {}, 10);

    const result = await generator.next();
    expect(result.done).toBeTrue();
  });
});
