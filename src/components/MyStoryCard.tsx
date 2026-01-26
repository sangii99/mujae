import { Heart, Clock, Gift } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Story } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface MyStoryCardProps {
  story: Story;
  fontSize?: number;
}

export function MyStoryCard({ story, fontSize = 16 }: MyStoryCardProps) {
  const getTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "방금 전";
    if (hours === 1) return "1시간 전";
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "1일 전";
    return `${days}일 전`;
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
              <span>{getTimeAgo(story.createdAt)}</span>
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
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{story.empathyCount}명이 공감해요</span>
            </div>
          </div>
          
          {/* Received Stickers Button */}
          {story.stickers.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Gift className="h-4 w-4" />
                  받은 응원 {story.stickers.length}개
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>받은 응원 스티커</DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-3 py-4">
                    {story.stickers.map((sticker, index) => (
                      <Card key={index} className="p-4 bg-accent/30 border-accent">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-background">
                            <span className="text-2xl">{sticker.emoji}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{sticker.message}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              익명의 응원자
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    총 {story.stickers.length}개의 따뜻한 응원을 받으셨어요 💛
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4 opacity-50" />
              <span>아직 받은 응원이 없어요</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}