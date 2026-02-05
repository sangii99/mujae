import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      navigate("/app");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation: Check if profile exists
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      navigate("/app");
    } else {
      navigate("/profile-setup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#f5f3ed] border-[#e8e6e0] shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-red-100 p-3 rounded-full w-fit">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
          </div>
          <CardTitle className="text-3xl font-serif">무제</CardTitle>
          <CardDescription>당신의 이야기가 시작되는 곳</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input type="email" placeholder="이메일" className="bg-white" required />
            </div>
            <div className="space-y-2">
              <Input type="password" placeholder="비밀번호" className="bg-white" required />
            </div>
            <Button type="submit" className="w-full h-11 text-base">로그인</Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f5f3ed] px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 bg-white">회원가입</Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground text-center">
            로그인 시 이용약관과 개인정보처리방침에 동의하게 됩니다.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
