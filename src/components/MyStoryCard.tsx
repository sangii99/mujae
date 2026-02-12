import { Heart, Clock, Gift, Settings, Lock, Globe } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Story } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";

interface MyStoryCardProps {
  story: Story;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
}

export function MyStoryCard({ story, fontSize = 16, fontWeight = "normal", onEdit, onDelete }: MyStoryCardProps) {
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

  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-[#f5f3ed] border-[#e8e6e0]">
      <div className="space-y-4">
        {/* Header without Avatar */}
        <div className="flex items-start gap-4">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  if (onEdit) {
                    onEdit(story);
                  }
                }}
              >
                수정하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsDeleting(true);
                }}
              >
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Content - Full Width */}
        <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px`, fontWeight: `${fontWeight}` }}>{story.content}</p>
        
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
        
        {/* Privacy Badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {story.isPublic === false ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>나만보기</span>
            </>
          ) : (
            <>
              <Globe className="h-3.5 w-3.5" />
              <span>전체공개</span>
            </>
          )}
        </div>
        
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

      {/* Delete Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onDelete) {
                  onDelete(story.id);
                }
                setIsDeleting(false);
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}