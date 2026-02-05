import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"; // Need Label
import { AVAILABLE_CATEGORIES } from "@/types";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";

interface CreateStoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (content: string, categories: string[], feedType: "worry" | "grateful") => void;
}

export const CreateStory: React.FC<CreateStoryProps> = ({ open, onOpenChange, onCreate }) => {
  const [feedType, setFeedType] = useState<"worry" | "grateful">("worry");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setContent("");
      setSelectedCategories([]);
      setFeedType("worry");
      setIsPublic(true);
    }
  }, [open]);

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const handleSubmit = () => {
    onCreate(content, selectedCategories, feedType);
  };

  const isValid = content.trim().length > 0 && 
    (feedType === "grateful" || (feedType === "worry" && selectedCategories.length > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이야기 쓰기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Feed Type Selection */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setFeedType("worry")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                feedType === "worry" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              😢 걱정과 불안
            </button>
            <button
              onClick={() => setFeedType("grateful")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                feedType === "grateful" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              💛 감사와 따뜻함
            </button>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Textarea 
              placeholder={feedType === "worry" ? "어떤 걱정이 있나요? 편안하게 털어놓아 보세요." : "오늘 있었던 감사한 일을 기록해보세요."}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 750))}
              className="resize-none min-h-[200px] text-base leading-relaxed"
            />
            <div className="text-xs text-right text-muted-foreground">
              {content.length} / 750
            </div>
          </div>

          {/* Categories (Worry only) */}
          {feedType === "worry" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">카테고리 선택 (필수)</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategories.includes(cat) ? "default" : "outline"}
                    className={cn(
                        "cursor-pointer hover:bg-slate-200", 
                        selectedCategories.includes(cat) ? "hover:bg-primary/90" : ""
                    )}
                    onClick={() => handleToggleCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">공개 설정</Label>
              <div className="text-xs text-muted-foreground">
                {isPublic ? "전체 공개" : "나만 볼 수 있습니다"}
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubmit} 
            disabled={!isValid}
          >
            작성하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
