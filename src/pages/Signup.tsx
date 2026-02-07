import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "nickname" && value.length > 8) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = 
    formData.nickname.length > 0 && 
    formData.nickname.length <= 8 &&
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.passwordConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);

    try {
      // 1. Sign up user with Metadata (닉네임 메타데이터 포함)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nickname: formData.nickname,
          },
        },
      });

      if (authError) throw authError;

      // 2. Insert 제거함 (SQL Trigger로 처리)
      // Navigate based on session
      if (authData.session) {
         navigate("/profile-setup");
      } else {
         alert("회원가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.");
         navigate("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#f5f3ed] border-[#e8e6e0] shadow-xl relative">
        <Button 
            variant="ghost" 
            className="absolute top-4 left-4 p-0 h-auto hover:bg-transparent text-sm gap-1"
            onClick={() => navigate("/")}
        >
            <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
        </Button>

        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto bg-black p-3 rounded-full w-fit">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <CardTitle className="text-3xl font-serif">무제</CardTitle>
          <CardDescription>새로운 계정 만들기</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">닉네임</Label>
              <Input 
                name="nickname"
                placeholder="사용할 닉네임을 입력하세요" 
                className="bg-white" 
                value={formData.nickname}
                onChange={handleChange}
                required 
              />
              <p className="text-xs text-muted-foreground">최대 8자까지 입력 가능합니다</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">이메일</Label>
              <Input 
                name="email"
                type="email" 
                placeholder="example@email.com" 
                className="bg-white"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">비밀번호</Label>
              <Input 
                name="password"
                type="password" 
                placeholder="최소 6자 이상" 
                className="bg-white" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">비밀번호 확인</Label>
              <Input 
                name="passwordConfirm"
                type="password" 
                placeholder="비밀번호를 다시 입력하세요" 
                className="bg-white" 
                value={formData.passwordConfirm}
                onChange={handleChange}
                required 
              />
            </div>

            <Button 
                type="submit" 
                className="w-full h-11 text-base bg-black text-white hover:bg-gray-800 mt-6"
                disabled={!isFormValid}
            >
                회원가입
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground text-center break-keep">
            회원가입하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
