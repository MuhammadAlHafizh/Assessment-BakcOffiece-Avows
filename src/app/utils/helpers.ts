export interface PaginationResult<T> {
  paginatedItems: T[];
  totalPages: number;
  pagesArray: number[];
  startIndex: number;
  endIndex: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
  maxVisiblePages: number = 5
): PaginationResult<T> {
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const sanitizedPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (sanitizedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);
  const paginatedItems = items.slice(startIndex, endIndex);

  const pagesArray: number[] = [];
  let start = Math.max(1, sanitizedPage - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pagesArray.push(i);
  }

  return {
    paginatedItems,
    totalPages,
    pagesArray,
    startIndex: items.length > 0 ? startIndex + 1 : 0,
    endIndex
  };
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDatetime(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const hVal = d.getHours();
  const mVal = d.getMinutes();
  const hour = hVal < 10 ? '0' + hVal : '' + hVal;
  const min = mVal < 10 ? '0' + mVal : '' + mVal;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${hour}:${min}`;
}

export function formatSalary(val: number | undefined): string {
  if (val === undefined || val === null) {
    return '';
  }
  const parts = val.toFixed(2).split('.');
  const num = parts[0];
  const decimal = parts[1];
  const formattedNum = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp. ${formattedNum},${decimal}`;
}

export function formatLogDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatLogTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
