import React, { useState } from "react";
import { User, Story } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MyStoryCard } from "@/components/MyStoryCard";
import { Edit2, BadgeCheck } from "lucide-react";

interface ProfileProps {
  currentUser: User;
  stories: Story[];
  onUpdateProfile: (name: string, avatar: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, stories, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const handleSave = () => {
    onUpdateProfile(name, avatar);
    setIsEditing(false);
  };

  const myStories = stories.filter(s => s.userId === currentUser.id);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-lg border border-[#e8e6e0] shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={isEditing ? avatar : currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              {isEditing ? (
                <Input value={name} onChange={e => setName(e.target.value)} className="h-8 w-32" />
              ) : (
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
              )}
              <p className="text-sm text-muted-foreground">
                {currentUser.city} · {currentUser.ageGroup} · {currentUser.occupation}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? <BadgeCheck className="w-4 h-4 mr-1" /> : <Edit2 className="w-4 h-4 mr-1" />}
            {isEditing ? "저장" : "수정"}
          </Button>
        </div>
        
        {isEditing && (
            <div className="mb-4">
                <Input placeholder="프로필 이미지 URL" value={avatar} onChange={e => setAvatar(e.target.value)} className="text-xs" />
            </div>
        )}

        <div className="bg-orange-50 p-3 rounded-md flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <span className="text-sm font-medium text-orange-800">받은 응원 스티커 {currentUser.stickerCount}개</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold px-2">내 이야기 ({myStories.length})</h3>
      <div className="space-y-4">
        {myStories.map(story => (
           <MyStoryCard key={story.id} story={story} />
        ))}
        {myStories.length === 0 && <p className="text-center text-muted-foreground py-10">작성한 이야기가 없습니다.</p>}
      </div>
    </div>
  );
};
