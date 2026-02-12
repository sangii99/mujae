import { useState, useEffect } from "react";
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
import { AVAILABLE_CATEGORIES, Story } from "../types";

interface CreateStoryProps {
  onCreateStory: (content: string, categories: string[], feedType: "worry" | "grateful") => void;
  onUpdateStory?: (storyId: string, content: string, categories: string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentTab: string;
  editingStory?: Story | null;
}

export function CreateStory({ onCreateStory, onUpdateStory, open, onOpenChange, currentTab, editingStory }: CreateStoryProps) {
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  
  const MAX_CHARS = 750;
  
  // 현재 탭에 따라 feedType 자동 결정
  const feedType: "worry" | "grateful" = currentTab === "grateful" ? "grateful" : "worry";

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (newContent.length > MAX_CHARS) {
      setIsOverLimit(true);
      setTimeout(() => setIsOverLimit(false), 500);
    }
  };

  const handleSubmit = () => {
    if (content.trim() && selectedCategories.length > 0 && content.length <= MAX_CHARS) {
      if (editingStory && onUpdateStory) {
        onUpdateStory(editingStory.id, content, selectedCategories);
      } else {
        onCreateStory(content, selectedCategories, feedType);
      }
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

  useEffect(() => {
    if (editingStory) {
      setContent(editingStory.content);
      setSelectedCategories(editingStory.categories);
    } else {
      setContent("");
      setSelectedCategories([]);
    }
  }, [editingStory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col bg-[#faf8f3] border-[#e8e6e0]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{editingStory ? "게시글 수정" : "새 게시글 작성"}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 py-4 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <label className="text-sm font-medium">
                {feedType === "worry" 
                  ? "당신의 걱정과 불안을 들려주세요." 
                  : "당신의 감사와 따뜻한 경험을 들려주세요."}
              </label>
              <Button
                variant={isPublic ? "outline" : "default"}
                size="sm"
                onClick={() => setIsPublic(!isPublic)}
                className={`text-xs ${
                  isPublic 
                    ? 'bg-transparent hover:bg-gray-100' 
                    : 'bg-[#6b4c7a] hover:bg-[#5a3e66] text-white border-[#6b4c7a]'
                }`}
              >
                {isPublic ? "전체공개" : "나만보기"}
              </Button>
            </div>
            <Textarea
              placeholder={
                feedType === "worry"
                  ? "오늘 나는 걱정이 되는 게... / 요즘 힘든 게... / 불안한 일이..."
                  : "오늘 감사했던 일은... / 따뜻했던 순간... / 행복했던 경험..."
              }
              value={content}
              onChange={handleContentChange}
              className="flex-1 resize-none min-h-0"
              maxLength={MAX_CHARS}
            />
            <p 
              className={`text-xs mt-2 transition-colors flex-shrink-0 ${
                content.length > MAX_CHARS 
                  ? 'text-red-500 animate-shake' 
                  : 'text-muted-foreground'
              }`}
            >
              {content.length > MAX_CHARS 
                ? `${content.length}자 (글자 수 제한을 넘었습니다.)` 
                : `${content.length}자 (750자 제한)`}
            </p>
          </div>
          
          <div className="space-y-2 flex-shrink-0">
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
        
        <div className="flex gap-2 justify-end flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || selectedCategories.length === 0}
          >
            {editingStory ? "수정 완료" : "공유하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}