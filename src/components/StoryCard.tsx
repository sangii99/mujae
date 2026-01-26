import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Story } from "../types";
import { StickerPicker } from "./StickerPicker";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface StoryCardProps {
  story: Story;
  onEmpathize: (storyId: string) => void;
  onSendSticker: (storyId: string, emoji: string, message: string) => void;
  currentUserId: string;
  currentUserStickerCount: number;
  fontSize?: number;
}

export function StoryCard({ story, onEmpathize, onSendSticker, currentUserId, currentUserStickerCount, fontSize = 16 }: StoryCardProps) {
  const hasEmpathized = story.empathizedBy.includes(currentUserId);
  const hasSentSticker = story.stickers.some((s) => s.userId === currentUserId);
  
  const handleSendSticker = (emoji: string, message: string) => {
    onSendSticker(story.id, emoji, message);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-[#f5f3ed] border-[#e8e6e0]">
      <div className="space-y-4">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 bg-muted">
            {story.userAvatar ? (
              <AvatarImage src={story.userAvatar} alt={story.userName} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {story.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{story.userName}</h3>
              <span className="text-xs text-muted-foreground/70">
                · {story.userCity} · {story.userAgeGroup} {story.userOccupation}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(story.createdAt, { addSuffix: true, locale: ko })}</span>
            </div>
          </div>
        </div>
        
        {/* Content - Full Width */}
        <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>{story.content}</p>
        
        {/* Categories - Only show for worry type */}
        {story.feedType === "worry" && (
          <div className="flex flex-wrap gap-2">
            {story.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Stickers - Only show for worry type */}
        {story.feedType === "worry" && story.stickers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent transition-colors text-sm">
                  {story.stickers.slice(0, 3).map((sticker, i) => (
                    <span key={i} className="text-lg">{sticker.emoji}</span>
                  ))}
                  {story.stickers.length > 3 && (
                    <span className="text-xs text-muted-foreground ml-1">+{story.stickers.length - 3}</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">받은 응원 스티커</p>
                  <div className="space-y-1.5">
                    {story.stickers.map((sticker, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{sticker.emoji}</span>
                        <span className="text-muted-foreground">{sticker.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant={hasEmpathized ? "default" : "outline"}
            size="sm"
            onClick={() => onEmpathize(story.id)}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${hasEmpathized ? "fill-current" : ""}`} />
            <span>{story.empathyCount}명이 공감해요</span>
          </Button>
          
          {/* Sticker Picker - Only show for worry type */}
          {story.feedType === "worry" && (
            <StickerPicker
              onSendSticker={handleSendSticker}
              stickerCount={currentUserStickerCount}
              disabled={hasSentSticker || story.userId === currentUserId}
            />
          )}
        </div>
      </div>
    </Card>
  );
}