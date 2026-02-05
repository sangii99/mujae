export const getTimeAgo = (date: Date | string) => {
  const d = new Date(date);
  const hours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours === 1) return "1시간 전";
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1일 전";
  return `${days}일 전`;
};
