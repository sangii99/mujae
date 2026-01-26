# "무제" 소셜 미디어 플랫폼 완전 구축 가이드

일기 형태의 개인적인 이야기를 공유하는 소셜 미디어 플랫폼 "무제"를 구축해주세요.

---

## 📱 플랫폼 개요

### 핵심 컨셉
사용자들이 취업, 연애, 가족, 정신건강 등 일상의 고민과 감사한 순간을 익명으로 공유하며 서로 공감하고 응원할 수 있는 따뜻한 커뮤니티 플랫폼입니다.

### 주요 특징
- **이중 피드 시스템**: 😢 걱정과 불안 / 💛 감사와 따뜻함
- **익명성 보장**: 닉네임, 도시, 나이대, 직업만 표시
- **감성적 디자인**: 종이책 질감의 따뜻한 미색 톤
- **모바일 우선**: 하단 네비게이션 + floating 액션 버튼
- **상호 응원**: 공감 기능 + 응원 스티커 시스템

---

## 🎨 디자인 시스템

### 컬러 팔레트

#### 배경 색상
```css
/* 메인 배경 (body) */
background: linear-gradient(135deg, #faf8f3 0%, #f8f6f0 50%, #faf8f3 100%);

/* 앱 컨테이너 배경 */
background: linear-gradient(to bottom right, #faf8f3, #f5f3ed, #ede8dc);

/* 일반 카드 배경 */
background: #f5f3ed;
border: #e8e6e0;

/* 프로필 박스 배경 */
background: #ede8dc;

/* 격려 카드 배경 */
background: linear-gradient(to right, #fffbeb, #ffedd5);
border: rgba(251, 191, 36, 0.5);
```

#### 강조 색상
```css
/* 아바타 fallback 그라데이션 */
background: linear-gradient(to bottom right, #60a5fa, #a855f7);

/* Amber 톤 (격려 카드) */
background: #fef3c7; /* amber-100 */
icon-color: #d97706; /* amber-600 */
text-color: #78350f; /* amber-900 */
```

### 타이포그래피
- 기본 폰트 크기: 16px (설정에서 14px ~ 22px 조절 가능)
- 제목 (h1): 2xl, medium weight
- 부제목 (h2): xl, medium weight
- 본문: base, normal weight
- 시간/보조 텍스트: sm, muted-foreground

### 간격 시스템
- 카드 패딩: `p-6` (24px)
- 카드 간 간격: `space-y-4` (16px)
- 섹션 간격: `space-y-6` (24px)
- 헤더 높이: sticky top-0
- 하단 네비게이션: 고정 `bottom-0`, padding `py-3`
- Floating 버튼: `bottom-20 right-4` (네비게이션 위)

### 그림자 & 호버
- 카드 기본: 얇은 border
- 카드 hover: `shadow-lg` + transition-shadow
- Floating 버튼: `shadow-lg`
- 격려 카드: `shadow-sm`

---

## 🏗️ 전체 구조

### 레이아웃 계층
```
<div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc]">
  {/* 헤더 (Sticky) */}
  <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
    <!-- 스티커 개수 | 무제 로고 | 알림 벨 -->
  </header>

  {/* 메인 콘텐츠 */}
  <main className="container mx-auto px-4 py-8 pb-24">
    <Tabs> <!-- 5개 탭 콘텐츠 --> </Tabs>
  </main>

  {/* Floating 글쓰기 버튼 */}
  <Button className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20">
    <Edit3 />
  </Button>

  {/* 하단 네비게이션 (Sticky) */}
  <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-10">
    <!-- 5개 탭 버튼 -->
  </nav>

  {/* 다이얼로그들 */}
  <CreateStory />
</div>
```

---

## 📍 헤더 (Header)

### 구조
```tsx
<header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      {/* 왼쪽: 스티커 개수 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="h-10 gap-1.5 px-3">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">{stickerCount}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userName} 님이 보낼 수 있는 응원 스티커 개수는 {stickerCount} 개 입니다.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 중앙: 로고 */}
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 fill-current" />
        <h1 className="text-xl font-semibold">무제</h1>
      </div>

      {/* 오른쪽: 알림 */}
      <NotificationPanel />
    </div>
  </div>
</header>
```

---

## 📑 탭 시스템 (5개 탭)

### 1. 😢 걱정과 불안 (worry)
```tsx
<TabsContent value="worry">
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-medium mb-2">😢 걱정과 불안</h2>
      <p className="text-muted-foreground">
        당신의 걱정을 나누세요. 당신만 그런 게 아니에요.
      </p>
    </div>
    <CategoryFilter />
    <Feed stories={worryStories} />
  </div>
</TabsContent>
```

### 2. 💛 감사와 따뜻함 (grateful)
```tsx
<TabsContent value="grateful">
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-medium mb-2">💛 감사와 따뜻함</h2>
      <p className="text-muted-foreground">
        따뜻했던 순간을 나누세요. 당신의 이야기가 누군가에게는 힘이 돼요.
      </p>
    </div>
    <CategoryFilter />
    <Feed stories={gratefulStories} />
  </div>
</TabsContent>
```

### 3. 공감한 이야기 (empathy)
```tsx
<TabsContent value="empathy">
  <div className="max-w-4xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-medium mb-2">공감한 이야기</h2>
      <p className="text-muted-foreground">
        당신이 공감한 이야기들 - 당신만 그런 게 아니에요.
      </p>
    </div>
    {empathizedStories.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground">
        <p>아직 공감한 이야기가 없습니다.</p>
        <p className="text-sm mt-2">탐색을 시작하고 다른 사람들과 연결되어 보세요!</p>
      </div>
    ) : (
      <Feed stories={empathizedStories} />
    )}
  </div>
</TabsContent>
```

### 4. 프로필 (profile)
- 상단: 프로필 카드
  - 배경색: `#ede8dc`
  - 아바타 크기: 28x28 (h-28 w-28)
  - 프로필 편집 버튼
- 하단: 내가 작성한 게시글 목록

### 5. 설정 (settings)
- 텍스트 크기 조절 (14px ~ 22px)
- 실시간 미리보기
- 앱 정보

---

## 🏷️ 카테고리 필터

