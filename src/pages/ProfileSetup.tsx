import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { KOREA_REGIONS } from "@/utils/koreaRegions";
import { supabase } from "@/lib/supabase";

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  
  // Split city into region and district for the UI state
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    ageGroup: "",
    gender: "",
    occupation: "",
  });

  useEffect(() => {
    // Ensure user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }
      // Optional: Load existing profile data if we want to support "editing"
    };
    checkUser();
  }, [navigate]);

  const districts = selectedRegion ? KOREA_REGIONS[selectedRegion as keyof typeof KOREA_REGIONS] || [] : [];
  
  // Form is valid if all fields are filled.
  const isFormValid = 
    formData.ageGroup && 
    selectedRegion && 
    (districts.length === 0 || selectedDistrict) && 
    formData.gender && 
    formData.occupation;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Combine region and district for storage
      const fullCity = selectedDistrict ? `${selectedRegion} ${selectedDistrict}` : selectedRegion;

      const finalProfile = {
        age_group: formData.ageGroup, // Match DB column names (snake_case)
        gender: formData.gender,
        occupation: formData.occupation,
        city: fullCity
      };

      // Supabase Profile 업데이트 또는 생성 (Upsert)
      // updated_at 컬럼은 테이블에 없으므로 제외하거나, 테이블에 추가해야 합니다.
      // 일단 제외하고 전송합니다.
      const { error } = await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            email: user.email, 
            ...finalProfile,
            // updated_at: new Date().toISOString(), // Removing this as column might not exist
        });

      if (error) throw error;

      // Update LocalStorage for compatibility with current MainApp
      localStorage.setItem("userProfile", JSON.stringify({
        ...formData,
        city: fullCity
      }));

      navigate("/app");
    } catch (error: any) {
      console.error("Profile update error:", error);
      // Show more detailed error message to user
      alert(`프로필 저장 중 오류가 발생했습니다: ${error.message || error.error_description || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const jobCategories = [
    "학생", 
    "직장인", 
    "자영업자", 
    "프리랜서", 
    "구직자", 
    "기타"
  ];

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

          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-2">
                <Label>지역 (시/도)</Label>
                <Select 
                    value={selectedRegion} 
                    onValueChange={(val) => {
                        setSelectedRegion(val);
                        setSelectedDistrict(""); // Reset district on region change
                    }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="시/도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(KOREA_REGIONS).map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             
             <div className="space-y-2">
                <Label>지역 (구/군)</Label>
                <Select 
                    value={selectedDistrict} 
                    onValueChange={setSelectedDistrict}
                    disabled={!selectedRegion || districts.length === 0}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="구/군 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
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
                {jobCategories.map(job => (
                    <SelectItem key={job} value={job}>{job}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button 
            className="w-full h-11 text-base gap-2 bg-black text-white hover:bg-gray-800"
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
