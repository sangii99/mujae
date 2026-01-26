# 무제 (Untitled) - 소셜 미디어 플랫폼 완전 재현 가이드

## 프로젝트 개요

일기 형태의 개인적인 이야기를 공유하는 소셜 미디어 플랫폼 "무제"를 구축합니다. 사용자들이 취업, 연애, 가족, 정신건강 등의 고민을 카테고리별로 나누어 공유하고 서로 공감할 수 있는 플랫폼입니다.

## 핵심 컨셉

- **두 가지 피드 타입**
  - 😢 **걱정과 불안**: 사용자들의 고민, 걱정, 불안을 나누는 공간
  - 💛 **감사와 따뜻함**: 감사했던 순간, 따뜻한 경험을 나누는 공간

- **익명성과 안전한 공유**
  - 닉네임과 프로필 사진은 사용자가 자유롭게 설정
  - 게시글에는 도시, 나이대, 직업이 표시되어 맥락 제공
  - 민감한 개인정보는 노출되지 않음

## 디자인 시스템

### 컬러 스킴 (종이책 질감의 따뜻한 미색 톤)

```css
/* globals.css의 핵심 색상 */
:root {
  --background: linear-gradient(135deg, #f8f6f0 0%, #faf8f3 100%);
  --foreground: oklch(0.145 0 0);
  --card: #f5f3ed;
  --card-foreground: oklch(0.145 0 0);
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --border: rgba(0, 0, 0, 0.1);
}

body {
  background: linear-gradient(135deg, #faf8f3 0%, #f8f6f0 50%, #faf8f3 100%);
  min-height: 100vh;
}
```

### 레이아웃

- **모바일 우선 반응형 디자인**
- **최대 너비**: 컨텐츠는 `max-w-4xl mx-auto`로 중앙 정렬
- **하단 네비게이션 바**: 항상 화면 하단 고정
- **우측 하단 Floating 버튼**: 글쓰기 버튼 (Edit3 아이콘)

## 데이터 구조

### 타입 정의 (`/types/index.ts`)

```typescript
export interface User {
  id: string;
  name: string;           // 닉네임
  avatar: string;         // 프로필 이미지 URL
  bio: string;
  city: string;           // 도시 (예: "서울", "부산")
  ageGroup: string;       // 나이대 (예: "20대", "30대")
  occupation: string;     // 직업 (예: "스타트업 직장인", "취업준비생")
  stickerCount: number;   // 보낼 수 있는 응원 스티커 개수
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCity: string;
  userAgeGroup: string;
  userOccupation: string;
  feedType: "worry" | "grateful";  // 피드 타입
  content: string;                 // 게시글 내용
  categories: string[];            // 선택된 카테고리들
  empathyCount: number;            // 공감 수
  empathizedBy: string[];          // 공감한 사용자 ID 목록
  stickers: { userId: string; message: string; emoji: string }[];  // 받은 응원 스티커들
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: "empathy" | "sticker";     // 알림 타입
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  storyId: string;
  storyContent: string;
  stickerEmoji?: string;           // 스티커 알림일 경우
  stickerMessage?: string;         // 스티커 메시지
  createdAt: Date;
  read: boolean;                   // 읽음 여부
}
```

### 카테고리 목록 (19개)

```typescript
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
```

### 응원 스티커 목록

```typescript
export const SUPPORT_STICKERS = [
  { emoji: "💪", message: "힘내세요!" },
  { emoji: "🌟", message: "응원해요!" },
  { emoji: "🤝", message: "함께 있어요" },
  { emoji: "💚", message: "괜찮아요" },
  { emoji: "👏", message: "잘하고 있어요!" },
  { emoji: "☀️", message: "힘을 내요!" },
];
```

## 앱 구조

### 헤더 (Header)

```tsx
<header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      {/* 좌측: 응원 스티커 개수 표시 (Tooltip 포함) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="h-10 gap-1.5 px-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">{currentUserData.stickerCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{currentUserData.name} 님이 보낼 수 있는 응원 스티커 개수는 {currentUserData.stickerCount} 개 입니다.</p>
        </TooltipContent>
      </Tooltip>
      
      {/* 중앙: 로고 */}
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 fill-current" />
        <h1 className="text-xl font-semibold">무제</h1>
      </div>
      
      {/* 우측: 알림 패널 */}
      <NotificationPanel
        notifications={notifications}
        onMarkAsRead={(id) => {/* 읽음 처리 */}}
        onClearAll={() => {/* 전체 삭제 */}}
      />
    </div>
  </div>
</header>
```

