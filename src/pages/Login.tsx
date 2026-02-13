import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router"; // Link 추가
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase"; // Supabase 클라이언트 추가
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label"; // Label 추가

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // 이메일 비밀번호 입력 확인
    if (!email || !password) {
        setError("이메일과 비밀번호를 모두 입력해주세요.");
        setLoading(false);
        return;
    }

    try {
        // 1. Supabase 로그인
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) throw signInError;

        if (data.user) {
            // 2. 프로필 존재 여부 확인
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .maybeSingle(); // single() 대신 maybeSingle() 사용 (없을 수도 있으므로)

            if (profile) {
                // 프로필이 있으면 앱 메인으로
                navigate("/app");
            } else {
                // 프로필이 없으면 설정 페이지로
                navigate("/profile-setup");
            }
        }
    } catch (err: any) {
        console.error("Login error:", err);
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
        setLoading(false);
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

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">
                {typeof error === 'string' ? error : "로그인 중 오류가 발생했습니다."}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
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