### 카테고리 목록 (16개 + 전체)
```typescript
const AVAILABLE_CATEGORIES = [
  "커리어", "이직", "취직", "연애", "결혼", "육아",
  "가족 관계", "건강", "재정", "인간 관계", "퇴직",
  "학교 생활", "학업", "직장 생활", "진로", "우울증"
];
```

### UI 구조
```tsx
<div className="space-y-3">
  <h3 className="font-medium">카테고리별 필터</h3>
  <div className="flex flex-wrap gap-2">
    {/* 전체 필터 */}
    <Badge
      variant={selectedCategories.length === 0 ? "default" : "outline"}
      className="cursor-pointer"
      onClick={() => onToggleCategory("all")}
    >
      모든 이야기
    </Badge>
    
    {/* 개별 카테고리 */}
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
</div>
```

### 필터링 로직
- "모든 이야기" 클릭: 모든 선택 해제
- 개별 카테고리 클릭: 토글 (복수 선택 가능)
- 빈 배열: 모든 게시글 표시
- 선택된 카테고리: OR 조건 (하나라도 포함되면 표시)

---

## 📝 게시글 카드 (StoryCard)

### 전체 구조
```tsx
<Card className="p-6 hover:shadow-lg transition-shadow bg-[#f5f3ed] border-[#e8e6e0]">
  <div className="space-y-4">
    {/* 1. 헤더 (아바타 + 사용자 정보 + 시간) */}
    <div className="flex items-start gap-4">
      <Avatar className="h-12 w-12 bg-muted">
        <AvatarImage src={userAvatar} />
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
          {userName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{userName}</h3>
          <span className="text-xs text-muted-foreground/70">
            · {city} · {ageGroup} {occupation}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
    
    {/* 2. 본문 */}
    <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
      {content}
    </p>
    
    {/* 3. 카테고리 배지 */}
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Badge key={category} variant="secondary">{category}</Badge>
      ))}
    </div>
    
    {/* 4. 받은 스티커 (있을 경우) */}
    {stickers.length > 0 && (
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent transition-colors text-sm">
              {stickers.slice(0, 3).map((sticker, i) => (
                <span key={i} className="text-lg">{sticker.emoji}</span>
              ))}
              {stickers.length > 3 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{stickers.length - 3}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">받은 응원 스티커</p>
              <div className="space-y-1.5">
                {stickers.map((sticker, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{sticker.emoji}</span>
                    <span className="text-muted-foreground">{sticker.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )}
    
    {/* 5. 액션 버튼 */}
    <div className="flex items-center justify-between">
      {/* 공감 버튼 */}
      <Button
        variant={hasEmpathized ? "default" : "outline"}
        size="sm"
        onClick={() => onEmpathize(storyId)}
        className="gap-2"
      >
        <Heart className={`h-4 w-4 ${hasEmpathized ? "fill-current" : ""}`} />
        <span>{empathyCount}명이 공감해요</span>
      </Button>
      
      {/* 응원 스티커 버튼 */}
      <StickerPicker
        onSendSticker={handleSendSticker}
        stickerCount={currentUserStickerCount}
        disabled={hasSentSticker || isOwnStory}
      />
    </div>
  </div>
</Card>
```

### 시간 표시 로직
```typescript
const getTimeAgo = (date: Date) => {
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours === 1) return "1시간 전";
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1일 전";
  return `${days}일 전`;
};
```

---

## 💌 격려 카드 (EncouragementCard)

### 삽입 규칙
- 8개 게시글마다 1개씩 삽입
- 피드의 마지막에는 삽입하지 않음
- 인덱스 계산: `(index + 1) % 8 === 0 && index < stories.length - 1`

### UI 구조
```tsx
<div className="my-8 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-sm">
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
      <Sparkles className="w-5 h-5 text-amber-600" />
    </div>
    <div className="flex-1">
      <p className="text-lg text-amber-900 leading-relaxed italic">
        "{message}"
      </p>
    </div>
  </div>
</div>
```

### 격려 문구 5개 (순환 표시)
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

---

## ✍️ 게시글 작성 (CreateStory)

### 트리거
- 우측 하단 Floating 버튼 클릭
- 위치: `fixed bottom-20 right-4`
- 크기: `h-14 w-14 rounded-full`
- 아이콘: Edit3

