import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Heart, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { KOREA_REGIONS } from "../utils/koreaRegions";
import { calculateAgeGroup } from "../utils/time";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }
      
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setNickname(profile.nickname || "");
        setBirthDate(profile.birth_date || "");
        setGender(profile.gender || ""); 
        setOccupation(profile.occupation || "");
        
        if (profile.city) {
          const parts = profile.city.split(" ");
          const p = parts[0];
          const c = parts.slice(1).join(" ");
          
          if (KOREA_REGIONS[p]) {
            setProvince(p);
            setCity(c || "");
          } else {
             const found = Object.keys(KOREA_REGIONS).find(k => k === p);
             if(found) {
                setProvince(found);
                setCity(c || ""); 
             }
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity(""); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const calculatedAgeGroup = calculateAgeGroup(birthDate);

      const updates = {
        id: userId,
        nickname: nickname,
        birth_date: birthDate,
        age_group: calculatedAgeGroup,
        city: `${province} ${city}`,
        occupation: occupation,
        gender: gender,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      
      navigate("/app");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const isFormValid = nickname && birthDate && province && city && occupation && gender;

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#f5f3ed] border-[#e8e6e0]">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Heart className="h-10 w-10 fill-current text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">프로필 설정</h1>
            <p className="text-sm text-muted-foreground">
              게시글에 표시될 익명 정보를 설정해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={8}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">생년월일</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">사는 지역</Label>
              <Select value={province} onValueChange={handleProvinceChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="광역시/도를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(KOREA_REGIONS).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">구/군/시</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="구/군/시를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {KOREA_REGIONS[province]?.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!isFormValid}
            >
              완료 및 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            설정한 정보는 게시글에 익명으로 표시되며, 언제든지 설정에서 변경할 수 있습니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
