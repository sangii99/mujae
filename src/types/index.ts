export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  city: string;
  ageGroup: string;
  occupation: string;
  gender?: string; // 추가
  isGenderPublic?: boolean; // 추가
  stickerCount: number;
  lastNicknameUpdated?: Date;
  lastAgeGroupUpdated?: Date;
  lastOccupationUpdated?: Date;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCity: string;
  userAgeGroup: string;
  userOccupation: string;
  userGender?: string; // Opt-in gender display
  feedType: "worry" | "grateful";
  content: string;
  categories: string[];
  empathyCount: number;
  empathizedBy: string[];
  stickers: { userId: string; message: string; emoji: string }[];
  createdAt: Date;
  isPublic?: boolean;
}

export interface Notification {
  id: string;
  type: "empathy" | "sticker";
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  storyId: string;
  storyContent: string;
  stickerEmoji?: string;
  stickerMessage?: string;
  createdAt: Date;
  read: boolean;
}

export const AVAILABLE_CATEGORIES = [
  "인간관계",
  "연애/결혼",
  "커리어/직장생활",
  "진로",
  "취준/취직",
  "학업/시험",
  "일상",
  "경제/금전",
  "육아/자녀",
  "가족관계",
  "건강/간병",
  "마음의병/콤플렉스",
  "유학/해외생활",
  "창업/사업",
  "법적문제",
  "트라우마",
  "성/성 정체성",
  "반려동물",
  "쉬었음 청년",
];

export const SUPPORT_STICKERS = [
  { emoji: "💪", message: "힘내세요!" },
  { emoji: "🌟", message: "응원해요!" },
  { emoji: "🤝", message: "함께 있어요" },
  { emoji: "💚", message: "괜찮아요" },
  { emoji: "👏", message: "잘하고 있어요!" },
];