### 다이얼로그 구조
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>이야기 공유하기</DialogTitle>
      <DialogDescription>
        당신의 생각, 감정, 경험을 표현하세요. 당신의 이야기는 누군가에게 위로가 될 수 있습니다.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      {/* 1. 피드 타입 선택 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">어떤 종류의 이야기인가요?</label>
        <div className="flex gap-2">
          <Button
            variant={feedType === "worry" ? "default" : "outline"}
            onClick={() => setFeedType("worry")}
            className="flex-1 gap-2"
          >
            😢 걱정/불안
          </Button>
          <Button
            variant={feedType === "grateful" ? "default" : "outline"}
            onClick={() => setFeedType("grateful")}
            className="flex-1 gap-2"
          >
            💛 감사/따뜻함
          </Button>
        </div>
      </div>

      {/* 2. 본문 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">무슨 생각을 하고 계신가요?</label>
        <Textarea
          placeholder={
            feedType === "worry"
              ? "오늘 나는 걱정이 되는 게... / 요즘 힘든 게... / 불안한 일이..."
              : "오늘 감사했던 일은... / 따뜻했던 순간... / 행복했던 경험..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        <p className="text-xs text-muted-foreground">{content.length}자</p>
      </div>
      
      {/* 3. 카테고리 선택 */}
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
    
    {/* 4. 액션 버튼 */}
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
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
```

### 제출 로직
```typescript
const handleSubmit = () => {
  if (content.trim() && selectedCategories.length > 0) {
    const newStory = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userCity: currentUser.city,
      userAgeGroup: currentUser.ageGroup,
      userOccupation: currentUser.occupation,
      feedType,
      content,
      categories: selectedCategories,
      empathyCount: 0,
      empathizedBy: [],
      stickers: [],
      createdAt: new Date(),
    };
    
    setStories([newStory, ...stories]); // 최상단에 추가
    setContent("");
    setSelectedCategories([]);
    setFeedType("worry");
    onOpenChange(false);
  }
};
```

---

## 💖 공감 기능

### 동작 방식
```typescript
const handleEmpathize = (storyId: string) => {
  setStories((prevStories) =>
    prevStories.map((story) => {
      if (story.id === storyId) {
        const hasEmpathized = story.empathizedBy.includes(currentUserId);
        
        // 공감 추가 시 알림 생성 (자신의 글이 아닐 때)
        if (!hasEmpathized && story.userId !== currentUserId) {
          const newNotification = {
            id: `notif-${Date.now()}`,
            type: "empathy",
            fromUserId: currentUserId,
            fromUserName: currentUser.name,
            fromUserAvatar: currentUser.avatar,
            storyId: story.id,
            storyContent: story.content,
            createdAt: new Date(),
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev]);
        }
        
        return {
          ...story,
          empathyCount: hasEmpathized ? story.empathyCount - 1 : story.empathyCount + 1,
          empathizedBy: hasEmpathized
            ? story.empathizedBy.filter((id) => id !== currentUserId)
            : [...story.empathizedBy, currentUserId],
        };
      }
      return story;
    })
  );
};
```

### UI 상태
- 공감 전: 빈 하트 아이콘, outline 버튼
- 공감 후: 채워진 하트 아이콘, default 버튼
- 다시 클릭하면 공감 취소 (토글)

---

## 🎁 응원 스티커 시스템

### 스티커 종류 (6개)
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

### 스티커 선택 다이얼로그
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={disabled || stickerCount === 0}
    >
      <Sparkles className="h-4 w-4" />
      <span>응원하기</span>
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>응원 스티커 보내기</DialogTitle>
      <DialogDescription>
        따뜻한 응원 메시지를 선택해서 보내보세요. (남은 스티커: {stickerCount}개)
      </DialogDescription>
    </DialogHeader>
    
    <div className="grid grid-cols-2 gap-3 py-4">
      {SUPPORT_STICKERS.map((sticker) => (
        <Button
          key={sticker.message}
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2 hover:bg-accent hover:scale-105 transition-all"
          onClick={() => handleSelect(sticker.emoji, sticker.message)}
        >
          <span className="text-3xl">{sticker.emoji}</span>
          <span className="text-sm">{sticker.message}</span>
        </Button>
      ))}
    </div>
  </DialogContent>
</Dialog>
```

### 스티커 전송 로직
```typescript
const handleSendSticker = (storyId: string, emoji: string, message: string) => {
  // 1. 유효성 검사
  if (currentUser.stickerCount === 0) return;
  
  const targetStory = stories.find((s) => s.id === storyId);
  if (!targetStory) return;
  
  const hasSentSticker = targetStory.stickers.some((s) => s.userId === currentUserId);
  if (hasSentSticker) return;
  
  // 2. 본인 글 여부 확인
  const isOwnStory = targetStory.userId === currentUserId;
  
  // 3. 알림 생성
  const newNotification = {
    id: `notif-${Date.now()}`,
    type: "sticker",
    fromUserId: isOwnStory ? "anonymous" : currentUserId,
    fromUserName: isOwnStory ? "익명의 친구" : currentUser.name,
    fromUserAvatar: isOwnStory ? "" : currentUser.avatar,
    storyId: targetStory.id,
    storyContent: targetStory.content,
    stickerEmoji: emoji,
    stickerMessage: message,
    createdAt: new Date(),
    read: false,
  };
  setNotifications((prev) => [newNotification, ...prev]);
  
  // 4. 스티커 추가
  setStories((prevStories) =>
    prevStories.map((story) => {
      if (story.id === storyId) {
        return {
          ...story,
          stickers: [...story.stickers, { userId: currentUserId, message, emoji }],
        };
      }
      return story;
    })
  );
  
  // 5. 스티커 개수 조정
  if (isOwnStory) {
    // 본인 글: 다른 사람이 보낸 것으로 시뮬레이션 (+1)
    setCurrentUser((prev) => ({ ...prev, stickerCount: prev.stickerCount + 1 }));
  } else {
    // 다른 사람 글: 실제 전송 (-1)
    setCurrentUser((prev) => ({ ...prev, stickerCount: prev.stickerCount - 1 }));
  }
};
```

### 버튼 비활성화 조건
- 스티커 개수가 0개일 때
- 이미 해당 게시글에 스티커를 보냈을 때
- 본인 게시글일 때 (특수 케이스 제외)

---

## 🔔 알림 시스템 (NotificationPanel)

### 우측 Sheet 패널
```tsx
<Sheet onOpenChange={handleOpenChange}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-full sm:w-[400px] bg-[#faf8f3]">
    <SheetHeader>
      <SheetTitle>알림</SheetTitle>
    </SheetHeader>
    
    <ScrollArea className="h-[calc(100vh-100px)] mt-4">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-20" />
          <p>알림이 없습니다</p>
          <p className="text-sm mt-2">새로운 공감이나 응원이 오면 알려드릴게요!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </ScrollArea>
  </SheetContent>
</Sheet>
```

### 알림 카드
```tsx
<div
  className={`p-4 rounded-lg border transition-colors ${
    notification.read ? "bg-background" : "bg-accent/50"
  }`}
>
  <div className="flex items-start gap-3">
    <Avatar className="h-10 w-10">
      <AvatarImage src={notification.fromUserAvatar} />
      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
        {notification.fromUserName.charAt(0)}
      </AvatarFallback>
    </Avatar>
    
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        {notification.type === "empathy" ? (
          <Heart className="h-4 w-4 fill-current text-red-500" />
        ) : (
          <span className="text-lg">{notification.stickerEmoji}</span>
        )}
        <span className="font-medium">{notification.fromUserName}</span>
        <span className="text-xs text-muted-foreground">
          {getTimeAgo(notification.createdAt)}
        </span>
      </div>
      
      <p className="text-sm">
        {notification.type === "empathy" ? (
          <>님이 회원님의 이야기에 공감했습니다</>
        ) : (
          <>님이 응원을 보냈어요!</>
        )}
      </p>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
        "{notification.storyContent}"
      </p>
    </div>
  </div>
</div>
```

