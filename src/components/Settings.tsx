import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function Settings({ fontSize, onFontSizeChange }: SettingsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-2">⚙️ 설정</h2>
        <p className="text-muted-foreground">
          나만의 읽기 환경을 설정하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>텍스트 크기</CardTitle>
          <CardDescription>
            게시물의 글자 크기를 조절할 수 있습니다.
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

          <div className="pt-4 border-t">
            <p className="text-muted-foreground mb-2">미리보기</p>
            <Card className="p-4 bg-[#f5f3ed] border-[#e8e6e0]">
              <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
                오늘 하루도 고생 많으셨어요. 당신의 이야기를 들려주세요. 
                이곳은 모두가 서로를 이해하고 응원하는 따뜻한 공간입니다.
              </p>
            </Card>
          </div>
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
