import { useState } from "react";
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
import { getRemainingDays } from "../utils/time";

interface ProfileProps {
  user: User;
  stories: Story[];
  onUpdateProfile: (nickname: string, ageGroup: string, occupation: string) => void;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
}

export function Profile({ user, stories, onUpdateProfile, fontSize = 16, fontWeight = "normal", onEdit, onDelete }: ProfileProps) {
  const userStories = stories.filter((story) => story.userId === user.id);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(user.name);
  const [ageGroup, setAgeGroup] = useState(user.ageGroup);
  const [occupation, setOccupation] = useState(user.occupation);
  const [feedTypeFilter, setFeedTypeFilter] = useState<"all" | "worry" | "grateful">("all");
  const [sortBy, setSortBy] = useState<"latest" | "empathy">("latest");

  const nicknameDaysLeft = getRemainingDays(user.lastNicknameUpdated, 90);
  const ageGroupDaysLeft = getRemainingDays(user.lastAgeGroupUpdated, 300);
  const occupationDaysLeft = getRemainingDays(user.lastOccupationUpdated, 180);
  
  const handleSave = () => {
    if (nickname.trim() && ageGroup && occupation) {
      onUpdateProfile(nickname.trim(), ageGroup, occupation);
      setOpen(false);
    }
  };

  // 피드 타입별 필터링
  const filteredStories = feedTypeFilter === "all" 
    ? userStories 
    : userStories.filter((story) => story.feedType === feedTypeFilter);

  // 정렬
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === "latest") {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else {
      return b.empathyCount - a.empathyCount;
    }
  });
  
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-[#ede8dc] border-0">
        <div className="flex items-start gap-4">
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
                <DialogContent className="max-w-md bg-[#f5f3ed] border-[#e8e6e0]">
                  <DialogHeader>
                    <DialogTitle>프로필 편집</DialogTitle>
                    <DialogDescription>
                      닉네임, 나이, 직업을 수정할 수 있습니다.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="nickname">닉네임</Label>
                        <span className={`text-xs ${nicknameDaysLeft > 0 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          {nicknameDaysLeft > 0 ? `${nicknameDaysLeft}일 후 변경 가능` : "닉네임은 90일에 한번 변경 가능합니다."}
                        </span>
                      </div>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        maxLength={20}
                        disabled={nicknameDaysLeft > 0}
                      />
                      <p className="text-xs text-muted-foreground">
                        {nickname.length}/20자
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ageGroup">연령대</Label>
                        <span className={`text-xs ${ageGroupDaysLeft > 0 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          {ageGroupDaysLeft > 0 ? `${ageGroupDaysLeft}일 후 변경 가능` : "300일에 한번 변경 가능합니다."}
                        </span>
                      </div>
                      <Select
                        value={ageGroup}
                        onValueChange={setAgeGroup}
                        disabled={ageGroupDaysLeft > 0}
                      >
                        <SelectTrigger id="ageGroup">
                          <SelectValue placeholder="연령대를 선택하세요">
                            {ageGroup}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10대">10대</SelectItem>
                          <SelectItem value="20대">20대</SelectItem>
                          <SelectItem value="30대">30대</SelectItem>
                          <SelectItem value="40대">40대</SelectItem>
                          <SelectItem value="50대">50대</SelectItem>
                          <SelectItem value="60대 이상">60대 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="occupation">직업</Label>
                        <span className={`text-xs ${occupationDaysLeft > 0 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          {occupationDaysLeft > 0 ? `${occupationDaysLeft}일 후 변경 가능` : "180일에 한번 변경 가능합니다."}
                        </span>
                      </div>
                      <Select
                        value={occupation}
                        onValueChange={setOccupation}
                        disabled={occupationDaysLeft > 0}
                      >
                        <SelectTrigger id="occupation">
                          <SelectValue placeholder="직업을 선택하세요">
                            {occupation}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="학생">학생</SelectItem>
                          <SelectItem value="프리랜서">프리랜서</SelectItem>
                          <SelectItem value="직장인 (회사원/선생님/판사/의사)">직장인 (회사원/선생님/판사/의사)</SelectItem>
                          <SelectItem value="공무원">공무원</SelectItem>
                          <SelectItem value="자영업자">자영업자</SelectItem>
                          <SelectItem value="군인">군인</SelectItem>
                          <SelectItem value="기타">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSave} disabled={!nickname.trim() || !ageGroup || !occupation}>
                      저장
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-muted-foreground mt-1">
              {user.city} · {user.ageGroup} {user.occupation}
            </p>
          </div>
        </div>
      </Card>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">내가 쓴 글</h3>
          <Select value={sortBy} onValueChange={(value: "latest" | "empathy") => setSortBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="empathy">공감순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {userStories.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground bg-[#f5f3ed] border-[#e8e6e0]">
            <p>아직 공유한 이야기가 없습니다.</p>
          </Card>
        ) : (
          <Tabs value={feedTypeFilter} onValueChange={(value: any) => setFeedTypeFilter(value)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="worry">😢 걱정과 불안</TabsTrigger>
              <TabsTrigger value="grateful">💛 감사와 따뜻함</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {sortedStories.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground bg-[#f5f3ed] border-[#e8e6e0]">
                  <p>아직 공유한 이야기가 없습니다.</p>
                </Card>
              ) : (
                sortedStories.map((story) => (
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
            </TabsContent>

            <TabsContent value="worry" className="space-y-4">
              {sortedStories.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground bg-[#f5f3ed] border-[#e8e6e0]">
                  <p>아직 공유한 걱정과 불안 이야기가 없습니다.</p>
                </Card>
              ) : (
                sortedStories.map((story) => (
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
            </TabsContent>

            <TabsContent value="grateful" className="space-y-4">
              {sortedStories.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground bg-[#f5f3ed] border-[#e8e6e0]">
                  <p>아직 공유한 감사와 따뜻함 이야기가 없습니다.</p>
                </Card>
              ) : (
                sortedStories.map((story) => (
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}