### 자동 읽음 처리
```typescript
const handleOpenChange = (open: boolean) => {
  if (open) {
    // 알림창 열면 모든 알림 읽음 처리
    notifications.forEach((notification) => {
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
    });
  }
  onOpenChange?.(open);
};
```

---

## 👤 프로필 페이지

### 프로필 카드
```tsx
<Card className="p-6 bg-[#ede8dc] border-0">
  <div className="flex items-start gap-4">
    <Avatar className="h-28 w-28 border-0">
      <AvatarImage src={user.avatar} />
      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
        {user.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
    
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl">{user.name}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              편집
            </Button>
          </DialogTrigger>
          {/* 프로필 편집 다이얼로그 */}
        </Dialog>
      </div>
      <p className="text-muted-foreground mt-1">
        {user.city} · {user.ageGroup} {user.occupation}
      </p>
    </div>
  </div>
</Card>
```

### 프로필 편집 다이얼로그
```tsx
<DialogContent className="max-w-md">
  <DialogHeader>
    <DialogTitle>프로필 편집</DialogTitle>
    <DialogDescription>
      닉네임과 프로필 사진을 변경할 수 있습니다.
    </DialogDescription>
  </DialogHeader>
  
  <div className="space-y-4 py-4">
    {/* 닉네임 입력 */}
    <div className="space-y-2">
      <Label htmlFor="nickname">닉네임</Label>
      <Input
        id="nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임을 입력하세요"
        maxLength={20}
      />
      <p className="text-xs text-muted-foreground">{nickname.length}/20자</p>
    </div>
    
    {/* 프로필 사진 URL */}
    <div className="space-y-2">
      <Label htmlFor="avatar">프로필 사진 URL</Label>
      <Input
        id="avatar"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
        type="url"
      />
      <p className="text-xs text-muted-foreground">
        이미지 URL을 입력하거나 비워두면 기본 아바타가 표시됩니다.
      </p>
    </div>
    
    {/* 미리보기 */}
    {avatarUrl && (
      <div className="space-y-2">
        <Label>미리보기</Label>
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 bg-muted">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{nickname}</p>
            <p className="text-sm text-muted-foreground">
              {user.city} · {user.ageGroup} {user.occupation}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
  
  <div className="flex gap-2 justify-end">
    <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
    <Button onClick={handleSave} disabled={!nickname.trim()}>저장</Button>
  </div>
</DialogContent>
```

### 프로필 업데이트 로직
```typescript
const handleUpdateProfile = (nickname: string, avatarUrl: string) => {
  const updatedUser = {
    ...currentUser,
    name: nickname,
    avatar: avatarUrl,
  };
  setCurrentUser(updatedUser);
  
  // 기존 게시글의 사용자 정보도 업데이트
  setStories((prevStories) =>
    prevStories.map((story) =>
      story.userId === currentUser.id
        ? { ...story, userName: nickname, userAvatar: avatarUrl }
        : story
    )
  );
};
```

### 내 게시글 카드 (MyStoryCard)
- StoryCard와 유사하지만 액션 버튼 대신:
  - 좌측: 공감 수 표시 (비활성)
  - 우측: 받은 응원 스티커 개수 버튼
- 버튼 클릭 시 다이얼로그로 받은 스티커 목록 표시
- 익명 표시: "익명의 응원자"

---

## ⚙️ 설정 페이지

### 텍스트 크기 조절
```tsx
<Card>
  <CardHeader>
    <CardTitle>텍스트 크기</CardTitle>
    <CardDescription>
      게시물의 글자 크기를 조절할 수 있습니다.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>글자 크기</Label>
        <span className="text-sm text-muted-foreground">{fontSize}px</span>
      </div>
      <Slider
        value={[fontSize]}
        onValueChange={(value) => onFontSizeChange(value[0])}
        min={14}
        max={22}
        step={1}
        className="w-full"
      />
    </div>

    <div className="pt-4 border-t">
      <p className="text-muted-foreground mb-2">미리보기</p>
      <Card className="p-4 bg-[#f5f3ed] border-[#e8e6e0]">
        <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
          오늘 하루도 고생 많으셨어요. 당신의 이야기를 들려주세요. 
          이곳은 모두가 서로를 이해하고 응원하는 따뜻한 공간입니다.
        </p>
      </Card>
    </div>
  </CardContent>
</Card>
```

### 앱 정보
```tsx
<Card>
  <CardHeader>
    <CardTitle>앱 정보</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">버전</span>
      <span>1.0.0</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">개발자</span>
      <span>무제 팀</span>
    </div>
  </CardContent>
</Card>
```

---

## 📱 하단 네비게이션

### 구조
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-10">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-around py-3">
      {/* 1. 걱정과 불안 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "worry" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("worry")}
      >
        <span className="text-xl">🌧️</span>
      </button>
      
      {/* 2. 감사와 따뜻함 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "grateful" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("grateful")}
      >
        <span className="text-xl">☀️</span>
      </button>

      {/* 3. 공감한 이야기 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "empathy" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("empathy")}
      >
        <Heart className="h-5 w-5" />
      </button>

      {/* 4. 프로필 */}
      <button
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          activeTab === "profile" ? "text-foreground bg-accent" : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("profile")}
      >
        <span className="text-xl">👤</span>
      </button>

      {/* 5. 설정 */}
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

---

## 📊 데이터 타입

### User
```typescript
interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  city: string;
  ageGroup: string;
  occupation: string;
  stickerCount: number;
}
```

### Story
```typescript
interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCity: string;
  userAgeGroup: string;
  userOccupation: string;
  feedType: "worry" | "grateful";
  content: string;
  categories: string[];
  empathyCount: number;
  empathizedBy: string[];
  stickers: { userId: string; message: string; emoji: string }[];
  createdAt: Date;
}
```

### Notification
```typescript
interface Notification {
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
```

---

## 🗂️ 초기 데이터

### 현재 사용자 (currentUser)
```typescript
{
  id: "user-1",
  name: "여행자",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  bio: "",
  city: "서울",
  ageGroup: "20대",
  occupation: "스타트업 직장인",
  stickerCount: 12,
}
```

