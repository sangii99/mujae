import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ageGroup: "",
    city: "",
    gender: "",
    occupation: "",
  });

  const isFormValid = formData.ageGroup && formData.city && formData.gender && formData.occupation;

  const handleSubmit = () => {
    if (!isFormValid) return;
    localStorage.setItem("userProfile", JSON.stringify(formData));
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#f5f3ed] border-[#e8e6e0] shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">프로필 설정</CardTitle>
          <CardDescription>
            당신에게 딱 맞는 이야기들을 추천해드릴게요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>나이대</Label>
            <Select 
                value={formData.ageGroup} 
                onValueChange={(val) => setFormData({...formData, ageGroup: val})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="나이대를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {["10대", "20대", "30대", "40대", "50대", "60대 이상"].map(age => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>지역</Label>
            <Input 
                placeholder="예) 서울, 부산" 
                className="bg-white"
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label>성별</Label>
            <RadioGroup 
                value={formData.gender} 
                onValueChange={(val) => setFormData({...formData, gender: val})}
                className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="남성" id="male" />
                <Label htmlFor="male">남성</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="여성" id="female" />
                <Label htmlFor="female">여성</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="기타" id="other" />
                <Label htmlFor="other">기타</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>직업</Label>
            <Select 
                value={formData.occupation} 
                onValueChange={(val) => setFormData({...formData, occupation: val})}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="직업을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {["직장인", "학생", "주부", "프리랜서", "공개안함"].map(job => (
                    <SelectItem key={job} value={job}>{job}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button 
            className="w-full h-11 text-base gap-2" 
            disabled={!isFormValid} 
            onClick={handleSubmit}
          >
            시작하기 <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center break-keep">
            설정한 정보는 게시글에 익명으로 표시되며, 언제든지 설정에서 변경할 수 있습니다.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
