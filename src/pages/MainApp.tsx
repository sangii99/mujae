import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { Heart, Edit3, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Feed } from "../components/Feed";
import { CreateStory } from "../components/CreateStory";
import empathyIcon from "../assets/1cf87df5e848e0368281bc2ddabccc0ba1ece188.png";
import { Story, User, Notification, Report } from "../types";
import { CategoryFilter } from "../components/CategoryFilter";
import { NotificationPanel } from "../components/NotificationPanel";
import { Profile } from "../components/Profile";
import { Settings } from "../components/Settings";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
const defaultUser: User = {
  id: "",
  name: "로딩중...",
  avatar: "",
  bio: "",
  city: "",
  ageGroup: "",
  occupation: "",
  stickerCount: 0,
};

export default function MainApp() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("worry");
  const [currentUserData, setCurrentUserData] = useState<User>(defaultUser);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [hiddenStoryIds, setHiddenStoryIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // 필수 정보(닉네임)만 있으면 접속 허용. birth_date 체크 제거
        const hasRequiredProfile = !!profile.nickname;

        if (hasRequiredProfile) {
          setCurrentUserData({
            id: session.user.id,
            name: profile.nickname || "익명",
            ageGroup: profile.age_group || "",
            // 지역 정보 깨짐 방지: DB에 'NULL'이나 이상한 값이 있을 경우 대비
            city: profile.city || "", 
            occupation: profile.occupation || "",
            stickerCount: 5, 
            avatar: "", 
            bio: "",
            birthDate: profile.birth_date,
            nicknameChangeCount: profile.nickname_change_count || 0,
            showAgeGroup: profile.is_age_group_public !== false,
            showCity: profile.is_city_public !== false,
            showOccupation: profile.is_occupation_public !== false,
          });

          fetchStories(session.user.id);
        } else {
          // 닉네임조차 없다면 가입이 덜 된 것으로 판단
          navigate("/profile-setup");
        }
      } else {
        navigate("/profile-setup");
      }
    };
    fetchUser();
  }, [navigate]);

  // 2. Fetch Stories
  const fetchStories = async (currentUserId: string = currentUserData.id) => {
    try {
      setLoading(true);
      // Fetch Stories with Profile info
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *, 
          profiles:user_id (
            nickname, 
            age_group, 
            city, 
            occupation
          )
        `)
        .order('created_at', { ascending: false });

        if (error) {
           console.error("Supabase Error:", error);
           throw error;
        }

        if (storiesData) {
          console.log("Stories fetched:", storiesData.length);
        }

      if (storiesData) {
        // Fetch Empathies (My Likes)
        const storyIds = storiesData.map(s => s.id);
        
        const { data: myEmpathies } = await supabase
          .from('story_empathies')
          .select('story_id')
          .eq('user_id', currentUserId);
        
        const myEmpathizedStoryIds = new Set((myEmpathies || []).map((e: any) => e.story_id));

        // Fetch Stickers
        const { data: stickersData } = await supabase
          .from('story_stickers')
          .select('*')
          .in('story_id', storyIds);
          
        const stickersMap: Record<string, any[]> = {};
        if (stickersData) {
            stickersData.forEach(sticker => {
            if (!stickersMap[sticker.story_id]) stickersMap[sticker.story_id] = [];
            stickersMap[sticker.story_id].push(sticker);
            });
        }

        // Map to Frontend Model
        const mappedStories: Story[] = storiesData.map((item: any) => {
          // Allow profiles to be an array (if one-to-many is inferred) or object (if many-to-one is inferred)
          const rawProfile = item.profiles;
          const profileData = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile; 

          // Visibility is determined by the *story snapshot* settings (stored in stories table)
          const showAgeGroup = item.show_age_group !== false;
          const showCity = item.show_city !== false;
          const showOccupation = item.show_occupation !== false;
          
          return {
            id: item.id,
            userId: item.user_id,
            userName: profileData?.nickname || "익명",
            userAvatar: "", 
            // If visibility is hidden, we set the string to "" or "비공개"
            userCity: (showCity) ? (profileData?.city || "알 수 없음") : "비공개",
            userAgeGroup: (showAgeGroup) ? (profileData?.age_group || "") : "비공개",
            userOccupation: (showOccupation) ? (profileData?.occupation || "") : "비공개",
            
            // Pass the visibility flags explicitly so the UI can decide to hide the text completely
            showCity,
            showAgeGroup,
            showOccupation,

            feedType: item.feed_type as "worry" | "grateful",
            content: item.content,
            categories: item.categories || [],
            empathyCount: item.empathy_count || 0, 
            empathizedBy: myEmpathizedStoryIds.has(item.id) ? [currentUserId] : [],
            stickers: stickersMap[item.id]?.map((s: any) => ({ userId: s.sender_id, message: s.message, emoji: s.emoji })) || [],
            createdAt: new Date(item.created_at),
            isPublic: item.is_public ?? true
          };
        });
        setStories(mappedStories);
      } else {
        // If stories is null or empty
        setStories([]);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (content: string, categories: string[], feedType: "worry" | "grateful", isPublic: boolean = true) => {
    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUserData.id,
          content: content,
          categories: categories,
          feed_type: feedType,
          is_public: isPublic,
          empathy_count: 0,
          sticker_count: 0,
          // Snapshot current visibility settings
          show_age_group: currentUserData.showAgeGroup,
          show_city: currentUserData.showCity,
          show_occupation: currentUserData.showOccupation
        });

      if (error) throw error;

      fetchStories(currentUserData.id);
      setCreateStoryOpen(false);
      setToastMessage("이야기가 성공적으로 등록되었습니다.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Error creating story:", err);
      // More specific error message if possible, but keep it simple
      setToastMessage("스토리 작성 중 오류가 발생했습니다.");
      setTimeout(() => setToastMessage(null), 3000); 
    }
  };

  const handleEmpathize = async (storyId: string) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      const isEmpathized = story.empathizedBy.includes(currentUserData.id);

      // Optimistic UI Update
      setStories(prev => prev.map(s => {
         if (s.id === storyId) {
           return {
             ...s,
             empathyCount: isEmpathized ? Math.max(0, s.empathyCount - 1) : s.empathyCount + 1,
             empathizedBy: isEmpathized 
               ? s.empathizedBy.filter(id => id !== currentUserData.id)
               : [...s.empathizedBy, currentUserData.id]
           };
         }
         return s;
      }));

      if (isEmpathized) {
        // Un-empathize
        await supabase.from('story_empathies').delete().match({ story_id: storyId, user_id: currentUserData.id });
        // Assume trigger handles empathy_count or ignore for now, rely on refetch eventually
      } else {
        // Empathize
        await supabase.from('story_empathies').insert({ story_id: storyId, user_id: currentUserData.id });
      }
    } catch (err) {
      console.error("Error toggling empathy:", err);
      fetchStories(currentUserData.id); // Revert on error
    }
  };

  const handleSendSticker = async (storyId: string, emoji: string, message: string) => {
    try {
      // Optimistic Update? Keep it simple for now, just insert and refetch
      const { error } = await supabase
        .from('story_stickers')
        .insert({
          story_id: storyId,
          sender_id: currentUserData.id,
          emoji,
          message
        });

      if (error) throw error;
      
      // Update Local State for UI feedback
      setStories(prev => prev.map(s => {
        if (s.id === storyId) {
          return {
            ...s,
            stickers: [...s.stickers, { userId: currentUserData.id, emoji, message }]
          };
        }
        return s;
      }));
       setToastMessage("스티커를 보냈습니다!");
       setTimeout(() => setToastMessage(null), 3000);
      
    } catch (err) {
      console.error("Error sending sticker:", err);
      setToastMessage("스티커 전송 실패");
    }
  };

  const handleUpdateProfile = async (nickname: string, ageGroup: string, occupation: string) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                nickname, 
                age_group: ageGroup, 
                occupation,
                updated_at: new Date()
            })
            .eq('id', currentUserData.id);

        if (error) throw error;

        setCurrentUserData(prev => ({
            ...prev,
            name: nickname,
            ageGroup,
            occupation
        }));
    } catch(err) {
        console.error("Error updating profile", err);
    }
  };
  
  const handleUpdateVisibility = async (field: 'ageGroup' | 'city' | 'occupation', value: boolean) => {
    try {
        const dbField = field === 'ageGroup' ? 'is_age_group_public' : 
                        field === 'city' ? 'is_city_public' : 'is_occupation_public';
        
        const { error } = await supabase
            .from('profiles')
            .update({ [dbField]: value })
            .eq('id', currentUserData.id);

        if (error) throw error;

        setCurrentUserData(prev => ({
            ...prev,
            [`show${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
        }));
    } catch(err) {
        console.error("Error updating visibility", err);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setCreateStoryOpen(true);
  };

  const handleUpdateStory = async (storyId: string, content: string, categories: string[]) => {
    try {
        const { error } = await supabase
            .from('stories')
            .update({ content, categories, updated_at: new Date() })
            .eq('id', storyId);

        if (error) throw error;

        setStories(prev => prev.map(s => s.id === storyId ? { ...s, content, categories } : s));
        setEditingStory(null);
        setCreateStoryOpen(false);
    } catch (err) {
        console.error("Error updating story", err);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if(!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
        const { error } = await supabase.from('stories').delete().eq('id', storyId);
        if (error) throw error;
        setStories(prev => prev.filter(s => s.id !== storyId));
    } catch(err) {
        console.error("Error deleting story", err);
    }
  };

  const handleReportStory = async (storyId: string, reason: string, details?: string) => {
    try {
        const { error } = await supabase.from('reports').insert({
            report_type: 'story',
            reported_item_id: storyId,
            reported_by: currentUserData.id,
            reason,
            details,
            status: 'pending'
        });
        if (error) throw error;
        setToastMessage("신고가 접수되었습니다.");
        setTimeout(() => setToastMessage(null), 3000);
    } catch(err) {
        console.error("Error reporting story", err);
        setToastMessage("신고 접수 중 오류가 발생했습니다.");
    }
  };

  const handleReportUser = async (userId: string, userName: string, reason: string, details?: string) => {
     try {
        const { error } = await supabase.from('reports').insert({
            report_type: 'user',
            reported_item_id: userId,
            reported_by: currentUserData.id,
            reason,
            details,
            status: 'pending'
        });
        if (error) throw error;
        setToastMessage("유저 신고가 접수되었습니다.");
        setTimeout(() => setToastMessage(null), 3000);
    } catch(err) {
        console.error("Error reporting user", err);
        setToastMessage("신고 접수 중 오류가 발생했습니다.");
    }
  };

  const handleHideStory = (storyId: string) => {
    setHiddenStoryIds((prev) => [...prev, storyId]);
    setToastMessage("해당 게시글이 가려졌습니다.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUnhideStory = (storyId: string) => {
    setHiddenStoryIds((prev) => prev.filter((id) => id !== storyId));
  };

  const handleBlockUser = (userId: string) => {
    setBlockedUserIds((prev) => [...prev, userId]);
    setToastMessage("해당 유저와 유저의 게시글들이 차단되었습니다.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUnblockUser = (userId: string) => {
    setBlockedUserIds((prev) => prev.filter((id) => id !== userId));
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
    const feedStories = stories
      .filter((story) => story.feedType === feedType)
      .filter((story) => !hiddenStoryIds.includes(story.id))
      .filter((story) => !blockedUserIds.includes(story.userId));
    return selectedCategories.length === 0
      ? feedStories
      : feedStories.filter((story) =>
          story.categories.some((cat) => selectedCategories.includes(cat))
        );
  };

  const worryStories = filterStoriesByFeedType("worry");
  const gratefulStories = filterStoriesByFeedType("grateful");

  const empathizedStories = stories
    .filter((story) => story.empathizedBy.includes(currentUserData.id))
    .filter((story) => !hiddenStoryIds.includes(story.id))
    .filter((story) => !blockedUserIds.includes(story.userId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc]">
      {/* Header */}
      <header className="border-b sticky top-0 z-10" style={{
        background: `linear-gradient(to bottom, 
          rgba(255, 255, 255, 0.05), 
          rgba(255, 255, 255, 0.01))`,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
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
                fontWeight={fontWeight}
                onStickerPickerOpenChange={setIsStickerPickerOpen}
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
                onReport={handleReportStory}
                onHide={handleHideStory}
                onBlockUser={handleBlockUser}
                onReportUser={handleReportUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="grateful" className="space-y-6">
            <div className="fixed inset-0 flex flex-col" style={{ top: '73px', bottom: '73px' }}>
              <div className="flex-shrink-0 px-4 pt-6 pb-4 max-w-4xl mx-auto w-full">
                <div>
                  <h2 className="text-2xl font-medium mb-2">💛 감사와 따뜻함</h2>
                  <p className="text-muted-foreground">
                    따뜻했던 순간을 나누세요. 당신의 이야기가 누군가에게 힘이 돼요.
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden px-4 max-w-4xl mx-auto w-full">
                <Feed
                  stories={gratefulStories}
                  onEmpathize={handleEmpathize}
                  onSendSticker={handleSendSticker}
                  currentUserId={currentUserData.id}
                  currentUserStickerCount={currentUserData.stickerCount}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fullScreenMode={true}
                  onEdit={handleEditStory}
                  onDelete={handleDeleteStory}
                  onReport={handleReportStory}
                  onHide={handleHideStory}
                  onBlockUser={handleBlockUser}
                  onReportUser={handleReportUser}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="empathy" className="space-y-6">
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
                <Feed
                  stories={empathizedStories}
                  onEmpathize={handleEmpathize}
                  onSendSticker={handleSendSticker}
                  currentUserId={currentUserData.id}
                  currentUserStickerCount={currentUserData.stickerCount}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
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
                onUpdateVisibility={handleUpdateVisibility}
                fontSize={fontSize}
                fontWeight={fontWeight}
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Settings
                user={currentUserData}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                fontWeight={fontWeight}
                onFontWeightChange={setFontWeight}
                blockedUserIds={blockedUserIds}
                onUnblockUser={handleUnblockUser}
                hiddenStoryIds={hiddenStoryIds}
                onUnhideStory={handleUnhideStory}
                stories={stories}
                onUpdateVisibility={handleUpdateVisibility}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      {!isStickerPickerOpen && (
        <Button
          size="lg"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20"
          onClick={() => setCreateStoryOpen(true)}
        >
          <Edit3 className="h-6 w-6" />
        </Button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-[60]" style={{
        background: `linear-gradient(to top, 
          rgba(255, 255, 255, 0.05), 
          rgba(255, 255, 255, 0.01))`,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "worry" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("worry")}
            >
              <span className="text-xl">😢</span>
            </button>
            
            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "grateful" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("grateful")}
            >
              <span className="text-xl">💛</span>
            </button>

            <button
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "empathy" ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("empathy")}
            >
              <img 
                src={empathyIcon} 
                alt="공감" 
                className="h-5 w-5"
              />
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
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Create Story Dialog */}
      <CreateStory 
        onCreateStory={handleCreateStory}
        open={createStoryOpen}
        onOpenChange={(open) => {
          setCreateStoryOpen(open);
          if (!open) {
            setEditingStory(null);
          }
        }}
        currentTab={activeTab}
        editingStory={editingStory}
        onUpdateStory={handleUpdateStory}
      />

      {/* Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-[#f5f3ed] text-[#0c0c14] border border-[#e8e6e0] rounded-lg shadow-lg max-w-md text-center"
            style={{
              backdropFilter: 'blur(8px)'
            }}
          >
            <p className="text-sm font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