**중요 기능**:
- 스티커 개수 표시에 Tooltip을 추가하여 안내 제공
- 알림 패널에서 공감/스티커 알림 확인 가능

### 하단 네비게이션 (Bottom Navigation)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-10">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-around py-3">
      {/* 걱정과 불안 탭 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "worry" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("worry")}
      >
        <span className="text-xl">🌧️</span>
      </button>
      
      {/* 감사와 따뜻함 탭 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "grateful" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("grateful")}
      >
        <span className="text-xl">☀️</span>
      </button>

      {/* 공감한 이야기 탭 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "empathy" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("empathy")}
      >
        <Heart className="h-5 w-5" />
      </button>

      {/* 프로필 탭 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "profile" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("profile")}
      >
        <span className="text-xl">👤</span>
      </button>

      {/* 설정 탭 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "settings" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("settings")}
      >
        <SettingsIcon className="h-5 w-5" />
      </button>
    </div>
  </div>
</nav>
```

**중요**:
- 5개 탭: 걱정과 불안(🌧️), 감사와 따뜻함(☀️), 공감한 이야기(❤️), 프로필(👤), 설정(⚙️)
- 현재 활성 탭은 배경색이 변경됨 (`bg-accent`)

### Floating 글쓰기 버튼

```tsx
<Button
  size="lg"
  className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
  onClick={() => setCreateStoryOpen(true)}
>
  <Edit3 className="h-6 w-6" />
</Button>
```

**위치**: 화면 우측 하단, 하단 네비게이션 바 위

## 핵심 기능

### 1. 피드 시스템

#### 걱정과 불안 탭

```tsx
<TabsContent value="worry" className="space-y-6">
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-medium mb-2">😢 걱정과 불안</h2>
      <p className="text-muted-foreground">
        당신의 걱정을 나누세요. 당신만 그런 게 아니에요.
      </p>
    </div>
    
    {/* 카테고리 필터 */}
    <CategoryFilter
      selectedCategories={selectedCategories}
      onToggleCategory={handleToggleCategory}
    />
    
    {/* 피드 */}
    <Feed
      stories={worryStories}
      onEmpathize={handleEmpathize}
      onSendSticker={handleSendSticker}
      currentUserId={currentUserData.id}
      currentUserStickerCount={currentUserData.stickerCount}
      fontSize={fontSize}
    />
  </div>
</TabsContent>
```

#### 감사와 따뜻함 탭

```tsx
<TabsContent value="grateful" className="space-y-6">
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-medium mb-2">💛 감사와 따뜻함</h2>
      <p className="text-muted-foreground">
        따뜻했던 순간을 나누세요. 당신의 이야기가 누군가에게는 힘이 돼요.
      </p>
    </div>
    
    {/* 감사와 따뜻함 피드에는 카테고리 필터가 없음 */}
    
    <Feed
      stories={gratefulStories}
      onEmpathize={handleEmpathize}
      onSendSticker={handleSendSticker}
      currentUserId={currentUserData.id}
      currentUserStickerCount={currentUserData.stickerCount}
      fontSize={fontSize}
    />
  </div>
