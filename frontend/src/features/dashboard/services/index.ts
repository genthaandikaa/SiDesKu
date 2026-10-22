export const dashboardService = {
  calculatePercentage: (current: number, target: number): number => {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  },
  filterBySearch: <T extends Record<string, any>>(items: T[], query: string, fields: (keyof T)[]): T[] => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase().trim();
    return items.filter((item) =>
      fields.some((field) => {
        const val = item[field];
        return val != null && String(val).toLowerCase().includes(lower);
      })
    );
  },
};
