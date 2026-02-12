import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Heart, Edit3, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Feed } from "../components/Feed";
import { CreateStory } from "../components/CreateStory";
import empathyIcon from "../assets/1cf87df5e848e0368281bc2ddabccc0ba1ece188.png";
import { Story, User, Notification } from "../types";
import { mockStories, currentUser } from "../utils/mockData";
import { CategoryFilter } from "../components/CategoryFilter";
import { NotificationPanel } from "../components/NotificationPanel";
import { Profile } from "../components/Profile";
import { Settings } from "../components/Settings";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { supabase } from "../lib/supabase";

export default function MainApp() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("worry");
  const [currentUserData, setCurrentUserData] = useState<User>(currentUser);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-sample-8",
      type: "sticker",
      fromUserId: "user-9",
      fromUserName: "여름날씨",
      fromUserAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      storyId: "story-5",
      storyContent: "오늘 면접에서 떨어졌다는 연락을 받았다. 이번이 다섯 번째인데 자신감이 점점 떨어진다. 내가 뭘 잘못하고 있는 걸까. 계속 도전해야 할지 막막하다.",
      stickerEmoji: "🌈",
      stickerMessage: "힘내세요!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
      read: false,
    },
    {
      id: "notif-sample-7",
      type: "empathy",
      fromUserId: "user-8",
      fromUserName: "달빛",
      fromUserAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
      storyId: "story-4",
      storyContent: "부모님께 커밍아웃을 해야 할지 고민이다. 나를 있는 그대로 보여드리고 싶지만 실망하실까봐 두렵다. 언제쯤 용기를 낼 수 있을까.",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
      read: false,
    },
    {
      id: "notif-sample-6",
      type: "sticker",
      fromUserId: "user-7",
      fromUserName: "은하수",
      fromUserAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
      storyId: "story-3",
      storyContent: "연인과 헤어진 지 한 달이 지났는데 아직도 마음이 아프다. 시간이 약이라던데 언제쯤 괜찮아질까. 혼자 있는 시간이 너무 외롭다.",
      stickerEmoji: "🌸",
      stickerMessage: "괜찮아질 거예요",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
      read: false,
    },
    {
      id: "notif-sample-5",
      type: "empathy",
      fromUserId: "user-6",
      fromUserName: "구름",
      fromUserAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      storyId: "story-2",
      storyContent: "회사에서 승진 기회를 놓쳤다. 동기는 올라가는데 나만 제자리인 것 같아서 자존감이 바닥이다. 내가 부족한 건지 운이 없는 건지 모르겠다.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
      read: false,
    },
    {
      id: "notif-sample-4",
      type: "sticker",
      fromUserId: "user-5",
      fromUserName: "별똥별",
      fromUserAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      storyId: "story-1",
      storyContent: "가족들과의 관계가 점점 멀어지는 것 같아서 슬프다. 명절에도 대화가 없고 각자 핸드폰만 본다. 예전처럼 다시 가까워질 수 있을까.",
      stickerEmoji: "💕",
      stickerMessage: "응원해요!",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
      read: false,
    },
    {
      id: "notif-sample-3",
      type: "empathy",
      fromUserId: "user-4",
      fromUserName: "새벽",
      fromUserAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      storyId: "story-0",
      storyContent: "요즘 새로운 프로젝트를 맡게 되면서 부담감이 크다. 팀원들의 기대에 부응할 수 있을지, 제대로 해낼 수 있을지 걱정된다. 하지만 최선을 다해보려고 한다.",
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
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
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);

  // 프로필 확인 및 데이터 로드
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Supabase에서 프로필 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUserData(prev => ({
            ...prev,
            id: session.user.id,
            name: profile.nickname || prev.name,
            ageGroup: profile.age_group || prev.ageGroup,
            city: profile.region || prev.city, // region or city depending on DB schema
            occupation: profile.occupation || prev.occupation,
            lastNicknameUpdated: profile.last_nickname_updated ? new Date(profile.last_nickname_updated) : undefined,
            lastAgeGroupUpdated: profile.last_age_group_updated ? new Date(profile.last_age_group_updated) : undefined,
            lastOccupationUpdated: profile.last_occupation_updated ? new Date(profile.last_occupation_updated) : undefined,
          }));
        } else {
            // 프로필이 없으면 생성 페이지로 (또는 로컬 스토리지 체크)
             const userProfile = localStorage.getItem("userProfile");
             if (!userProfile) navigate("/profile-setup");
        }
      } else {
         // 세션 없으면 로컬 스토리지 체크 (Figma 데모용 호환성 유지)
         const userProfile = localStorage.getItem("userProfile");
         if (userProfile) {
           const profile = JSON.parse(userProfile);
           setCurrentUserData(prev => ({
             ...prev,
             ageGroup: profile.ageGroup,
             city: profile.city,
             occupation: profile.occupation,
           }));
         } else {
           navigate("/login"); 
         }
      }
    };
    fetchUser();
  }, [navigate]);

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
      isPublic: true, // 기본값은 전체공개
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
    // 스티 없으면 전송 불가
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

  const handleUpdateProfile = async (nickname: string, ageGroup: string, occupation: string) => {
    const updates: any = {};
    const now = new Date();
    
    if (nickname !== currentUserData.name) {
        updates.nickname = nickname;
        updates.last_nickname_updated = now.toISOString();
    }
    if (ageGroup !== currentUserData.ageGroup) {
        updates.age_group = ageGroup;
        updates.last_age_group_updated = now.toISOString();
    }
    if (occupation !== currentUserData.occupation) {
        updates.occupation = occupation;
        updates.last_occupation_updated = now.toISOString();
    }

    const updatedUser = {
      ...currentUserData,
      name: nickname,
      ageGroup: ageGroup,
      occupation: occupation,
      lastNicknameUpdated: updates.last_nickname_updated ? new Date(updates.last_nickname_updated) : currentUserData.lastNicknameUpdated,
      lastAgeGroupUpdated: updates.last_age_group_updated ? new Date(updates.last_age_group_updated) : currentUserData.lastAgeGroupUpdated,
      lastOccupationUpdated: updates.last_occupation_updated ? new Date(updates.last_occupation_updated) : currentUserData.lastOccupationUpdated,
    };
    setCurrentUserData(updatedUser);

    if (Object.keys(updates).length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
             const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id);
             if (error) console.error("Error updating profile:", error);
        }
    }
    
    // 기존 스토리들의 사용자 정보도 업데이트
    setStories((prevStories) =>
      prevStories.map((story) =>
        story.userId === currentUserData.id
          ? { 
              ...story, 
              userName: nickname,
              userAgeGroup: ageGroup,
              userOccupation: occupation,
            }
          : story
      )
    );
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setCreateStoryOpen(true);
  };

  const handleUpdateStory = (storyId: string, content: string, categories: string[]) => {
    setStories((prevStories) =>
      prevStories.map((story) =>
        story.id === storyId
          ? { ...story, content, categories }
          : story
      )
    );
    setEditingStory(null);
    setCreateStoryOpen(false);
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prevStories) => prevStories.filter((story) => story.id !== storyId));
  };

  const handleReportStory = (storyId: string, reason: string, details?: string) => {
    // 실제 구현에서는 서버로 신고 데이터를 전송
    console.log("신고된 스토리:", { storyId, reason, details });
    // 성공 메시지 또는 토스트 표시 가능
    alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
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
              />
            </div>
          </TabsContent>

          <TabsContent value="grateful" className="space-y-6">
            <div className="fixed inset-0 flex flex-col" style={{ top: '73px', bottom: '73px' }}>
              <div className="flex-shrink-0 px-4 pt-6 pb-4 max-w-4xl mx-auto w-full">
                <div>
                  <h2 className="text-2xl font-medium mb-2">💛 감사와 따뜻함</h2>
                  <p className="text-muted-foreground">
                    따뜻했던 순간을 나누세요. 당신의 이야기가 누군가에게는 힘이 돼요.
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
                  onReport={handleReportStory}
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
                fontSize={fontSize}
                fontWeight={fontWeight}
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              fontWeight={fontWeight}
              onFontWeightChange={setFontWeight}
            />
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
              <SettingsIcon className="h-5 w-5" />
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
    </div>
  );
}