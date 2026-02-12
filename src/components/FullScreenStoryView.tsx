import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Story } from "../types";

interface FullScreenStoryViewProps {
  stories: Story[];
  onEmpathize: (storyId: string) => void;
  currentUserId: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
}

export function FullScreenStoryView({ 
  stories, 
  onEmpathize, 
  currentUserId,
  fontSize = 16,
  fontWeight = "normal"
}: FullScreenStoryViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center text-muted-foreground">
        <p>이야기가 없습니다. 첫 번째로 이야기를 공유해보세요!</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex];
  const hasEmpathized = currentStory.empathizedBy.includes(currentUserId);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = Date.now();
    const then = date.getTime();
    const diffMs = now - then;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return "방금 전";
    if (hours < 1) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days <= 7) return `${days}일 전`;
    
    // 7일 이후: 날짜 표시 (YYYY.MM.DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="relative h-full flex items-center">
      {/* Main Content */}
      <div className="w-full h-full flex flex-col justify-center bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] rounded-lg p-8 md:p-12 shadow-sm">
        {/* Story Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-lg">{currentStory.userName}</h3>
            <span className="text-xs text-muted-foreground/70">
              · {currentStory.userCity} · {currentStory.userAgeGroup} {currentStory.userOccupation}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            <span>{getTimeAgo(currentStory.createdAt)}</span>
          </div>
        </div>

        {/* Story Content - Centered and Large */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto px-4">
          <p 
            className="text-foreground leading-relaxed text-center max-w-3xl"
            style={{ fontSize: `${fontSize + 4}px`, fontWeight }}
          >
            {currentStory.content}
          </p>
        </div>

        {/* Empathy Button */}
        <div className="mt-6 flex justify-center flex-shrink-0">
          <Button
            variant={hasEmpathized ? "default" : "outline"}
            size="lg"
            onClick={() => onEmpathize(currentStory.id)}
            className="gap-2 px-8"
          >
            <span className="text-lg">{hasEmpathized ? "💛" : "🤍"}</span>
            <span>{currentStory.empathyCount}명이 공감해요</span>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-shrink-0">
          {stories.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? "w-8 bg-foreground" 
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Story Counter */}
        <div className="mt-2 text-center text-sm text-muted-foreground flex-shrink-0">
          {currentIndex + 1} / {stories.length}
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur hover:bg-background"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {currentIndex < stories.length - 1 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur hover:bg-background"
          onClick={goToNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}