### 샘플 사용자 3명
```typescript
[
  {
    id: "user-2",
    name: "희망의빛",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    city: "서울",
    ageGroup: "20대",
    occupation: "취업준비생",
    stickerCount: 8,
  },
  {
    id: "user-3",
    name: "바다",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    city: "부산",
    ageGroup: "30대",
    occupation: "프리랜서",
    stickerCount: 12,
  },
  {
    id: "user-4",
    name: "새벽",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    city: "인천",
    ageGroup: "20대",
    occupation: "대학생",
    stickerCount: 15,
  },
]
```

### 초기 알림 2개
```typescript
[
  {
    id: "notif-sample-2",
    type: "sticker",
    fromUserId: "user-2",
    fromUserName: "희망의빛",
    fromUserAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    storyId: "story-0",
    storyContent: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다...",
    stickerEmoji: "💪",
    stickerMessage: "응원합니다!",
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전
    read: false,
  },
  {
    id: "notif-sample-1",
    type: "sticker",
    fromUserId: "user-3",
    fromUserName: "바다",
    fromUserAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    storyId: "story-0",
    storyContent: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다...",
    stickerEmoji: "✨",
    stickerMessage: "할 수 있어요!",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
    read: false,
  },
]
```

---

## 📝 게시글 40개 상세 내용

### Story 0 ~ 9 (최근 게시글)

**story-0** (1시간 전, worry, 현재 사용자)
- 내용: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다. 팀원들의 기대에 부응할 수 있을지, 제대로 해낼 수 있을지 걱정된다. 하지만 최선을 다해보려고 한다."
- 카테고리: 커리어, 직장 생활
- 공감: 15명, user-2가 공감
- 스티커: user-3가 "✨ 할 수 있어요!"

**story-1** (2시간 전, worry, 희망의빛)
- 내용: "오늘 꿈꿔왔던 스타트업에서 세 번째 면접을 봤다. 기술 질문은 잘 대답한 것 같은데, 조직 문화 적합성 부분이 걱정이다. 장기 목표에 대해 물어봤을 때 머릿속이 하얗게 변했다. 다음 주 계획도 못 세우는데 왜 5년 후 계획을 세우는 게 이렇게 어려운 걸까? 또 기다림의 시간이 시작되네..."
- 카테고리: 커리어, 취직
- 공감: 24명
- 스티커: 2개

**story-2** (5시간 전, worry, 바다)
- 내용: "연인과 동거에 대한 '그 대화'를 나눴다. 하고 싶지만 동시에 너무 무섭다. 우리가 맞지 않다는 걸 깨닫게 되면 어쩌지? 내 독립성을 잃으면 어쩌지? 지금 우리가 가진 걸 망치면 어쩌지? 근데 또... 만약 정말 좋으면? 왜 다음 단계로 나아가는 게 절벽에서 뛰어내리는 것처럼 느껴지는 걸까?"
- 카테고리: 연애, 인간 관계
- 공감: 42명, user-1이 공감
- 스티커: user-1이 "🤝 함께 있어요"

**story-3** (8시간 전, worry, 새벽)
- 내용: "오늘 엄마한테서 전화가 왔다. 왜 한 달 동안 집에 안 왔냐고. 집에 갈 때마다 내가 퇴보하는 것 같다는 걸 어떻게 설명해야 할까? 가족을 사랑하지만, 그들의 기대에 짓눌리지 않고 내가 누군지 알아가기 위한 공간이 필요하다. 내 성장을 우선순위에 두는 게 이기적인 걸까?"
- 카테고리: 가족 관계, 우울증
- 공감: 67명, user-1이 공감
- 스티커: 2개

**story-4** (12시간 전, worry, 희망의빛)
- 내용: "오늘 통장 잔고를 확인하고 익숙한 그 침통한 기분을 느꼈다. 돈은 괜찮게 벌고 있는데, 다 어디로 가는 걸까? 매달 진지하게 저축을 시작하겠다고 다짐하지만, 인생이 일어난다. 자동차 수리비, 친구 생일, 나 자신에 대한 '투자'. 재정적 안정이 언제쯤 환상처럼 느껴지지 않을까?"
- 카테고리: 재정, 우울증
- 공감: 53명

**story-5** (18시간 전, grateful, 바다)
- 내용: "오늘 카페에서 작업하고 있었는데, 낯선 분이 커피 한 잔을 사주고 가셨다. '힘내세요'라는 메모와 함께. 별것 아닐 수도 있지만 요즘 힘든 시기를 보내고 있었는데 정말 큰 위로가 됐다. 세상에는 여전히 따뜻한 사람들이 많다는 걸 다시 한번 느꼈다."
- 카테고리: 인간 관계, 건강
- 공감: 38명
- 스티커: user-4가 "🌟 응원해요!"

**story-6** (24시간 전, grateful, 새벽)
- 내용: "지난주에 상담을 시작했다. 첫 세션은 압도적이었지만, 드디어 나 자신을 돌보는 첫 걸음을 뗐다는 게 자랑스럽다. 상담사님이 '용기 있는 선택이었다'고 말씀해주셨을 때 눈물이 났다. 나를 위해 시간과 돈을 투자하는 게 이렇게 의미 있는 일인지 몰랐다."
- 카테고리: 건강, 학업
- 공감: 89명, user-1이 공감
- 스티커: 2개

**story-7** (30시간 전, grateful, 희망의빛)
- 내용: "오늘 엄마가 갑자기 집에 반찬을 가져다주셨다. '요즘 바쁘다며? 잘 챙겨 먹어야지'라고 하시면서. 평소에는 잔소리처럼 느껴졌는데 오늘은 정말 감사했다. 이렇게 나를 신경 써주는 사람이 있다는 게 큰 행운이라는 걸 깨달았다."
- 카테고리: 가족 관계, 건강
- 공감: 45명, user-1이 공감

**story-8** (36시간 전, worry, 바다)
- 내용: "프리랜서 4년차가 됐지만 여전히 불안정함에 익숙해지지 않는다. 이번 달 프로젝트가 끝나면 다음 일감이 있을까? 안정적인 직장으로 돌아가야 하나? 하지만 자유로운 삶이 좋은데... 이 선택이 맞는 건지 계속 고민된다."
- 카테고리: 커리어, 재정
- 공감: 31명, user-2가 공감

