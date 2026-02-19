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

export const getRemainingDays = (lastUpdated: Date | undefined, coolDownDays: number) => {
  if (!lastUpdated) return 0;
  const nextUpdateDate = new Date(lastUpdated);
  nextUpdateDate.setDate(nextUpdateDate.getDate() + coolDownDays);
  const now = new Date();
  const diffTime = nextUpdateDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const calculateAgeGroup = (birthDateString: string): string => {
  if (!birthDateString) return "";
  const birthDate = new Date(birthDateString);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 10) return "10대 미만";
  if (age >= 100) return "100세 이상";
  const ageGroup = Math.floor(age / 10) * 10;
  return `${ageGroup}대`;
};
