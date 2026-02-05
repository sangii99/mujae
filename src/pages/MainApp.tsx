import React, { useState, useEffect } from "react";
import { Story, User, Notification, AVAILABLE_CATEGORIES } from "@/types";
import { mockStories, currentUser } from "@/utils/mockData";
import { Feed } from "@/components/Feed";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CreateStory } from "@/components/CreateStory";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Profile } from "@/components/Profile";
import { Settings } from "@/components/Settings";
import { Button } from "@/components/ui/button";
import { Heart, Edit3, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Need Tooltip

// Tooltip dummy if I don't implement it fully or simple implementation
// I'll make a simple Tooltip wrapper inline or import if I made it. I didn't. I'll make it.

export const MainApp: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("worry");
  const [currentUserData, setCurrentUserData] = useState<User>(currentUser);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false); // For sticker count tooltip

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setCurrentUserData(prev => ({
        ...prev,
        ageGroup: profile.ageGroup,
        city: profile.city,
        occupation: profile.occupation,
        gender: profile.gender // Assuming gender is in User type or ignored? User type doesn't have gender but profile setup has. I'll ignore for now or add to type if needed. Prompt type def doesn't have gender.
      }));
    }
  }, []);

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

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
      categories: feedType === "worry" ? categories : [],
      empathyCount: 0,
      empathizedBy: [],
      stickers: [],
      createdAt: new Date(),
    };
    setStories([newStory, ...stories]);
    setCreateStoryOpen(false);
  };

  const handleEmpathize = (storyId: string) => {
    setStories(prevStories =>
      prevStories.map(story => {
        if (story.id === storyId) {
          const hasEmpathized = story.empathizedBy.includes(currentUserData.id);
          
          if (!hasEmpathized && story.userId !== currentUserData.id) {
            const newNotification: Notification = {
              id: `notif-${Date.now()}`,
              type: "empathy",
              fromUserId: currentUserData.id,
              fromUserName: currentUserData.name,
              fromUserAvatar: currentUserData.avatar,
              storyId: story.id,
              storyContent: story.content.substring(0, 30) + "...",
              createdAt: new Date(),
              read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
          
          return {
            ...story,
            empathyCount: hasEmpathized
              ? story.empathyCount - 1
              : story.empathyCount + 1,
            empathizedBy: hasEmpathized
              ? story.empathizedBy.filter(id => id !== currentUserData.id)
              : [...story.empathizedBy, currentUserData.id],
          };
        }
        return story;
      })
    );
  };

  const handleSendSticker = (storyId: string, emoji: string, message: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    // Logic: if sending to others, decrease count. If to self (simulation), increase count.
    const isSelf = story.userId === currentUserData.id;

    if (isSelf) {
        setCurrentUserData(prev => ({
            ...prev,
            stickerCount: prev.stickerCount + 1,
        }));
        // Notify self (simulation)
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: "sticker",
            fromUserId: "anonymous",
            fromUserName: "익명의 친구",
            fromUserAvatar: "", 
            storyId: story.id,
            storyContent: story.content.substring(0, 30) + "...",
            stickerEmoji: emoji,
            stickerMessage: message,
            createdAt: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);

    } else {
        setCurrentUserData(prev => ({
            ...prev,
            stickerCount: prev.stickerCount - 1,
        }));
        // In real app, we'd notify the author. Here we just update local story stickers
        setStories(prev => prev.map(s => {
            if (s.id === storyId) {
                return {
                    ...s,
                    stickers: [...s.stickers, { userId: currentUserData.id, emoji, message }]
                };
            }
            return s;
        }));
    }
  };

  const handleUpdateProfile = (name: string, avatar: string) => {
    setCurrentUserData(prev => ({ ...prev, name, avatar }));
    setStories(prev => prev.map(s => 
        s.userId === currentUserData.id ? { ...s, userName: name, userAvatar: avatar } : s
    ));
  };

  const filteredStories = stories.filter(story => {
    if (activeTab === "empathy") {
        return story.empathizedBy.includes(currentUserData.id);
    }
    if (activeTab === "profile" || activeTab === "settings") return false; // Handled by conditional render
    
    // Filter by tab type logic
    // Prompt says: 
    // worry tab -> feedType="worry"
    // grateful tab -> feedType="grateful"
    // Also category filter applies to worry tab
    if (activeTab === "worry") {
        if (story.feedType !== "worry") return false;
        if (selectedCategories.length === 0) return true;
        return story.categories.some(cat => selectedCategories.includes(cat));
    }
    if (activeTab === "grateful") {
        return story.feedType === "grateful";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf8f3]/95 backdrop-blur border-b border-[#e8e6e0] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           {/* Sticker Count Tooltip */}
           <div className="relative group cursor-pointer" onClick={() => setIsTooltipOpen(!isTooltipOpen)}>
              <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                 <span>🌟</span> {currentUserData.stickerCount}
              </div>
              {/* Tooltip implementation inline for simplicity or use tooltip component */}
              <div className="absolute top-full left-0 mt-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  보유한 응원 스티커
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-1">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <span className="font-serif text-xl font-bold">무제</span>
        </div>

        <NotificationPanel 
            notifications={notifications} 
            onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
            onClearAll={() => setNotifications([])}
        />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-4 pb-24">
         {activeTab === "worry" && (
            <div className="space-y-4">
                <div className="text-center py-4">
                    <h2 className="text-2xl font-medium">😢 걱정과 불안</h2>
                    <p className="text-muted-foreground">당신의 걱정을 나누세요. 당신만 그런 게 아니에요.</p>
                </div>
                <CategoryFilter 
                    selectedCategories={selectedCategories}
                    onToggleCategory={handleToggleCategory}
                    onClearCategories={() => setSelectedCategories([])}
                />
                <Feed 
                    stories={filteredStories}
                    currentUserId={currentUserData.id}
                    fontSize={fontSize}
                    onEmpathize={handleEmpathize}
                    onSendSticker={handleSendSticker}
                    onStickerPickerOpenChange={setIsStickerPickerOpen}
                />
            </div>
         )}
         
         {activeTab === "grateful" && (
            <div className="space-y-4">
                <div className="text-center py-4">
                    <h2 className="text-2xl font-medium">💛 감사와 따뜻함</h2>
                    <p className="text-muted-foreground">따뜻했던 순간을 나누세요. 당신의 이야기가 누군가에게는 힘이 돼요.</p>
                </div>
                <Feed 
                    stories={filteredStories}
                    currentUserId={currentUserData.id}
                    fontSize={fontSize}
                    onEmpathize={handleEmpathize}
                    onSendSticker={handleSendSticker}
                    onStickerPickerOpenChange={setIsStickerPickerOpen}
                />
            </div>
         )}

         {activeTab === "empathy" && (
            <div className="space-y-4">
                <div className="text-center py-4">
                    <h2 className="text-2xl font-medium">공감한 이야기</h2>
                </div>
                 <Feed 
                    stories={filteredStories}
                    currentUserId={currentUserData.id}
                    fontSize={fontSize}
                    onEmpathize={handleEmpathize}
                    onSendSticker={handleSendSticker}
                    onStickerPickerOpenChange={setIsStickerPickerOpen}
                />
            </div>
         )}

         {activeTab === "profile" && (
            <Profile 
                currentUser={currentUserData}
                stories={stories}
                onUpdateProfile={handleUpdateProfile}
            />
         )}

         {activeTab === "settings" && (
            <Settings 
                currentUser={currentUserData}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
            />
         )}
      </main>

      {/* Floating Action Button */}
      {/* Hide when sticker picker is open */}
      {!isStickerPickerOpen && activeTab !== "settings" && activeTab !== "profile" && (
          <Button 
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-20 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateStoryOpen(true)}
          >
            <Edit3 className="h-6 w-6" />
          </Button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t z-[60]">
        <div className="flex items-center justify-around py-2">
            <button 
                onClick={() => setActiveTab("worry")}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors", activeTab === "worry" ? "text-foreground" : "text-muted-foreground")}
            >
                <span className="text-xl">🌧️</span>
                <span className="text-[10px]">걱정</span>
            </button>
            <button 
                onClick={() => setActiveTab("grateful")}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors", activeTab === "grateful" ? "text-foreground" : "text-muted-foreground")}
            >
                <span className="text-xl">☀️</span>
                <span className="text-[10px]">감사</span>
            </button>
            <button 
                onClick={() => setActiveTab("empathy")}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors", activeTab === "empathy" ? "text-red-500" : "text-muted-foreground")}
            >
                <Heart className={cn("h-5 w-5", activeTab === "empathy" ? "fill-current" : "")} />
                <span className="text-[10px]">공감</span>
            </button>
            <button 
                onClick={() => setActiveTab("profile")}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors", activeTab === "profile" ? "text-foreground" : "text-muted-foreground")}
            >
                <span className="text-xl">👤</span>
                <span className="text-[10px]">프로필</span>
            </button>
            <button 
                onClick={() => setActiveTab("settings")}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors", activeTab === "settings" ? "text-foreground" : "text-muted-foreground")}
            >
                <SettingsIcon className="h-5 w-5" />
                <span className="text-[10px]">설정</span>
            </button>
        </div>
      </nav>

      <CreateStory 
        open={createStoryOpen} 
        onOpenChange={setCreateStoryOpen}
        onCreate={handleCreateStory}
      />
    </div>
  );
};
