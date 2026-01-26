import { useState } from "react";
import { Heart, Edit3, Bell, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Feed } from "./components/Feed";
import { CreateStory } from "./components/CreateStory";
import { CategoryFilter } from "./components/CategoryFilter";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { NotificationPanel } from "./components/NotificationPanel";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Story, User, Notification } from "./types";
import { mockStories, currentUser } from "./utils/mockData";

export default function App() {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("worry");
  const [currentUserData, setCurrentUserData] = useState<User>(currentUser);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-sample-2",
      type: "sticker",
      fromUserId: "user-2",
      fromUserName: "희망의빛",
      fromUserAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      storyId: "story-0",
      storyContent: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다. 팀원들의 기대에 부응할 수 있을지, 제대로 해낼 수 있을지 걱정된다. 하지만 최선을 다해보려고 한다.",
      stickerEmoji: "💪",
      stickerMessage: "응원합니다!",
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
    },
    {
      id: "notif-sample-1",
      type: "sticker",
      fromUserId: "user-3",
      fromUserName: "바다",
      fromUserAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
      storyId: "story-0",
      storyContent: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다. 팀원들의 기대에 부응할 수 있을지, 제대로 해낼 수 있을지 걱정된다. 하지만 최선을 다해보려고 한다.",
      stickerEmoji: "✨",
      stickerMessage: "할 수 있어요!",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
  ]);
  const [fontSize, setFontSize] = useState(16);

  const handleCreateStory = (content: string, categories: string[], feedType: "worry" | "grateful") => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUserData.id,
      userName: currentUserData.name,
      userAvatar: currentUserData.avatar,
      userCity: currentUserData.city,
      userAgeGroup: currentUserData.ageGroup,
      userOccupation: currentUserData.occupation,
      feedType,
      content,
      categories,
      empathyCount: 0,
      empathizedBy: [],
      stickers: [],
      createdAt: new Date(),
    };
    setStories([newStory, ...stories]);
    setCreateStoryOpen(false);
  };

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

  const empathizedStories = stories.filter((story) =>
    story.empathizedBy.includes(currentUserData.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc]">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <TooltipProvider>
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
            </TooltipProvider>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-current" />
              <h1 className="text-xl font-semibold">무제</h1>
            </div>
            <NotificationPanel
              notifications={notifications}
              onMarkAsRead={(id) => {
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
              }}
              onClearAll={() => setNotifications([])}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="worry" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-medium mb-2">😢 걱정과 불안</h2>
                <p className="text-muted-foreground">
                  당신의 걱정을 나누세요. 당신만 그런 게 아니에요.
                </p>
              </div>
              <CategoryFilter
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
              />
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

          <TabsContent value="grateful" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-medium mb-2">💛 감사와 따뜻함</h2>
                <p className="text-muted-foreground">
                  따뜻했던 순간을 나누세요. 당신의 이야기가 누군가에게는 힘이 돼요.
                </p>
              </div>
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

          <TabsContent value="empathy" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-medium mb-2">공감한 이야기</h2>
                <p className="text-muted-foreground">
                  당이 공감한 이야기들 - 당신만 그런 게 아니에요.
                </p>
              </div>
              {empathizedStories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>아직 공감한 이야기가 없습니다.</p>
                  <p className="text-sm mt-2">탐색을 시작하고 다른 사람들과 연결되어 보세요!</p>
                </div>
              ) : (
                <Feed
                  stories={empathizedStories}
                  onEmpathize={handleEmpathize}
                  onSendSticker={handleSendSticker}
                  currentUserId={currentUserData.id}
                  currentUserStickerCount={currentUserData.stickerCount}
                  fontSize={fontSize}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Profile
                user={currentUserData}
                stories={stories}
                onUpdateProfile={handleUpdateProfile}
                fontSize={fontSize}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
        onClick={() => setCreateStoryOpen(true)}
      >
        <Edit3 className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "worry" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("worry")}
            >
              <span className="text-xl">🌧️</span>
            </button>
            
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "grateful" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("grateful")}
            >
              <span className="text-xl">☀️</span>
            </button>

            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "empathy" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("empathy")}
            >
              <Heart className="h-5 w-5" />
            </button>

            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "profile" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <span className="text-xl">👤</span>
            </button>

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

      {/* Create Story Dialog */}
      <CreateStory 
        onCreateStory={handleCreateStory}
        open={createStoryOpen}
        onOpenChange={setCreateStoryOpen}
        currentTab={activeTab}
      />
    </div>
  );
}