**story-9** (40시간 전, worry, 여행자)
- 내용: "회사에서 야근이 일상이 되어버렸다. 팀장님은 '스타트업이니까'라고 하시는데, 내 건강과 삶은 어디로 가는 걸까? 친구들과 약속도 못 잡고, 주말에는 피곤해서 집에서만 있게 된다. 이게 정말 내가 원하던 삶일까?"
- 카테고리: 커리어, 직장 생활, 건강
- 공감: 58명, user-3, user-4가 공감
- 스티커: user-4가 "💪 힘내세요!"

### Story 10 ~ 19

**story-10** (45시간 전, worry, 새벽)
- 내용: "졸업 학년인데 진로가 막막하다. 주변 친구들은 다 취업 준비하거나 대학원 가는데 나는 아직도 뭘 하고 싶은지 모르겠다. 부모님은 빨리 취직하라고 하시는데... 나만 뒤쳐지는 것 같아서 불안하다."
- 카테고리: 학업, 커리어
- 공감: 72명, user-2가 공감
- 스티커: user-2가 "🌱 천천히 가도 괜찮아요"

**story-11** (50시간 전, worry, 희망의빛)
- 내용: "6개월째 취준 중인데 서류에서 계속 떨어진다. 스펙이 부족한 건지, 자소서를 못 쓰는 건지... 친구들은 하나둘 합격 소식 전하는데 나만 제자리인 것 같다. 부모님께 죄송하고 나 자신이 한심하게 느껴진다."
- 카테고리: 취직, 우울증
- 공감: 84명, user-1, user-4가 공감
- 스티커: 2개

**story-12** (55시간 전, grateful, 바다)
- 내용: "프로젝트가 예상보다 일찍 끝나서 오랜만에 해변을 산책했다. 파도 소리를 들으며 걷다 보니 그동안 놓쳤던 것들이 보였다. 푸른 하늘, 따뜻한 햇살, 여유... 일에 치여 살다가 이런 순간을 만끽할 수 있다는 게 감사하다."
- 카테고리: 건강, 인간 관계
- 공감: 41명, user-1이 공감
- 스티커: user-1이 "🌊 힐링되네요"

**story-13** (60시간 전, grateful, 여행자)
- 내용: "팀원이 '요즘 많이 힘들어 보인다'며 조용히 간식을 책상에 놓고 갔다. 말은 없었지만 그 작은 배려가 정말 큰 위로가 됐다. 함께 일하는 사람들이 이렇게 따뜻해서 감사하다."
- 카테고리: 직장 생활, 인간 관계
- 공감: 52명, user-2, user-3이 공감
- 스티커: user-2가 "🤝 좋은 팀이네요!"

**story-14** (65시간 전, worry, 새벽)
- 내용: "SNS를 보다가 또 우울해졌다. 다들 행복해 보이는데 나만 힘든 것 같다. 비교하지 말아야지 하면서도 자꾸 남들과 내 삶을 비교하게 된다. 이런 내가 한심하다."
- 카테고리: 우울증, 인간 관계
- 공감: 95명, user-1, user-2, user-3이 공감
- 스티커: user-3가 "💚 당신도 잘하고 있어요"

**story-15** (70시간 전, grateful, 희망의빛)
- 내용: "스터디 그룹 친구가 면접 준비 도와준다고 밤늦게까지 같이 있어줬다. '우리 같이 합격하자'는 말에 눈물이 날 뻔했다. 혼자가 아니라는 게 이렇게 큰 힘이 되는구나."
- 카테고리: 취직, 인간 관계
- 공감: 68명, user-4가 공감
- 스티커: user-4가 "✨ 좋은 친구네요!"

**story-16** (75시간 전, worry, 바다)
- 내용: "30대 중반인데 아직도 결혼에 대한 압박이 심하다. 명절 때마다 친척들이 '언제 결혼하냐'고 물어보는 게 스트레스다. 나는 지금 혼자여도 행복한데... 왜 결혼을 해야만 완전한 어른이 되는 걸까?"
- 카테고리: 가족 관계, 연애
- 공감: 77명, user-1, user-2가 공감

**story-17** (80시간 전, worry, 여행자)
- 내용: "오늘 실수로 중요한 데이터를 날릴 뻔했다. 다행히 복구했지만 식은땀이 났다. 회사에서 실수하면 안 된다는 압박감에 항상 긴장하고 있다. 완벽해야 한다는 강박이 나를 너무 힘들게 한다."
- 카테고리: 직장 생활, 우울증
- 공감: 46명, user-4가 공감
- 스티커: user-4가 "💚 실수는 누구나 해요"

**story-18** (85시간 전, grateful, 새벽)
- 내용: "교수님께서 과제에 '창의적이고 좋은 접근이었다'는 피드백을 주셨다. 한 달 넘게 고민하고 준비한 프로젝트였는데 인정받은 것 같아서 뿌듯하다. 포기하지 않고 끝까지 해낸 나 자신이 자랑스럽다."
- 카테고리: 학업
- 공감: 55명, user-1, user-2가 공감
- 스티커: 2개

**story-19** (90시간 전, worry, 희망의빛)
- 내용: "집에서 취준하다 보니 하루 종일 아무도 안 만나는 날이 많다. 외롭고 우울하다. 친구들한테 연락하기도 민망하고... 이렇게 사는 게 맞나 싶다."
- 카테고리: 우울증, 인간 관계
- 공감: 61명, user-3이 공감
- 스티커: user-3가 "📱 연락 주세요!"

### Story 20 ~ 29

**story-20** (95시간 전, grateful, 바다)
- 내용: "클라이언트가 '덕분에 프로젝트가 성공적이었다'며 추가 보너스를 주셨다. 예상치 못한 감사 인사와 보상에 일의 보람을 다시 느꼈다. 내 노력을 알아봐 주는 사람이 있다는 게 감사하다."
- 카테고리: 커리어, 재정
- 공감: 44명, user-1, user-4가 공감
- 스티커: user-1이 "🎊 축하드려요!"

