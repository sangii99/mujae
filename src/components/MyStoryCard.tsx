import React from "react";
import { Story } from "@/types";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles } from "lucide-react";
import { getTimeAgo } from "@/utils/time";

interface MyStoryCardProps {
  story: Story;
}

export const MyStoryCard: React.FC<MyStoryCardProps> = ({ story }) => {
  const timeAgo = getTimeAgo(story.createdAt);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <Badge variant={story.feedType === "worry" ? "secondary" : "outline"} className={story.feedType === "worry" ? "bg-slate-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
            {story.feedType === "worry" ? "😢 걱정" : "💛 감사"}
            </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-3 text-sm text-foreground/80 break-keep">
          {story.content}
        </p>
      </CardContent>
      <CardFooter className="flex gap-4 text-xs text-muted-foreground pt-2 border-t mt-2">
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          <span>{story.empathyCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>{story.stickers.length}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
