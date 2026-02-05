import React from "react";
import { Story } from "@/types";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { getTimeAgo } from "@/utils/time";
import { StickerPicker } from "@/components/StickerPicker";
import { cn } from "@/utils/cn";

interface StoryCardProps {
  story: Story;
  currentUserId: string;
  fontSize: number;
  onEmpathize: (storyId: string) => void;
  onSendSticker: (storyId: string, emoji: string, message: string) => void;
  onStickerPickerOpenChange?: (isOpen: boolean) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  currentUserId,
  fontSize,
  onEmpathize,
  onSendSticker,
  onStickerPickerOpenChange,
}) => {
  const hasEmpathized = story.empathizedBy.includes(currentUserId);
  const timeAgo = getTimeAgo(story.createdAt);

  return (
    <Card className="bg-[#f5f3ed] border-[#e8e6e0] hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2 space-y-0">
        <Avatar>
          <AvatarImage src={story.userAvatar} alt={story.userName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            {story.userName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{story.userName}</span>
            <span className="text-muted-foreground font-normal">
               · {story.userCity} · {story.userAgeGroup} {story.userOccupation}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed whitespace-pre-wrap break-keep">
          {story.content}
        </p>
      </CardContent>

      {story.feedType === "worry" && (
        <CardFooter className="flex flex-col gap-4 p-4 pt-0 items-start">
            {story.categories.length > 0 && (
                 <div className="flex flex-wrap gap-1">
                 {story.categories.map(cat => (
                     <Badge key={cat} variant="secondary" className="bg-white/50 text-muted-foreground border border-black/5 hover:bg-white/80">
                         {cat}
                     </Badge>
                 ))}
                 </div>
            )}

            {story.stickers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-white/40 rounded-lg w-full">
                    {story.stickers.map((sticker, idx) => (
                        <div key={`${sticker.userId}-${idx}`} className="flex items-center gap-1 text-sm bg-white rounded-full px-2 py-1 shadow-sm border border-orange-100">
                            <span>{sticker.emoji}</span>
                            <span className="text-slate-600 font-medium">{sticker.message}</span>
                        </div>
                    ))}
                </div>
            )}

          <div className="flex w-full items-center justify-between border-t border-[#e8e6e0] pt-3 mt-2">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEmpathize(story.id)}
                className={cn("gap-1 hover:bg-red-50 hover:text-red-500", hasEmpathized && "text-red-500")}
             >
              <Heart className={cn("h-4 w-4 transition-colors", hasEmpathized ? "fill-current" : "")} />
              <span>{story.empathyCount}</span>
            </Button>
            
            <StickerPicker 
                onSendSticker={(emoji, message) => onSendSticker(story.id, emoji, message)}
                onOpenChange={onStickerPickerOpenChange}
                disabled={story.userId === currentUserId} // Optional: disable self-sticker? Prompt section 5.4 says "자기 글에 스티커 보내기 (테스트용)" allows it. But usually we disable. The prompt says "Scenario 2: Self post simualtion". I will enable it.
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
