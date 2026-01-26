import { useState } from "react";
import { User, Story } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { MyStoryCard } from "./MyStoryCard";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Pencil } from "lucide-react";

interface ProfileProps {
  user: User;
  stories: Story[];
  onUpdateProfile: (nickname: string, avatarUrl: string) => void;
  fontSize?: number;
}

export function Profile({ user, stories, onUpdateProfile, fontSize = 16 }: ProfileProps) {
  const userStories = stories.filter((story) => story.userId === user.id);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  
  const handleSave = () => {
    if (nickname.trim()) {
      onUpdateProfile(nickname.trim(), avatarUrl);
      setOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-[#ede8dc] border-0">
        <div className="flex items-start gap-4">
          <Avatar className="h-28 w-28 border-0">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
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
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>프로필 편집</DialogTitle>
                    <DialogDescription>
                      닉네임과 프로필 사진을 변경할 수 있습니다.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">닉네임</Label>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        {nickname.length}/20자
                      </p>
                    </div>
                    
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
                    
                    {avatarUrl && (
                      <div className="space-y-2">
                        <Label>미리보기</Label>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-16 w-16 bg-muted">
                            <AvatarImage src={avatarUrl} alt="미리보기" />
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
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSave} disabled={!nickname.trim()}>
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
        <h3 className="font-medium mb-4">내 이야기</h3>
        {userStories.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground bg-[#f5f3ed] border-[#e8e6e0]">
            <p>아직 공유한 이야기가 없습니다.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {userStories.map((story) => (
              <MyStoryCard
                key={story.id}
                story={story}
                fontSize={fontSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}