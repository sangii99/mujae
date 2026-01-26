import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AVAILABLE_CATEGORIES } from "../types";

interface CreateStoryProps {
  onCreateStory: (content: string, categories: string[], feedType: "worry" | "grateful") => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentTab: string;
}

export function CreateStory({ onCreateStory, open, onOpenChange, currentTab }: CreateStoryProps) {
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // 현재 탭에 따라 feedType 자동 결정
  const feedType: "worry" | "grateful" = currentTab === "grateful" ? "grateful" : "worry";

  const handleSubmit = () => {
    if (content.trim() && selectedCategories.length > 0) {
      onCreateStory(content, selectedCategories, feedType);
      setContent("");
      setSelectedCategories([]);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#faf8f3] border-[#e8e6e0]">
        <DialogHeader>
          <DialogTitle>새 게시물 작성</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium block mb-3">
              {feedType === "worry" 
                ? "당신의 걱정과 불안을 들려주세요." 
                : "당신의 감사와 따뜻한 경험을 들려주세요."}
            </label>
            <Textarea
              placeholder={
                feedType === "worry"
                  ? "오늘 나는 걱정이 되는 게... / 요즘 힘든 게... / 불안한 일이..."
                  : "오늘 감사했던 일은... / 따뜻했던 순간... / 행복했던 경험..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[280px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {content.length}자
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              이야기와 관련된 카테고리를 선택하세요 (최소 1개)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || selectedCategories.length === 0}
          >
            공유하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}