**story-21** (100시간 전, worry, 여행자)
- 내용: "주말에도 일 생각이 떠나지 않는다. 쉬면서도 계속 메일 확인하고, 업무 메시지 확인하고... 일과 삶의 경계가 무너진 것 같다. 이대로 가다간 번아웃 올 것 같은데 어떻게 해야 할지 모르겠다."
- 카테고리: 직장 생활, 건강
- 공감: 82명, user-2, user-3이 공감
- 스티커: user-3가 "🌱 휴식도 일이에요"

**story-22** (105시간 전, worry, 새벽)
- 내용: "학자금 대출 상환 생각하면 막막하다. 졸업도 안 했는데 벌써 빚이 천만원이 넘는다. 알바하면서 학교 다니는 게 힘들지만 빚을 더 늘리고 싶지 않다. 왜 공부하는 것도 이렇게 돈이 많이 드는 걸까."
- 카테고리: 재정, 학업
- 공감: 91명, user-2, user-3이 공감
- 스티커: user-2가 "💪 함께 힘내요"

**story-23** (110시간 전, grateful, 희망의빛)
- 내용: "도서관에서 공부하다가 같은 취준생과 이야기를 나눴다. '다 잘 될 거예요'라는 말이 위로가 됐다. 모르는 사람인데도 서로 응원하고 격려하는 게 참 따뜻했다."
- 카테고리: 취직, 인간 관계
- 공감: 36명, user-4가 공감

**story-24** (115시간 전, worry, 바다)
- 내용: "친한 친구가 결혼한다고 한다. 진심으로 축하하지만 동시에 외로움도 느껴진다. 친구들이 하나둘 가정을 꾸리는데 나는 여전히 혼자다. 외롭다고 아무하고나 사귈 수도 없고... 적당한 사람을 만나는 게 왜 이렇게 어려운 걸까."
- 카테고리: 연애, 인간 관계
- 공감: 73명, user-1이 공감
- 스티커: user-1이 "🌟 좋은 사람 만날 거예요"

**story-25** (120시간 전, grateful, 여행자)
- 내용: "오늘 프로젝트 발표가 성공적으로 끝났다. 팀원들과 함께 준비한 게 좋은 결과로 이어져서 뿌듯하다. 고생한 만큼 보상받는 느낌이 좋다. 이런 순간을 위해 힘든 시간을 견디는 거구나."
- 카테고리: 커리어, 직장 생활
- 공감: 49명, user-2, user-4가 공감
- 스티커: user-2가 "🎉 축하해요!"

**story-26** (125시간 전, worry, 새벽)
- 내용: "과 친구들이 다 취업 준비하거나 대학원 준비하는데 나만 방황하는 것 같다. 학점도 좋지 않고, 스펙도 없고... 무엇부터 시작해야 할지 모르겠다. 시간만 가는 것 같아서 불안하다."
- 카테고리: 학업, 커리어
- 공감: 87명, user-2, user-3이 공감
- 스티커: user-3가 "🌱 천천히 시작해봐요"

**story-27** (130시간 전, grateful, 희망의빛)
- 내용: "오늘 드디어 1차 면접 합격 통보를 받았다! 수십 번 떨어지고 나서 받은 합격 소식이라 더 감격스럽다. 포기하지 않길 잘했다. 다음 면접도 잘 준비해야지!"
- 카테고리: 취직, 커리어
- 공감: 102명, user-1, user-3, user-4가 공감
- 스티커: 2개

**story-28** (135시간 전, grateful, 바다)
- 내용: "오랜만에 고향 친구들을 만났다. 각자 다른 길을 걷고 있지만 여전히 서로를 응원하고 격려하는 모습에 감동했다. 변하지 않는 우정이 있다는 게 참 감사하다."
- 카테고리: 인간 관계
- 공감: 57명, user-1, user-4가 공감
- 스티커: user-4가 "🤝 좋은 친구들이네요!"

**story-29** (140시간 전, worry, 여행자)
- 내용: "오늘 상사한테 혼났다. 내 잘못도 있지만 사람들 앞에서 창피를 주는 건 너무한 것 같다. 퇴근하고 나서도 계속 그 장면이 떠올라서 잠을 못 잤다. 회사 가기 싫다."
- 카테고리: 직장 생활, 우울증
- 공감: 79명, user-2, user-3이 공감
- 스티커: user-2가 "💚 힘내세요"

### Story 30 ~ 39 (마지막 10개)

**story-30** (145시간 전, grateful, 새벽)
- 내용: "오늘 처음으로 새벽 운동을 시작했다. 아침 공기가 이렇게 상쾌한지 몰랐다. 작은 변화지만 뭔가 새로운 시작을 하는 것 같아서 기분이 좋다. 꾸준히 해봐야지."
- 카테고리: 건강
- 공감: 43명, user-1, user-3이 공감
- 스티커: user-1이 "💪 멋져요!"

**story-31** (150시간 전, worry, 희망의빛)
- 내용: "부모님께 용돈 받는 게 너무 미안하다. 빨리 취직해서 효도하고 싶은데... 스스로 벌어서 생활하는 친구들을 보면 부럽기도 하고 나 자신이 한심하게 느껴진다."
- 카테고리: 재정, 가족 관계
- 공감: 94명, user-3, user-4가 공감
- 스티커: user-4가 "✨ 곧 좋은 날이 올 거예요"

**story-32** (155시간 전, worry, 바다)
- 내용: "건강검진 결과가 안 좋게 나왔다. 일에만 집중하느라 건강을 소홀히 한 게 후회된다. 이제라도 운동하고 건강 챙겨야 하는데 막상 실천하기가 쉽지 않다."
- 카테고리: 건강
- 공감: 66명, user-1, user-2가 공감
- 스티커: user-1이 "💚 건강 챙기세요!"

**story-33** (160시간 전, grateful, 여행자)
- 내용: "오늘 후배가 '선배님 덕분에 많이 배웠다'고 말해줬다. 나도 배우는 입장인데 누군가에게 도움이 됐다니 뿌듯하다. 서로 배우고 성장하는 관계가 참 좋다."
- 카테고리: 직장 생활, 인간 관계
- 공감: 51명, user-3, user-4가 공감
- 스티커: user-4가 "👏 멋진 선배네요!"

