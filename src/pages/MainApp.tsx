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
import { supabase } from "@/lib/supabase";

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
    fetchUserProfile();
    fetchStories();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // Should handle auth redirect ideally, but Login page handles it.

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (profile) {
        setCurrentUserData(prev => ({
            ...prev,
            id: profile.id,
            name: profile.nickname || "여행자",
            city: profile.city || "어딘가",
            ageGroup: profile.age_group || "알 수 없음",
            occupation: profile.occupation || "자유인",
            // gender and others if needed
        }));
    }
  };

  const fetchStories = async () => {
    // Join with profiles to get author details
    // Note: This requires foreign key setup properly.
    const { data, error } = await supabase
        .from('stories')
        .select(`
            *,
            profiles (
                nickname,
                city,
                age_group,
                occupation,
                id,
                gender,
                is_gender_public,
                is_location_detailed
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching stories:", error);
        return;
    }

    if (data) {
        const loadedStories: Story[] = data.map((item: any) => {
            // Handle profile data safely (Supabase can return object or array depending on relation detection)
            const profileData = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
            
            // Logic for city display
            let displayCity = "";
            // is_location_detailed (repurposed as is_location_public based on user request)
            // If true (Public): Show Big Region (Do/Si) only
            // If false (Private): Show Nothing
            if (profileData?.is_location_detailed === true) {
                 const originalCity = profileData.city || "";
                 displayCity = originalCity.split(" ")[0];
            } else if (profileData?.is_location_detailed === undefined) {
                 // Fallback for old records without the flag: default to Public (Big Region)
                 const originalCity = profileData?.city || "";
                 displayCity = originalCity.split(" ")[0];
            }

            return {
                id: item.id,
                userId: item.user_id,
                userName: profileData?.nickname || "알 수 없음",
                userAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=" + (profileData?.nickname || "unknown"),
                userCity: displayCity,
                userAgeGroup: profileData?.age_group || "",
                userOccupation: profileData?.occupation || "",
                userGender: profileData?.is_gender_public ? profileData?.gender : undefined, // Only show if public
                feedType: item.feed_type as "worry" | "grateful",
                content: item.content,
                categories: item.categories || [],
                empathyCount: item.empathy_count || 0,
                empathizedBy: [], 
                stickers: [], 
                createdAt: new Date(item.created_at),
            };
        });
        setStories(loadedStories);
    }
  };

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const handleCreateStory = async (content: string, categories: string[], feedType: "worry" | "grateful") => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newStory: Story = {
      id: tempId,
      userId: currentUserData.id,
      userName: currentUserData.name,
      userAvatar: currentUserData.avatar,
      userCity: currentUserData.city,
      userAgeGroup: currentUserData.ageGroup,
      userOccupation: currentUserData.occupation,
      // We don't have isGenderPublic in currentUserData yet, need to fetch or store. 
      // For optimistic update, we might miss it or can assume from loaded profile?
      // Let's Skip adding gender for optimistic update or add simple one if we had it.
      // But actually currentUserData needs update too.
      // Ideally currentUserData should have gender and isGenderPublic.
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

    // Save to Supabase
    const { error } = await supabase.from('stories').insert({
        user_id: currentUserData.id,
        content,
        feed_type: feedType,
        categories: feedType === "worry" ? categories : [],
        empathy_count: 0
    });

    if (error) {
        console.error("Error creating story:", error);
        // Revert or show error
        alert("글 작성에 실패했습니다.");
        setStories(prev => prev.filter(s => s.id !== tempId));
    } else {
        // Fetch fresh to get real ID and consistent state
        fetchStories();
    }
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

  const handleUpdateProfile = async (name: string, avatar: string) => {
    // 1. Optimistic Update (UI 즉시 반영)
    setCurrentUserData(prev => ({ ...prev, name, avatar }));
    setStories(prev => prev.map(s => 
        s.userId === currentUserData.id ? { ...s, userName: name, userAvatar: avatar } : s
    ));

    // 2. Supabase DB Update
    // 주의: 현재 avatar 컬럼은 DB에 없으므로 nickname만 저장합니다.
    const { error } = await supabase
        .from('profiles')
        .update({ nickname: name })
        .eq('id', currentUserData.id);

    if (error) {
        console.error("Failed to update profile nickname:", error);
        alert("닉네임 변경 저장 실패");
    }
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
