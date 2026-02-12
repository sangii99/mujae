import { useState } from "react";
import { useNavigate } from "react-router";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";

interface SettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontWeight?: "normal" | "bold";
  onFontWeightChange?: (weight: "normal" | "bold") => void;
}

export function Settings({ fontSize, onFontSizeChange, fontWeight, onFontWeightChange }: SettingsProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // 프로필 정보 가져오기
  const savedProfile = localStorage.getItem("userProfile");
  const initialProfile = savedProfile ? JSON.parse(savedProfile) : {
    ageGroup: "",
    city: "",
    gender: "",
    occupation: "",
  };

  const [age, setAge] = useState(initialProfile.ageGroup);
  const [city, setCity] = useState(initialProfile.city);
  const [gender, setGender] = useState(initialProfile.gender);
  const [occupation, setOccupation] = useState(initialProfile.occupation);

  const handleSaveProfile = () => {
    const profile = {
      ageGroup: age,
      city: city,
      gender: gender,
      occupation: occupation,
    };
    
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setIsEditing(false);
    
    // 페이지 새로고침하여 변경사항 반영
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">⚙️ 설정</h2>
        <p className="text-muted-foreground">
          나만의 읽기 환경을 설정하세요.
        </p>
      </div>

      {/* 프로필 정보 설정 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                게시글에 표시될 익명 정보를 관리하세요.
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                수정
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">나이대</span>
                <span>{age || "미설정"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">지역</span>
                <span>{city || "미설정"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">성별</span>
                <span>{gender || "미설정"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">직업</span>
                <span>{occupation || "미설정"}</span>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="age">나이대</Label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="나이대를 선택하세요" />
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
                <Label htmlFor="city">사는 지역</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="예: 서울, 부산, 대구"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-3">
                <Label>성별</Label>
                <RadioGroup value={gender} onValueChange={setGender}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="남성" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">
                      남성
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="여성" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">
                      여성
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="기타" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      기타
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">직업</Label>
                <Select value={occupation} onValueChange={setOccupation}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="직업을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="직장인">직장인</SelectItem>
                    <SelectItem value="학생">학생</SelectItem>
                    <SelectItem value="주부">주부</SelectItem>
                    <SelectItem value="프리랜서">프리랜서</SelectItem>
                    <SelectItem value="공개안함">공개안함</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveProfile} className="flex-1">
                  저장
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setAge(initialProfile.ageGroup);
                    setCity(initialProfile.city);
                    setGender(initialProfile.gender);
                    setOccupation(initialProfile.occupation);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>텍스트 설정</CardTitle>
          <CardDescription>
            게시물의 글자 크기와 굵기를 조절할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>글자 크기</Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={14}
              max={22}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label>볼드체</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  게시물 텍스트를 굵게 표시합니다
                </p>
              </div>
              <Switch
                checked={fontWeight === "bold"}
                onCheckedChange={(checked) => onFontWeightChange?.(checked ? "bold" : "normal")}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-muted-foreground mb-2">미리보기</p>
            <Card className="p-4 bg-[#f5f3ed] border-[#e8e6e0]">
              <p style={{ fontSize: `${fontSize}px`, fontWeight: fontWeight || "normal" }} className="leading-relaxed">
                오늘 하루도 고생 많으셨어요. 당신의 이야기를 들려주세요. 
                이곳은 모두가 서로를 이해하고 응원하는 따뜻한 공간입니다.
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full"
          >
            로그아웃
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>앱 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">버전</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">개발자</span>
            <span>무제 팀</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}