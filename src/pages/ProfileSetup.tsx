import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity(""); // 광역시/도가 변경되면 시/군/구 초기화
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 프로필 정보 저장
    const profile = {
      ageGroup: age,
      city: `${province} ${city}`,
      gender: gender,
      occupation: occupation,
      completedAt: new Date().toISOString(),
    };
    
    localStorage.setItem("userProfile", JSON.stringify(profile));
    
    // 메인 앱으로 이동
    navigate("/app");
  };

  const isFormValid = age && province && city && gender && occupation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#f5f3ed] border-[#e8e6e0]">
        <div className="space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Heart className="h-10 w-10 fill-current text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">프로필 설정</h1>
            <p className="text-sm text-muted-foreground">
              게시글에 표시될 익명 정보를 설정해주세요
            </p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 나이대 */}
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
              <Label htmlFor="city">구/군/시</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="구/군/시를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {regions[province]?.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 성별 */}
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

            {/* 직업 */}
            <div className="space-y-2">
              <Label htmlFor="occupation">직업</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="직업을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="학생">학생</SelectItem>
                  <SelectItem value="프리랜서">프리랜서</SelectItem>
                  <SelectItem value="직장인">직장인 (회사원/선생님/판사/의사)</SelectItem>
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
              시작하기
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