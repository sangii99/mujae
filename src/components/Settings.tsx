import React from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

interface SettingsProps {
  currentUser: User;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, fontSize, onFontSizeChange }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h2 className="text-2xl font-semibold">설정</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">나이대</span>
            <span>{currentUser.ageGroup}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">지역</span>
            <span>{currentUser.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">직업</span>
            <span>{currentUser.occupation}</span>
          </div>
          <Button variant="link" className="px-0 h-auto text-xs" onClick={() => navigate("/profile-setup")}>
            정보 수정하기 (프로필 재설정)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">텍스트 크기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm">글자 크기: {fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => onFontSizeChange(value[0])}
            min={14}
            max={22}
            step={1}
          />
          <div className="p-4 bg-muted rounded-md border text-center">
            <p style={{ fontSize: `${fontSize}px` }}>
              미리보기 텍스트입니다.<br/>
              당신의 이야기는 소중합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">버전</span>
                   <span>1.0.0</span>
               </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">개발자</span>
                   <span>무제 팀</span>
               </div>
               <Button variant="destructive" className="w-full gap-2 mt-4" onClick={handleLogout}>
                 <LogOut className="w-4 h-4" /> 로그아웃
               </Button>
            </div>
          </CardContent>
      </Card>
    </div>
  );
};
