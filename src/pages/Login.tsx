import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 간단한 로그인 처리 (실제로는 인증 로직이 필요)
    if (email && password) {
      // 프로필이 설정되어 있는지 확인
      const hasProfile = localStorage.getItem("userProfile");
      
      if (hasProfile) {
        navigate("/app");
      } else {
        navigate("/profile-setup");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#f5f3ed] border-[#e8e6e0]">
        <div className="space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Heart className="h-12 w-12 fill-current text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">무제</h1>
            <p className="text-muted-foreground">
              당신의 이야기를 나누세요
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f5f3ed] px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* Sign Up */}
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={() => navigate("/signup")}
          >
            회원가입
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}