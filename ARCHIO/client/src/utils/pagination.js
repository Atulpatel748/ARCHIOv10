export function pageWindow(current, total, siblings = 1) {
  if (total <= 5 + siblings * 2) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const pages = [1];
  if (start > 2) pages.push('gap-start');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('gap-end');
  pages.push(total);
  return pages;
}