**story-34** (165시간 전, worry, 새벽)
- 내용: "동아리 선배들과 비교당하는 게 힘들다. '작년 선배는 이랬는데 너는 왜 그러냐'는 말을 들으면 자존감이 바닥으로 떨어진다. 내 페이스대로 가면 안 되는 걸까?"
- 카테고리: 학업, 인간 관계
- 공감: 70명, user-2가 공감
- 스티커: user-2가 "🌟 당신만의 길이 있어요"

**story-35** (170시간 전, worry, 희망의빛)
- 내용: "면접에서 또 떨어졌다. '조금 더 경험이 필요하다'는 피드백을 받았는데, 신입인데 어떻게 경험을 쌓으라는 건지 모르겠다. 닭이 먼저냐 달걀이 먼저냐 같은 상황이다."
- 카테고리: 취직, 커리어
- 공감: 88명, user-1, user-4가 공감
- 스티커: user-1이 "💪 포기하지 마세요!"

**story-36** (175시간 전, grateful, 바다)
- 내용: "오늘 오랜만에 가족들과 저녁을 먹었다. 일하느라 바빠서 자주 못 만났는데 함께 시간을 보내니 마음이 따뜻해진다. 가족의 소중함을 다시 느꼈다."
- 카테고리: 가족 관계
- 공감: 62명, user-1, user-2가 공감
- 스티커: user-2가 "💛 따뜻하네요!"

**story-37** (180시간 전, worry, 여행자)
- 내용: "회사 사람들과 어울리는 게 힘들다. 다들 친한데 나만 겉도는 것 같다. 점심시간에도 혼자 먹을 때가 많다. 사회생활이 이렇게 어려운 줄 몰랐다."
- 카테고리: 직장 생활, 인간 관계
- 공감: 75명, user-2, user-4가 공감
- 스티커: user-4가 "🤝 천천히 친해질 거예요"

**story-38** (185시간 전, grateful, 새벽)
- 내용: "교수님께서 추천서를 써주신다고 하셨다. 평소에 열심히 하는 모습을 봐주셨나 보다. 인정받는다는 느낌이 들어서 정말 기쁘다. 더 열심히 해야겠다는 동기부여가 된다."
- 카테고리: 학업
- 공감: 48명, user-1, user-2, user-3이 공감
- 스티커: user-2가 "✨ 멋져요!"

**story-39** (190시간 전, grateful, 희망의빛)
- 내용: "아르바이트하면서 만난 동료가 '언젠가 좋은 회사 다니는 당신을 볼 거예요'라고 말해줬다. 힘든 시기를 겪고 있는데 이런 응원이 정말 큰 힘이 된다. 꼭 그날이 오길 바란다."
- 카테고리: 취직, 인간 관계
- 공감: 69명, user-3, user-4가 공감
- 스티커: 2개

---

## 🛠️ 기술 스택

### 프레임워크 & 라이브러리
- React 18+
- TypeScript
- Tailwind CSS v4.0
- Lucide React (아이콘)
- shadcn/ui 컴포넌트

### 주요 컴포넌트 사용
```typescript
// shadcn/ui 컴포넌트
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";

// Lucide 아이콘
import { 
  Heart, Edit3, Bell, Settings, Sparkles, Clock, 
  Pencil, Gift, Trash2 
} from "lucide-react";
```

---

## 📁 컴포넌트 파일 구조

```
/App.tsx                    // 메인 앱 (라우팅, 상태 관리)
/components/
  ├── Feed.tsx              // 피드 컨테이너 (게시글 목록 + 격려 카드)
  ├── StoryCard.tsx         // 일반 게시글 카드
  ├── MyStoryCard.tsx       // 프로필의 내 게시글 카드
  ├── EncouragementCard.tsx // 격려 카드
  ├── CategoryFilter.tsx    // 카테고리 필터
  ├── CreateStory.tsx       // 게시글 작성 다이얼로그
  ├── StickerPicker.tsx     // 응원 스티커 선택 다이얼로그
  ├── NotificationPanel.tsx // 알림 패널 (Sheet)
  ├── Profile.tsx           // 프로필 페이지
  └── Settings.tsx          // 설정 페이지
/types/
  └── index.ts              // 타입 정의
/utils/
  ├── mockData.ts           // 초기 데이터 (사용자, 게시글)
  └── encouragementMessages.ts // 격려 문구
/styles/
  └── globals.css           // Tailwind 전역 스타일
```

---

## 🎯 주요 상태 관리

### App.tsx의 상태
```typescript
const [stories, setStories] = useState<Story[]>(mockStories);
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState("worry");
const [currentUserData, setCurrentUserData] = useState<User>(currentUser);
const [createStoryOpen, setCreateStoryOpen] = useState(false);
const [notifications, setNotifications] = useState<Notification[]>([...]);
const [fontSize, setFontSize] = useState(16);
```

### 필터링된 데이터
```typescript
// 피드 타입별 필터링
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

// 공감한 게시글
const empathizedStories = stories.filter((story) =>
  story.empathizedBy.includes(currentUserData.id)
);
```

---

## ✅ 체크리스트

이 프롬프트대로 구현하면 다음이 모두 완성됩니다:

- ✅ 종이책 느낌의 따뜻한 미색 디자인
- ✅ 5개 탭 시스템 (걱정, 감사, 공감, 프로필, 설정)
- ✅ 40개의 현실적인 게시글 (worry/grateful 분류)
- ✅ 카테고리 필터 (16개 + 전체, 복수 선택)
- ✅ 8개마다 격려 카드 삽입 (5개 문구 순환)
- ✅ 공감 기능 (토글, 알림 전송)
- ✅ 응원 스티커 시스템 (6종, 개수 관리, 알림)
- ✅ 실시간 알림 패널 (Sheet, 자동 읽음 처리)
- ✅ 프로필 편집 (닉네임, 아바타, 실시간 미리보기)
- ✅ 텍스트 크기 조절 (14~22px, 실시간 미리보기)
- ✅ 시간 표시 (한국어, 상대 시간)
- ✅ 반응형 디자인 (모바일 최적화)
- ✅ Floating 글쓰기 버튼
- ✅ 하단 네비게이션
- ✅ Sticky 헤더
- ✅ 모든 한국어 UI

---

이 상세한 프롬프트를 AI에게 제공하면 "무제" 앱을 완벽하게 재현할 수 있습니다!
