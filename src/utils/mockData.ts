import { Story, User, AVAILABLE_CATEGORIES } from "../types";

export const currentUser: User = {
  id: "user-1",
  name: "여행자",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  bio: "",
  city: "서울",
  ageGroup: "20대",
  occupation: "스타트업 직장인",
  stickerCount: 12,
};

const generateStories = (): Story[] => {
  const stories: Story[] = [
    {
      id: "story-0",
      userId: "user-1",
      userName: "여행자",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      userCity: "서울",
      userAgeGroup: "20대",
      userOccupation: "스타트업 직장인",
      feedType: "worry",
      content: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다. 팀원들의 기대에 부응할 수 있을지, 제대로 해낼 수 있을지 걱정된다. 하지만 최선을 다해보려고 한다.",
      categories: ["커리어/직장생활"],
      empathyCount: 15,
      empathizedBy: ["user-2"],
      stickers: [{ userId: "user-3", message: "할 수 있어요!", emoji: "✨" }],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    }
  ];

  for (let i = 1; i < 50; i++) {
    const isWorry = Math.random() > 0.4;
    const feedType = isWorry ? "worry" : "grateful";
    const category = AVAILABLE_CATEGORIES[Math.floor(Math.random() * AVAILABLE_CATEGORIES.length)];
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    
    stories.push({
      id: `story-${i}`,
      userId: `user-${i + 10}`,
      userName: `익 명 ${i}`,
      userAvatar: `https://api.dicebear.com/7.x/micah/svg?seed=${i}`,
      userCity: ["서울", "부산", "대구", "대전"][Math.floor(Math.random() * 4)],
      userAgeGroup: ["20대", "30대", "40대"][Math.floor(Math.random() * 3)],
      userOccupation: ["직장인", "학생", "프리랜서"][Math.floor(Math.random() * 3)],
      feedType,
      content: isWorry 
        ? "오늘 하루가 너무 힘들었다. 그냥 아무 생각 없이 쉬고 싶다. 내일은 좀 더 나은 하루가 되길 바란다."
        : "출근길에 본 하늘이 너무 맑아서 기분이 좋았다. 작은 행복을 느낄 수 있음에 감사한다.",
      categories: isWorry ? [category] : [],
      empathyCount: Math.floor(Math.random() * 50),
      empathizedBy: [],
      stickers: [],
      createdAt: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000)),
    });
  }

  return stories;
};

export const mockStories: Story[] = generateStories();
