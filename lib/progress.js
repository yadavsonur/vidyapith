export const calculateProgressPercentage = (completed, total) => {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (completed / total) * 100));
};
