import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router"; // Import useNavigate
import { supabase } from "../lib/supabase"; // Import supabase
import { User, Story } from "../types";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";
import { X, Search } from "lucide-react";

interface SettingsProps {
  user: User;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontWeight?: "normal" | "bold";
  onFontWeightChange?: (weight: "normal" | "bold") => void;
  blockedUserIds?: string[];
  onUnblockUser?: (userId: string) => void;
  hiddenStoryIds?: string[];
  onUnhideStory?: (storyId: string) => void;
  stories?: Story[]; // Changed from any[] to Story[]
  onUpdateVisibility?: (field: 'ageGroup' | 'city' | 'occupation', value: boolean) => void;
}

export function Settings({ 
  user,
  fontSize, 
  onFontSizeChange, 
  fontWeight = "normal", 
  onFontWeightChange, 
  blockedUserIds = [], 
  onUnblockUser, 
  hiddenStoryIds = [], 
  onUnhideStory, 
  stories = [], 
  onUpdateVisibility = () => {} 
}: SettingsProps) {
  const navigate = useNavigate();

  // Handlers for visibility
  const handleToggle = (field: 'ageGroup' | 'city' | 'occupation', checked: boolean) => {
    onUpdateVisibility(field, checked);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Blocked / Hidden Logic remains mostly UI state inside Settings
  // Ideally these should persist too, but for now we focus on Profile Info.
  
  const handleUnblock = (userId: string) => {
    if (onUnblockUser) onUnblockUser(userId);
  };

  const handleUnhide = (storyId: string) => {
    if (onUnhideStory) onUnhideStory(storyId);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Profile Info (Matches user screenshot) */}
      <Card className="p-6 bg-[#f5f3ed] border-[#e8e6e0]">
        <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">프로필 정보</h2>
              <p className="text-sm text-muted-foreground">게시글에 표시될 정보를 관리하세요.</p>
            </div>

            <div className="grid gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">연령대</Label>
                        <p className="text-sm text-muted-foreground">{user.ageGroup || "설정되지 않음"}</p>
                    </div>
                     <div className="flex items-center gap-2">
                         <span className="text-sm font-medium">{user.showAgeGroup ? "공개" : "비공개"}</span>
                         <Switch 
                            checked={user.showAgeGroup}
                            onCheckedChange={(checked) => handleToggle('ageGroup', checked)}
                         />
                     </div>
                </div>
                <div className="h-px bg-border" /> {/* Separator */}
                
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">지역</Label>
                        <p className="text-sm text-muted-foreground">{user.city || "설정되지 않음"}</p>
                    </div>
                     <div className="flex items-center gap-2">
                         <span className="text-sm font-medium">{user.showCity ? "공개" : "비공개"}</span>
                         <Switch 
                            checked={user.showCity}
                            onCheckedChange={(checked) => handleToggle('city', checked)}
                         />
                     </div>
                </div>
                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                    <div>
                         <Label className="text-base">직업</Label>
                        <p className="text-sm text-muted-foreground">{user.occupation || "설정되지 않음"}</p>
                    </div>
                     <div className="flex items-center gap-2">
                         <span className="text-sm font-medium">{user.showOccupation ? "공개" : "비공개"}</span>
                         <Switch 
                            checked={user.showOccupation}
                            onCheckedChange={(checked) => handleToggle('occupation', checked)}
                         />
                     </div>
                </div>
            </div>
        </div>
      </Card>


      {/* 2. Reading Preferences */}
      <h2 className="text-xl font-bold">읽기 설정</h2>
      <Card className="p-6 bg-[#f5f3ed] border-[#e8e6e0]">
          <div className="space-y-6">
            <div className="space-y-4">
                <Label>글자 크기 ({fontSize}px)</Label>
                <div className="flex items-center gap-4">
                    <span className="text-sm">가</span>
                     <Slider
                        value={[fontSize]}
                        min={12}
                        max={24}
                        step={1}
                        onValueChange={(vals) => onFontSizeChange(vals[0])}
                        className="flex-1"
                     />
                     <span className="text-lg">가</span>
                </div>
            </div>

            <div className="space-y-4">
                 <Label>글꼴 두께</Label>
                 <RadioGroup 
                    value={fontWeight} 
                    onValueChange={(val: "normal" | "bold") => onFontWeightChange && onFontWeightChange(val)}
                    className="flex flex-row gap-4"
                 >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="fw-normal" />
                        <Label htmlFor="fw-normal" className="font-normal">기본</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bold" id="fw-bold" />
                        <Label htmlFor="fw-bold" className="font-bold">굵게</Label>
                    </div>
                 </RadioGroup>
            </div>
          </div>
      </Card>

      {/* 3. Blocked / Hidden Management (Simplified) */}
      <h2 className="text-xl font-bold">차단 및 숨김 관리</h2>
      <Card className="p-6 bg-[#f5f3ed] border-[#e8e6e0]">
          <div className="space-y-4">
            <div>
                <Label>차단한 사용자 ({blockedUserIds.length})</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                    {blockedUserIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">차단한 사용자가 없습니다.</p>
                    ) : (
                        blockedUserIds.map(userId => (
                            <div key={userId} className="flex justify-between items-center py-1">
                                <span className="text-sm">User {userId.substring(0, 6)}...</span>
                                <Button variant="ghost" size="sm" onClick={() => handleUnblock(userId)}>해제</Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div>
                 <Label>숨긴 이야기 ({hiddenStoryIds.length})</Label>
                 <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                    {hiddenStoryIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">숨긴 이야기가 없습니다.</p>
                    ) : (
                        hiddenStoryIds.map(storyId => (
                            <div key={storyId} className="flex justify-between items-center py-1">
                                <span className="text-sm">Story {storyId.substring(0, 6)}...</span>
                                <Button variant="ghost" size="sm" onClick={() => handleUnhide(storyId)}>해제</Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
      </Card>
      
      <div className="flex justify-center pt-6">
          <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full" onClick={handleLogout}>
              로그아웃
          </Button>
      </div>

    </div>
  );
}
