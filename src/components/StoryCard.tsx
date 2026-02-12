import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Settings, Lock, Globe, Sparkles, MoreVertical } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Story, SUPPORT_STICKERS } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import empathyIcon from "../assets/1cf87df5e848e0368281bc2ddabccc0ba1ece188.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

interface StoryCardProps {
  story: Story;
  onEmpathize: (storyId: string) => void;
  onSendSticker: (storyId: string, emoji: string, message: string) => void;
  currentUserId: string;
  currentUserStickerCount: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  onStickerPickerOpenChange?: (open: boolean) => void;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onReport?: (storyId: string, reason: string, details?: string) => void;
}

export function StoryCard({ story, onEmpathize, onSendSticker, currentUserId, currentUserStickerCount, fontSize = 16, fontWeight = "normal", onStickerPickerOpenChange, onEdit, onDelete, onReport }: StoryCardProps) {
  const hasEmpathized = story.empathizedBy.includes(currentUserId);
  const hasSentSticker = story.stickers.some((s) => s.userId === currentUserId);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  
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

  const handleSendSticker = (emoji: string, message: string) => {
    onSendSticker(story.id, emoji, message);
    setShowStickerPicker(false);
    onStickerPickerOpenChange?.(false);
  };

  const handleStickerPickerToggle = () => {
    if (currentUserStickerCount === 0 || hasSentSticker) return;
    const newState = !showStickerPicker;
    setShowStickerPicker(newState);
    onStickerPickerOpenChange?.(newState);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-[#f5f3ed] border-[#e8e6e0] relative">
      <div className="space-y-4">
        {/* Header without Avatar */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">{story.userName}</h3>
            <span className="text-xs text-muted-foreground/70">
              · {story.userCity} · {story.userAgeGroup} {story.userOccupation}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
            <Clock className="h-3 w-3" />
            <span>{getTimeAgo(story.createdAt)}</span>
          </div>
        </div>
        
        {/* Content - Full Width */}
        <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px`, fontWeight: fontWeight }}>{story.content}</p>
        
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

        {/* Privacy Badge - Only show for current user's stories */}
        {story.userId === currentUserId && (
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
        )}
        
        {/* Stickers - Only show for worry type */}
        {story.feedType === "worry" && story.stickers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent transition-colors text-sm">
                  {story.stickers.slice(0, 5).map((sticker, i) => (
                    <span key={i} className="text-lg">{sticker.emoji}</span>
                  ))}
                  {story.stickers.length > 5 && (
                    <span className="text-xs text-muted-foreground ml-1">...</span>
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Button
              variant={hasEmpathized ? "default" : "outline"}
              size="sm"
              onClick={() => onEmpathize(story.id)}
              className="gap-2"
            >
              <img 
                src={empathyIcon} 
                alt="공감" 
                className={`h-4 w-4 ${hasEmpathized ? "opacity-100" : "opacity-70"}`}
              />
              <span>{story.empathyCount}명이 공감해요</span>
            </Button>
            
            {/* Sticker Button - Only show for worry type */}
            {story.feedType === "worry" && story.userId !== currentUserId && (
              hasSentSticker ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white cursor-default"
                  disabled
                >
                  <Sparkles className="h-4 w-4" />
                  <span>응원 완료!</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={currentUserStickerCount === 0}
                  onClick={handleStickerPickerToggle}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>응원하기</span>
                </Button>
              )
            )}
          </div>
          
          {/* Sticker Picker Panel - Expands below Actions */}
          {story.feedType === "worry" && story.userId !== currentUserId && (
            <AnimatePresence>
              {showStickerPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#ede8dc] border border-[#e0dbd0] rounded-lg p-3 shadow-md">
                    <p className="text-sm font-medium mb-2.5">응원 스티커를 선택해주세요!</p>
                    {/* 620px 이상에서는 가로 한 줄, 이하에서는 2줄 */}
                    <div className="hidden min-[620px]:flex gap-2 justify-center">
                      {SUPPORT_STICKERS.map((sticker) => (
                        <button
                          key={sticker.emoji}
                          onClick={() => handleSendSticker(sticker.emoji, sticker.message)}
                          className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-[#f5f3ed] border border-[#e8e6e0] hover:border-blue-400 hover:bg-blue-50 transition-all group min-w-[80px]"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {sticker.emoji}
                          </span>
                          <span className="text-xs text-center text-muted-foreground group-hover:text-blue-600 whitespace-nowrap">
                            {sticker.message}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* 620px 미만에서는 2줄로 표시 */}
                    <div className="flex min-[620px]:hidden flex-col gap-2">
                      {/* 첫 번째 줄: 힘내세요, 응원해요, 괜찮아요 */}
                      <div className="flex gap-2 justify-center">
                        {SUPPORT_STICKERS.slice(0, 3).map((sticker) => (
                          <button
                            key={sticker.emoji}
                            onClick={() => handleSendSticker(sticker.emoji, sticker.message)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-[#f5f3ed] border border-[#e8e6e0] hover:border-blue-400 hover:bg-blue-50 transition-all group min-w-[80px]"
                          >
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                              {sticker.emoji}
                            </span>
                            <span className="text-xs text-center text-muted-foreground group-hover:text-blue-600 whitespace-nowrap">
                              {sticker.message}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* 두 번째 줄: 함께 있어요, 잘하고 있어요 */}
                      <div className="flex gap-2 justify-center">
                        {SUPPORT_STICKERS.slice(3, 5).map((sticker) => (
                          <button
                            key={sticker.emoji}
                            onClick={() => handleSendSticker(sticker.emoji, sticker.message)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-[#f5f3ed] border border-[#e8e6e0] hover:border-blue-400 hover:bg-blue-50 transition-all group min-w-[80px]"
                          >
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                              {sticker.emoji}
                            </span>
                            <span className="text-xs text-center text-muted-foreground group-hover:text-blue-600 whitespace-nowrap">
                              {sticker.message}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Dropdown Menu for Edit/Delete */}
      {story.userId === currentUserId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => onEdit && onEdit(story)}
            >
              수정하기
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              삭제하기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스토리를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 스토리는 영원히 삭제됩니다. 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete && onDelete(story.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>스토리 신고하기</DialogTitle>
            <DialogDescription>
              이 스토리를 신고하는 이유를 선택하고, 필요한 경우 추가 정보를 제공하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={reportReason}
              onValueChange={setReportReason}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="abusive" />
                <Label>욕설이나 불쾌한 내용</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" />
                <Label>스팸 또는 광고</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" />
                <Label>부적절한 내용</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" />
                <Label>기타</Label>
              </div>
            </RadioGroup>
            {reportReason === "other" && (
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="추가 정보를 입력하세요..."
                className="h-20"
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (onReport) {
                  onReport(story.id, reportReason, reportDetails);
                }
                setIsReportDialogOpen(false);
              }}
            >
              신고하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Button */}
      {story.userId !== currentUserId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuItem
              onClick={() => setIsReportDialogOpen(true)}
            >
              게시글 신고
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Card>
  );
}