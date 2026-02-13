import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";

// 지역 데이터
const regions = {
  "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  "부산광역시": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
  "대구광역시": ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  "인천광역시": ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
  "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
  "울산광역시": ["남구", "동구", "북구", "울주군", "중구"],
  "세종특별자치시": ["세종시"],
  "경기도": ["고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "여주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시", "가평군", "양평군", "연천군"],
  "강원특별자치도": ["강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"],
  "충청북도": ["제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군"],
  "충청남도": ["계룡시", "공주시", "논산시", "당진시", "보령시", "서산시", "아산시", "천안시", "금산군", "부여군", "서천군", "예산군", "청양군", "태안군", "홍성군"],
  "전북특별자치도": ["군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"],
  "전라남도": ["광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
  "경상북도": ["경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "군위군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"],
  "경상남도": ["거제시", "김해시", "밀양시", "사천시", "양산시", "진주시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"],
  "제주특별자치도": ["제주시", "서귀포시"],
};


interface SettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontWeight?: "normal" | "bold";
  onFontWeightChange?: (weight: "normal" | "bold") => void;
}

export function Settings({ fontSize, onFontSizeChange, fontWeight, onFontWeightChange }: SettingsProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // State for profile data
  const [nickname, setNickname] = useState(""); 
  const [age, setAge] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [gender, setGender] = useState("");
  const [isGenderPublic, setIsGenderPublic] = useState(false); 
  const [occupation, setOccupation] = useState("");

  // Store initial values for cancel functionality
  const [initialProfile, setInitialProfile] = useState<any>({});

  // 컴포넌트 마운트 시 Supabase에서 최신 정보 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      let loadedNickname = "";
      let loadedAge = "";
      let loadedCity = "";
      let loadedOccupation = "";
      let loadedGender = "";
      let loadedIsGenderPublic = false;

      // 1. Supabase 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          loadedNickname = profile.nickname || "";
          loadedAge = profile.age_group || "";
          loadedCity = profile.city || ""; // DB 스키마: city
          loadedOccupation = profile.occupation || "";
          loadedGender = profile.gender || ""; 
          loadedIsGenderPublic = profile.is_gender_public || false;
        } else if (error) {
            console.error("Error loading profile:", error);
        }
      } else {
        // 2. 비로그인 시 로컬스토리지 확인
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          loadedAge = p.ageGroup || "";
          loadedCity = p.city || "";
          loadedOccupation = p.occupation || "";
          loadedGender = p.gender || "";
          loadedIsGenderPublic = p.isGenderPublic || false;
        }
        // UserData (Signup)에서 닉네임 백업 확인
        const savedUserData = localStorage.getItem("userData");
        if (savedUserData) {
             const u = JSON.parse(savedUserData);
             loadedNickname = u.nickname || loadedNickname;
        }
      }

      setNickname(loadedNickname);
      setAge(loadedAge);
      setOccupation(loadedOccupation);
      setGender(loadedGender);
      setIsGenderPublic(loadedIsGenderPublic);

      // 지역 정보 파싱 (예: "경기도 용인시")
      let initialProvince = "";
      let initialDistrict = "";
      if (loadedCity) {
        const parts = loadedCity.split(" ");
        if (parts.length >= 2) {
            initialProvince = parts[0];
            initialDistrict = parts[1];
        } else {
            initialProvince = loadedCity;
        }
      }
      setProvince(initialProvince);
      setDistrict(initialDistrict);

      // Store initial state for cancel
      setInitialProfile({
          nickname: loadedNickname,
          age: loadedAge,
          province: initialProvince,
          district: initialDistrict,
          occupation: loadedOccupation,
          gender: loadedGender,
          isGenderPublic: loadedIsGenderPublic
      });
    };
    loadProfile();
  }, []);


  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict(""); 
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
  };

  const handleSaveProfile = async () => {
    const fullCity = `${province} ${district}`.trim();
    
    // Construct the profile object to save
    const profileData = {
        city: fullCity,
        is_gender_public: isGenderPublic,
        nickname: nickname, // Maintain existing values
        age_group: age,
        occupation: occupation,
        gender: gender,
        updated_at: new Date().toISOString(),
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Upsert into Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            ...profileData
          });
        
        if (error) {
           console.error("Supabase upsert error:", error);
           alert(`저장 실패: ${error.message}`);
           return;
        }
      }

      // Update Local Storage
      // Align with internal property names (camelCase for app usage)
      const localProfile = {
        nickname: nickname,
        ageGroup: age,
        city: fullCity,
        occupation: occupation,
        gender: gender,
        isGenderPublic: isGenderPublic
      };
      
      localStorage.setItem("userProfile", JSON.stringify(localProfile));
      
      // Update userData for consistency if needed
      const savedUserData = localStorage.getItem("userData");
      if (savedUserData) {
        const u = JSON.parse(savedUserData);
        u.nickname = nickname; // Ensure nickname is synced
        localStorage.setItem("userData", JSON.stringify(u));
      }

      alert("설정이 저장되었습니다.");
      setIsEditing(false);
      // Optional: window.location.reload() if strictly necessary, 
      // but usually state update is enough if parent components listen to it.
      // For now, let's keep reload to be safe as per previous logic.
      window.location.reload();

    } catch (e) {
      console.error("Error saving profile:", e);
      alert("프로필 저장 중 오류가 발생했습니다.");
    }
  };

  const handleCancelEdit = () => {
     // Revert to initial state
     if (initialProfile) {
         setNickname(initialProfile.nickname || "");
         setAge(initialProfile.age || "");
         setProvince(initialProfile.province || "");
         setDistrict(initialProfile.district || "");
         setOccupation(initialProfile.occupation || "");
         setGender(initialProfile.gender || "");
         setIsGenderPublic(initialProfile.isGenderPublic || false);
     }
     setIsEditing(false);
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
                <span className="text-muted-foreground">닉네임</span>
                <span>{nickname || "미설정"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">나이대</span>
                <span>{age || "미설정"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">지역</span>
                <span>{province && district ? `${province} ${district}`.trim() : "미설정"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">성별 공개 여부</span>
                <span>{isGenderPublic ? "공개" : "비공개"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">직업</span>
                <span>{occupation || "미설정"}</span>
              </div>
            </>
          ) : (
            <>
              {/* 수정 불가능한 필드들 */}
              <div className="space-y-2 opacity-60">
                 <Label>닉네임 (프로필에서 변경 가능)</Label>
                 <Input value={nickname} disabled className="bg-muted" />
              </div>

              {/* 지역 */}
                <div className="space-y-2">
                <Label htmlFor="province">사는 지역</Label>
                <Select value={province} onValueChange={handleProvinceChange}>
                    <SelectTrigger className="bg-background">
                    <SelectValue placeholder="광역시/도를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                    {Object.keys(regions).map((region) => (
                        <SelectItem key={region} value={region}>
                        {region}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                <div className="space-y-2">
                <Label htmlFor="district">구/군/시</Label>
                <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="bg-background">
                    <SelectValue placeholder="구/군/시를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                    {(regions[province as keyof typeof regions] || []).map((d: string) => (
                        <SelectItem key={d} value={d}>
                        {d}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

              <div className="space-y-2 opacity-60">
                <Label>나이대 (프로필에서 변경 가능)</Label>
                <Input value={age} disabled className="bg-muted" />
              </div>

              <div className="space-y-2 opacity-60">
                <Label>직업 (프로필에서 변경 가능)</Label>
                <Input value={occupation} disabled className="bg-muted" />
              </div>


              {/* 수정 가능한 필드 */}
              <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-3">
                    <Label>성별 공개 설정</Label>
                    <RadioGroup 
                        value={isGenderPublic ? "public" : "private"} 
                        onValueChange={(val) => setIsGenderPublic(val === "public")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="font-normal cursor-pointer">
                          공개
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="font-normal cursor-pointer">
                          비공개
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveProfile} className="flex-1">
                  저장
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
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