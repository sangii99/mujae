import { useState, useEffect } from "react";
import { User, Story } from "../types";
import { Card } from "./ui/card";
import { MyStoryCard } from "./MyStoryCard";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Switch } from "./ui/switch";

interface ProfileProps {
  user: User;
  stories: Story[];
  onUpdateProfile: (nickname: string, ageGroup: string, occupation: string) => void;
  onUpdateVisibility?: (field: 'ageGroup' | 'city' | 'occupation', value: boolean) => void;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
}

export function Profile({ 
  user, 
  stories, 
  onUpdateProfile, 
  onUpdateVisibility = () => {}, 
  fontSize = 16, 
  fontWeight = "normal", 
  onEdit, 
  onDelete 
}: ProfileProps) {
  const userStories = stories.filter((story) => story.userId === user.id);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(user.name);
  // local state for ageGroup and occupation
  const [ageGroup, setAgeGroup] = useState(user.ageGroup);
  const [occupation, setOccupation] = useState(user.occupation);
  
  // local state for visibility settings (since we want to save them only when "Save" is clicked)
  const [showAgeGroup, setShowAgeGroup] = useState(user.showAgeGroup ?? true);
  const [showCity, setShowCity] = useState(user.showCity ?? true);
  const [showOccupation, setShowOccupation] = useState(user.showOccupation ?? true);

  const [feedTypeFilter, setFeedTypeFilter] = useState<"all" | "worry" | "grateful">("all");
  const [sortBy, setSortBy] = useState<"latest" | "empathy">("latest");
  
  // Sync local state with user prop when it changes (e.g. on initial load or external update)
  useEffect(() => {
    setNickname(user.name);
    setAgeGroup(user.ageGroup);
    setOccupation(user.occupation);
    setShowAgeGroup(user.showAgeGroup ?? true);
    setShowCity(user.showCity ?? true);
    setShowOccupation(user.showOccupation ?? true);
  }, [user]);

  const nicknameChangeCount = user.nicknameChangeCount || 0;
  const canChangeNickname = nicknameChangeCount < 2;
  
  const handleSave = () => {
    if (nickname.trim() && occupation) {
      // Update profile data
      onUpdateProfile(nickname, ageGroup, occupation);
      
      // Update visibility settings
      if (onUpdateVisibility) {
        if (showAgeGroup !== user.showAgeGroup) onUpdateVisibility('ageGroup', showAgeGroup);
        if (showCity !== user.showCity) onUpdateVisibility('city', showCity);
        if (showOccupation !== user.showOccupation) onUpdateVisibility('occupation', showOccupation);
      }
      
      setOpen(false);
    }
  };

  const filteredStories = userStories
    .filter(story => feedTypeFilter === "all" || story.feedType === feedTypeFilter)
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (b.empathyCount || 0) - (a.empathyCount || 0);
    });

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6 bg-[#f5f3ed] border-[#e8e6e0]">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            {/* Avatar Placeholder if needed, but we rely on simple text for now */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-[#f5f3ed]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">프로필 편집</DialogTitle>
                      <DialogDescription>
                        닉네임과 직업 및 프로필에서의 정보 공개 여부를 수정 할 수 있습니다.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                      {/* 닉네임 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <Label htmlFor="nickname" className="font-semibold text-base">닉네임</Label>
                            <span className="text-muted-foreground text-xs">닉네임은 2회 변경 가능합니다. ({2 - nicknameChangeCount}회 남음)</span>
                        </div>
                        <Input
                          id="nickname"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          maxLength={20}
                          className="bg-white border-[#e8e6e0]"
                          disabled={!canChangeNickname}
                        />
                        <div className="text-xs text-muted-foreground">
                            {nickname.length}/20자
                        </div>
                      </div>

                      {/* 직업 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <Label htmlFor="occupation" className="font-semibold text-base">직업</Label>
                            <span className="text-muted-foreground text-xs">직업 변경은 180일에 한번 가능합니다.</span>
                        </div>
                         <Select value={occupation} onValueChange={setOccupation}>
                            <SelectTrigger className="bg-white border-[#e8e6e0]">
                                <SelectValue placeholder="직업 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="학생">학생</SelectItem>
                                <SelectItem value="프리랜서">프리랜서</SelectItem>
                                <SelectItem value="직장인">직장인</SelectItem>
                                <SelectItem value="공무원">공무원</SelectItem>
                                <SelectItem value="자영업자">자영업자</SelectItem>
                                <SelectItem value="군인">군인</SelectItem>
                                <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>

                      {/* 공개 여부 설정 */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">연령대 공개 여부</Label>
                            <div className="flex w-full gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                        backgroundColor: showAgeGroup ? "#0c0c14" : "transparent",
                                        color: showAgeGroup ? "white" : "#0c0c14",
                                        borderColor: "#e8e6e0"
                                    }}
                                    className="flex-1 hover:opacity-90"
                                    onClick={() => setShowAgeGroup(true)}
                                >
                                    공개
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                        backgroundColor: !showAgeGroup ? "#0c0c14" : "transparent",
                                        color: !showAgeGroup ? "white" : "#0c0c14",
                                        borderColor: "#e8e6e0"
                                    }}
                                    className="flex-1 hover:opacity-90"
                                    onClick={() => setShowAgeGroup(false)}
                                >
                                    비공개
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">지역 공개 여부</Label>
                            <div className="flex w-full gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                        backgroundColor: showCity ? "#0c0c14" : "transparent",
                                        color: showCity ? "white" : "#0c0c14",
                                        borderColor: "#e8e6e0"
                                    }}
                                    className="flex-1 hover:opacity-90"
                                    onClick={() => setShowCity(true)}
                                >
                                    공개
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                        backgroundColor: !showCity ? "#0c0c14" : "transparent",
                                        color: !showCity ? "white" : "#0c0c14",
                                        borderColor: "#e8e6e0"
                                    }}
                                    className="flex-1 hover:opacity-90"
                                    onClick={() => setShowCity(false)}
                                >
                                    비공개
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">직업 공개 여부</Label>
                            <div className="flex w-full gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                        backgroundColor: showOccupation ? "#0c0c14" : "transparent",
                                        color: showOccupation ? "white" : "#0c0c14",
                                        borderColor: "#e8e6e0"
                                    }}
                                    className="flex-1 hover:opacity-90"
                                    onClick={() => setShowOccupation(true)}
                                >
                                    공개
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                        backgroundColor: !showOccupation ? "#0c0c14" : "transparent",
                                        color: !showOccupation ? "white" : "#0c0c14",
                                        borderColor: "#e8e6e0"
                                    }}
                                    className="flex-1 hover:opacity-90"
                                    onClick={() => setShowOccupation(false)}
                                >
                                    비공개
                                </Button>
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4">
                      <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-transparent hover:bg-[#e8e6e0]">취소</Button>
                      <Button onClick={handleSave} style={{ backgroundColor: "#0c0c14", color: "white" }} className="px-6 hover:opacity-90">저장하기</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-muted-foreground">
                {user.showCity ? user.city : "비공개"} · {user.showAgeGroup ? user.ageGroup : "비공개"} · {user.showOccupation ? user.occupation : "비공개"}
              </p>
            </div>
          </div>
        </div>

        {/* Visibility Settings - quick toggles inside Profile view for convenience? Or keep in Settings tab?
            The screenshot showed "Settings" tab with "Profile Info" section. 
            So we don't necessarily need toggles here, but the user interface might expect them. 
            Let's stick to the minimal redesign: Just show the data.
            Wait, the attachment shows "Settings" page with toggles.
            Previously MainApp tab 'settings' renders <Settings /> component.
            This is <Profile /> component rendered in 'profile' tab.
        */}
      </Card>

      {/* Stories Tabs */}
      <Tabs defaultValue="all" className="w-full">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">내가 쓴 글 ({userStories.length})</h2>
            <div className="flex items-center gap-2">
                 <Select value={feedTypeFilter} onValueChange={(v: any) => setFeedTypeFilter(v)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="worry">걱정</SelectItem>
                        <SelectItem value="grateful">감사</SelectItem>
                    </SelectContent>
                 </Select>
                 <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="최신순" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest">최신순</SelectItem>
                        <SelectItem value="empathy">공감순</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
         </div>
        
        <div className="space-y-4">
          {filteredStories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
              <p>작성한 이야기가 없습니다.</p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <MyStoryCard 
                key={story.id} 
                story={story} 
                fontSize={fontSize} 
                fontWeight={fontWeight}
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