</TabsContent>
```

**중요**: 
- 걱정과 불안 탭에만 카테고리 필터가 표시됨
- 감사와 따뜻함 탭에는 카테고리 필터가 없음

### 2. 카테고리 필터 (`/components/CategoryFilter.tsx`)

```tsx
export function CategoryFilter({ selectedCategories, onToggleCategory }) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 보기 뱃지 */}
      <Badge
        variant={selectedCategories.length === 0 ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onToggleCategory("all")}
      >
        모든 이야기
      </Badge>
      
      {/* 개별 카테고리 뱃지들 */}
      {AVAILABLE_CATEGORIES.map((category) => (
        <Badge
          key={category}
          variant={selectedCategories.includes(category) ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onToggleCategory(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}
```

**동작**:
- "모든 이야기" 클릭 시 모든 필터 해제
- 카테고리 클릭 시 토글 (선택/해제)
- 선택된 카테고리는 `variant="default"` (진한 배경), 해제된 것은 `variant="outline"`

### 3. 피드 컴포넌트 (`/components/Feed.tsx`)

**격려 메시지 카드 삽입**: 매 4개의 게시글마다 격려 메시지 카드가 삽입됨

```tsx
export function Feed({ stories, onEmpathize, onSendSticker, currentUserId, currentUserStickerCount, fontSize = 16 }) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>이야기가 없습니다. 첫 번째로 이야기를 공유해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <>
          <StoryCard
            key={story.id}
            story={story}
            onEmpathize={onEmpathize}
            onSendSticker={onSendSticker}
            isEmpathized={story.empathizedBy.includes(currentUserId)}
            hasSentSticker={story.stickers.some(s => s.userId === currentUserId)}
            canSendSticker={currentUserStickerCount > 0}
            fontSize={fontSize}
          />
          
          {/* 매 4개 게시글마다 격려 메시지 카드 삽입 */}
          {(index + 1) % 4 === 0 && (
            <EncouragementCard
              message={encouragementMessages[(index / 4) % encouragementMessages.length].text}
            />
          )}
        </>
      ))}
    </div>
  );
}
```

### 4. 격려 메시지 (`/utils/encouragementMessages.ts`)

```typescript
export const encouragementMessages = [
  {
    id: 1,
    text: "잘 할 수 있고 잘 할 거예요. 시간이 더 필요할 뿐이에요.",
  },
  {
    id: 2,
    text: "사소한 일들이 밀려와도 괜찮아요. 모두들 그러하듯 견딜 수 있어요.",
  },
  {
    id: 3,
    text: "후회만 가득한 과거와 불안하기만 한 미래 때문에 지금을 망치지 마세요. 오늘을 살아가세요.",
  },
  {
    id: 4,
    text: "마음에 있는 불꽃이 꺼지는 일이 없을 거예요.",
  },
  {
    id: 5,
    text: "인생은 때때로 힘들지만, 그 속에서 무엇을 해낼 것인지는 우리 스스로의 선택이에요.",
  },
];
```

### 5. 격려 메시지 카드 (`/components/EncouragementCard.tsx`)

```tsx
export function EncouragementCard({ message }) {
  return (
    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/50 rounded-lg p-6 text-center">
      <p className="text-base text-amber-900/80 leading-relaxed font-medium">
        {message}
      </p>
    </div>
  );
}
```

**디자인**: 
- 따뜻한 앰버/오렌지 톤의 그라데이션 배경
- 연한 테두리
- 중앙 정렬된 텍스트

### 6. 게시글 카드 (`/components/StoryCard.tsx`)

**주요 구성 요소**:

```tsx
export function StoryCard({ 
  story, 
  onEmpathize, 
  onSendSticker, 
  isEmpathized, 
  hasSentSticker,
  canSendSticker,
  fontSize = 16 
}) {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더: 사용자 정보 */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={story.userAvatar} alt={story.userName} />
          <AvatarFallback>{story.userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{story.userName}</span>
            {story.feedType === "worry" ? (
              <span className="text-xs">😢</span>
            ) : (
              <span className="text-xs">💛</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {story.userCity} · {story.userAgeGroup} · {story.userOccupation}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(story.createdAt, { addSuffix: true, locale: ko })}
        </span>
      </div>

      {/* 카테고리 뱃지들 */}
      <div className="flex flex-wrap gap-1">
        {story.categories.map((category) => (
          <Badge key={category} variant="secondary" className="text-xs">
            {category}
          </Badge>
        ))}
      </div>

      {/* 게시글 내용 */}
      <p 
        className="text-foreground leading-relaxed whitespace-pre-wrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {story.content}
      </p>

      {/* 받은 응원 스티커들 표시 */}
      {story.stickers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {story.stickers.map((sticker, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1"
            >
              <span className="text-sm">{sticker.emoji}</span>
              <span className="text-xs text-muted-foreground">{sticker.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-4 pt-2 border-t">
        {/* 공감 버튼 */}
        <button
          onClick={() => onEmpathize(story.id)}
          className={`flex items-center gap-1 text-sm ${
            isEmpathized ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          <Heart className={`h-4 w-4 ${isEmpathized ? "fill-current" : ""}`} />
          <span>{story.empathyCount}</span>
        </button>

        {/* 응원 스티커 보내기 버튼 */}
        <StickerPicker
          onSelectSticker={(emoji, message) => onSendSticker(story.id, emoji, message)}
          disabled={hasSentSticker || !canSendSticker}
        />
      </div>
    </div>
  );
}
```

**중요 기능**:
- 공감 버튼 클릭 시 하트 색상 변경 (빨간색 + fill)
- 응원 스티커는 한 게시글당 한 번만 보낼 수 있음
- 스티커 개수가 0이면 보낼 수 없음
- 게시글 내용은 `fontSize` prop에 따라 크기 조절 가능 (설정에서 변경)

### 7. 응원 스티커 피커 (`/components/StickerPicker.tsx`)

```tsx
export function StickerPicker({ onSelectSticker, disabled }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={`flex items-center gap-1 text-sm ${
            disabled ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>응원</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <p className="text-sm font-medium">응원 스티커 보내기</p>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORT_STICKERS.map((sticker) => (
              <button
                key={sticker.emoji}
                onClick={() => onSelectSticker(sticker.emoji, sticker.message)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <span className="text-xl">{sticker.emoji}</span>
                <span className="text-sm">{sticker.message}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 8. 글쓰기 다이얼로그 (`/components/CreateStory.tsx`)

**중요 변경사항**: 
- 현재 탭에 따라 자동으로 feedType 결정
- 피드 타입 선택 UI 제거됨
- 다이얼로그 배경색: `bg-[#faf8f3]` (앱과 동일한 연노랑색)

```tsx
export function CreateStory({ onCreateStory, open, onOpenChange, currentTab }) {
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // 현재 탭에 따라 feedType 자동 결정
  const feedType: "worry" | "grateful" = currentTab === "grateful" ? "grateful" : "worry";

  const handleSubmit = () => {
    if (content.trim() && selectedCategories.length > 0) {
      onCreateStory(content, selectedCategories, feedType);
      setContent("");
      setSelectedCategories([]);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#faf8f3] border-[#e8e6e0]">
        <DialogHeader>
          <DialogTitle>새 게시물 작성</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 레이블과 텍스트 박스 */}
          <div>
            <label className="text-sm font-medium block mb-3">
              {feedType === "worry" 
                ? "당신의 걱정과 불안을 들려주세요." 
                : "당신의 감사와 따뜻한 경험을 들려주세요."}
            </label>
            <Textarea
              placeholder={
                feedType === "worry"
                  ? "오늘 나는 걱정이 되는 게... / 요즘 힘든 게... / 불안한 일이..."
                  : "오늘 감사했던 일은... / 따뜻했던 순간... / 행복했던 경험..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[280px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {content.length}자
            </p>
          </div>
          
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              이야기와 관련된 카테고리를 선택하세요 (최소 1개)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* 버튼들 */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || selectedCategories.length === 0}
          >
            공유하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**중요 스타일링**:
- 레이블과 텍스트박스 간격: `mb-3`
- 텍스트박스와 글자수 표시 간격: `mt-2`
- 텍스트박스 최소 높이: `min-h-[280px]`
- 다이얼로그 배경: `bg-[#faf8f3]`, 테두리: `border-[#e8e6e0]`

### 9. 알림 패널 (`/components/NotificationPanel.tsx`)

```tsx
export function NotificationPanel({ notifications, onMarkAsRead, onClearAll }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">알림</h3>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                전체 삭제
              </Button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              알림이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    notification.read ? "bg-background" : "bg-accent"
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {notification.fromUserAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.fromUserAvatar} />
                        <AvatarFallback>{notification.fromUserName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{notification.fromUserName}</span>
                        {notification.type === "empathy" ? (
                          <span> 님이 공감했습니다</span>
                        ) : (
                          <span> 님이 응원 스티커를 보냈습니다</span>
                        )}
                      </p>
                      {notification.type === "sticker" && (
                        <div className="flex items-center gap-1">
                          <span>{notification.stickerEmoji}</span>
                          <span className="text-xs text-muted-foreground">
                            {notification.stickerMessage}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.storyContent}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ko })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**기능**:
- 읽지 않은 알림 개수를 빨간 배지로 표시
- 알림 클릭 시 읽음 처리 (배경색 변경)
- 전체 삭제 버튼

### 10. 프로필 페이지 (`/components/Profile.tsx`)

**기능**:
- 닉네임 및 프로필 사진 변경
- 내가 작성한 게시글 목록 (MyStoryCard 컴포넌트 사용)
- 프로필 정보 표시 (도시, 나이대, 직업, 보낼 수 있는 스티커 개수)

```tsx
export function Profile({ user, stories, onUpdateProfile, fontSize = 16 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);

  const myStories = stories.filter(s => s.userId === user.id);

  const handleSave = () => {
    onUpdateProfile(nickname, avatarUrl);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* 프로필 헤더 */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임"
                />
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="프로필 이미지 URL"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>저장</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium">{user.name}</h2>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                    수정
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.city} · {user.ageGroup} · {user.occupation}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  보낼 수 있는 스티커: {user.stickerCount}개
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 내 게시글 목록 */}
      <div>
        <h3 className="text-lg font-medium mb-4">내 이야기 ({myStories.length})</h3>
        {myStories.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            아직 작성한 이야기가 없습니다
          </p>
        ) : (
          <div className="space-y-4">
            {myStories.map((story) => (
              <MyStoryCard key={story.id} story={story} fontSize={fontSize} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 11. 내 게시글 카드 (`/components/MyStoryCard.tsx`)

**차이점**: StoryCard와 유사하지만, 공감/스티커 보내기 버튼이 없음

```tsx
export function MyStoryCard({ story, fontSize = 16 }) {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {story.feedType === "worry" ? (
            <span className="text-xl">😢</span>
          ) : (
            <span className="text-xl">💛</span>
          )}
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(story.createdAt, { addSuffix: true, locale: ko })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {story.categories.map((category) => (
          <Badge key={category} variant="secondary" className="text-xs">
            {category}
          </Badge>
        ))}
      </div>

      <p 
        className="text-foreground leading-relaxed whitespace-pre-wrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {story.content}
      </p>

      {/* 받은 공감 및 스티커 통계 */}
      <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>공감 {story.empathyCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-4 w-4" />
          <span>스티커 {story.stickers.length}</span>
        </div>
      </div>

      {/* 받은 스티커들 표시 */}
      {story.stickers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {story.stickers.map((sticker, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1"
            >
              <span className="text-sm">{sticker.emoji}</span>
              <span className="text-xs text-muted-foreground">{sticker.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 12. 설정 페이지 (`/components/Settings.tsx`)

```tsx
export function Settings({ fontSize, onFontSizeChange }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-4">설정</h2>
        </div>

        {/* 글자 크기 조절 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">글자 크기</label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">작게</span>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={12}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">크게</span>
          </div>
          <p className="text-xs text-muted-foreground">
            현재 크기: {fontSize}px
          </p>
        </div>

        {/* 미리보기 */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">미리보기</p>
          <div className="bg-background rounded-lg p-4">
            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
              요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다. 팀원들의 기대에 부응할 수 있을지, 제대로 해낼 수 있을지 걱정된다. 하지만 최선을 다해보려고 한다.
            </p>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-sm font-medium">앱 정보</h3>
          <p className="text-sm text-muted-foreground">무제 v1.0.0</p>
          <p className="text-xs text-muted-foreground">
            일기 형태의 개인적인 이야기를 공유하는 소셜 미디어 플랫폼
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 핵심 비즈니스 로직

### 1. 공감 기능 (`handleEmpathize`)

```tsx
const handleEmpathize = (storyId: string) => {
  setStories((prevStories) =>
    prevStories.map((story) => {
      if (story.id === storyId) {
        const hasEmpathized = story.empathizedBy.includes(currentUserData.id);
        
        // 공감 추가 시 알림 생성 (자신의 글이 아닐 때)
        if (!hasEmpathized && story.userId !== currentUserData.id) {
          const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: "empathy",
            fromUserId: currentUserData.id,
            fromUserName: currentUserData.name,
            fromUserAvatar: currentUserData.avatar,
            storyId: story.id,
            storyContent: story.content,
            createdAt: new Date(),
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev]);
        }
        
        return {
          ...story,
          empathyCount: hasEmpathized
            ? story.empathyCount - 1
            : story.empathyCount + 1,
          empathizedBy: hasEmpathized
            ? story.empathizedBy.filter((id) => id !== currentUserData.id)
            : [...story.empathizedBy, currentUserData.id],
        };
      }
      return story;
    })
  );
};
```

**동작**:
- 이미 공감한 경우: 공감 취소 (토글)
- 처음 공감하는 경우: 공감 추가 + 알림 생성 (본인 글이 아닐 때)

### 2. 응원 스티커 보내기 (`handleSendSticker`)

```tsx
const handleSendSticker = (storyId: string, emoji: string, message: string) => {
  // 스티커가 없으면 전송 불가
  if (currentUserData.stickerCount === 0) return;
  
  const targetStory = stories.find((s) => s.id === storyId);
  if (!targetStory) return;
  
  // 이미 이 스토리에 스티커를 보냈으면 전송 불가
  const hasSentSticker = targetStory.stickers.some((s) => s.userId === currentUserData.id);
  if (hasSentSticker) return;
  
  // 자기 글인지 확인 (자기 글에 보내면 다른 사람이 보낸 것으로 시뮬레이션)
  const isOwnStory = targetStory.userId === currentUserData.id;
  
  // 응원 스티커 알림 생성
  const newNotification: Notification = {
    id: `notif-${Date.now()}`,
    type: "sticker",
    fromUserId: isOwnStory ? "anonymous" : currentUserData.id,
    fromUserName: isOwnStory ? "익명의 친구" : currentUserData.name,
    fromUserAvatar: isOwnStory ? "" : currentUserData.avatar,
    storyId: targetStory.id,
    storyContent: targetStory.content,
    stickerEmoji: emoji,
    stickerMessage: message,
    createdAt: new Date(),
    read: false,
  };
  setNotifications((prev) => [newNotification, ...prev]);
  
  // 스티커 전송
  setStories((prevStories) =>
    prevStories.map((story) => {
      if (story.id === storyId) {
        return {
          ...story,
          stickers: [...story.stickers, { userId: currentUserData.id, message, emoji }],
        };
      }
      return story;
    })
  );
  
  // 현재 사용자의 스티커 개수 업데이트
  if (isOwnStory) {
    // 자기 글에 보낼 때: 다른 사람이 보낸 것으로 시뮬레이션 (스티커 받기 = +1)
    setCurrentUserData((prev) => ({
      ...prev,
      stickerCount: prev.stickerCount + 1,
    }));
  } else {
    // 다른 사람 글에 보낼 때: 스티커 보내기 (= -1)
    setCurrentUserData((prev) => ({
      ...prev,
      stickerCount: prev.stickerCount - 1,
    }));
  }
};
```

**중요 규칙**:
- 한 게시글당 한 번만 스티커 보낼 수 있음
- 스티커 개수가 0이면 보낼 수 없음
- 자기 글에 스티커를 보내면 "익명의 친구"로 표시되며, 스티커 개수가 증가함 (테스트/시뮬레이션용)
- 다른 사람 글에 스티커를 보내면 스티커 개수가 감소함

### 3. 프로필 업데이트 (`handleUpdateProfile`)

```tsx
const handleUpdateProfile = (nickname: string, avatarUrl: string) => {
  const updatedUser = {
    ...currentUserData,
    name: nickname,
    avatar: avatarUrl,
  };
  setCurrentUserData(updatedUser);
  
  // 기존 스토리들의 사용자 정보도 업데이트
  setStories((prevStories) =>
    prevStories.map((story) =>
      story.userId === currentUserData.id
        ? { ...story, userName: nickname, userAvatar: avatarUrl }
        : story
    )
  );
};
```

**동작**: 닉네임/프로필 사진 변경 시 기존 게시글들에도 반영

### 4. 카테고리 필터링

```tsx
const handleToggleCategory = (category: string) => {
  if (category === "all") {
    setSelectedCategories([]);
  } else {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }
};

const filterStoriesByFeedType = (feedType: "worry" | "grateful") => {
  const feedStories = stories.filter((story) => story.feedType === feedType);
  return selectedCategories.length === 0
    ? feedStories
    : feedStories.filter((story) =>
        story.categories.some((cat) => selectedCategories.includes(cat))
      );
};

const worryStories = filterStoriesByFeedType("worry");
const gratefulStories = filterStoriesByFeedType("grateful");
```

**동작**:
- "모든 이야기" 클릭: 모든 필터 제거
- 카테고리 클릭: 해당 카테고리 토글
- 여러 카테고리 선택 가능 (OR 조건)

## 모크 데이터

### 초기 사용자

```typescript
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
```

### 모크 게시글

**최소 40개의 게시글 생성 필요**. 다양한 카테고리와 피드 타입으로 구성:

```typescript
export const mockStories: Story[] = [
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
    categories: ["커리어/직장생활", "일상"],
    empathyCount: 23,
    empathizedBy: ["user-2", "user-3"],
    stickers: [
      { userId: "user-2", message: "힘내세요!", emoji: "💪" },
      { userId: "user-3", message: "응원해요!", emoji: "🌟" },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  // ... 최소 40개의 다양한 스토리
];
```

**중요**: 
- 걱정과 불안(`worry`)과 감사와 따뜻함(`grateful`) 게시글을 적절히 섞어서 생성
- 다양한 카테고리 사용
- 다양한 사용자, 도시, 나이대, 직업 조합

## 추가 라이브러리

```bash
npm install date-fns lucide-react
```

- **date-fns**: 시간 포맷팅 (`formatDistanceToNow`)
- **lucide-react**: 아이콘 (Heart, Edit3, Bell, Settings, Sparkles 등)

### date-fns 한국어 로케일 사용

```tsx
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

formatDistanceToNow(date, { addSuffix: true, locale: ko })
// 예: "2시간 전", "5분 전"
```

## 중요 구현 사항 체크리스트

### 필수 구현 항목

- [x] 종이책 질감의 따뜻한 미색 톤 디자인 (`#faf8f3`, `#f5f3ed` 등)
- [x] 하단 네비게이션 바 (5개 탭)
- [x] 우측 하단 floating 글쓰기 버튼
- [x] 19개 카테고리
- [x] 걱정과 불안 탭에만 카테고리 필터 표시
- [x] 감사와 따뜻함 탭에는 카테고리 필터 없음
- [x] 현재 탭에 따라 글쓰기 다이얼로그의 feedType 자동 결정
- [x] 글쓰기 다이얼로그 배경색: `bg-[#faf8f3]`
- [x] 레이블 "당신의 걱정과 불안을 들려주세요." (worry) / "당신의 감사와 따뜻한 경험을 들려주세요." (grateful)
- [x] 텍스트박스 높이: `min-h-[280px]`
- [x] 레이블-텍스트박스 간격: `mb-3`, 텍스트박스-글자수 간격: `mt-2`
- [x] 매 4개 게시글마다 격려 메시지 카드 삽입
- [x] 5개의 격려 메시지 순환 표시
- [x] 공감 기능 (토글 가능, 하트 색상 변경)
- [x] 응원 스티커 시스템 (6종류, 한 게시글당 1회, 개수 제한)
- [x] 알림 시스템 (공감/스티커 알림, 읽음 처리)
- [x] 프로필 편집 (닉네임, 프로필 사진)
- [x] 글자 크기 조절 (12px ~ 20px)
- [x] 공감한 이야기 탭
- [x] 최소 40개의 모크 게시글

### 스타일링 세부사항

- **카드**: `bg-card`, `rounded-lg`, `border`, `p-6`, `shadow-sm`, `hover:shadow-md`
- **뱃지**: 선택 시 `variant="default"`, 미선택 시 `variant="outline"`
- **응원 스티커 표시**: `bg-amber-50`, `border-amber-200`, `rounded-full`, `px-3 py-1`
- **격려 메시지 카드**: `bg-gradient-to-br from-amber-50/50 to-orange-50/50`, `border-amber-200/50`
- **공감 버튼**: 공감 시 `text-red-500` + `fill-current`
- **하단 네비게이션**: 활성 탭 `bg-accent`, 비활성 탭 `text-muted-foreground`

## 최종 확인 사항

1. **페이지 여백**: `container mx-auto px-4 py-8 pb-24` (하단 네비게이션 공간 확보)
2. **반응형**: 모바일 우선, `max-w-4xl` 중앙 정렬
3. **z-index**: 헤더(`z-10`), 하단 네비(`z-10`), floating 버튼(`z-20`)
4. **시간 표시**: `formatDistanceToNow`로 상대 시간 표시, 한국어 로케일 사용
5. **아바타**: Unsplash 이미지 사용, Fallback은 닉네임 첫 글자
6. **내용 표시**: `whitespace-pre-wrap`으로 줄바꿈 유지
7. **알림 배지**: 읽지 않은 알림 개수 표시 (`bg-red-500`, 우측 상단)
8. **스티커 카운터**: 헤더 좌측에 Tooltip과 함께 표시

이 프롬프트를 사용하면 "무제" 앱의 모든 기능과 디자인을 정확하게 재현할 수 있습니다.
