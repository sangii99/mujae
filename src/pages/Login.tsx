import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        checkProfile(session.user.id);
      }
    };
    checkSession();
  }, [navigate]);

  const checkProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile check error:", error);
      // If error (e.g. no profile), send to setup
      navigate("/profile-setup");
      return;
    }

    // Check if profile is "complete" (has city/occupation)
    // Adjust these fields based on what you consider "setup complete"
    if (profile && profile.city && profile.occupation) {
      navigate("/app");
    } else {
      navigate("/profile-setup");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await checkProfile(data.user.id);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
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
              <Input 
                type="email" 
                placeholder="이메일" 
                className="bg-white" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="비밀번호" 
                className="bg-white" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f5f3ed] px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 bg-white" onClick={() => navigate("/signup")}>회원가입</Button>
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
