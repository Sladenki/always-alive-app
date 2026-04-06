/** Счётчики «интересуются» / активность: популярное визуально тяжелее. */
export function interestNumberClass(n: number): string {
  if (n > 20) return 'text-white font-medium';
  if (n < 5) return 'text-muted-foreground font-medium';
  return 'text-foreground font-medium';
}
