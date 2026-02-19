import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Settings, Lock, Globe, Sparkles, MoreVertical, ArrowLeft, X } from "lucide-react";
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
  onHideStory?: (storyId: string) => void;
  onBlockUser?: (userId: string) => void;
  onHide?: (storyId: string) => void;
  onUnhide?: (storyId: string) => void;
  onUnblockUser?: (userId: string) => void;
  hiddenStoryIds?: string[];
  blockedUserIds?: string[];
}

export function StoryCard({ story, onEmpathize, onSendSticker, currentUserId, currentUserStickerCount, fontSize = 16, fontWeight = "normal", onStickerPickerOpenChange, onEdit, onDelete, onReport, onHideStory, onBlockUser, onHide, onUnhide, onUnblockUser, hiddenStoryIds = [], blockedUserIds = [] }: StoryCardProps) {
  const hasEmpathized = story.empathizedBy.includes(currentUserId);
  const hasSentSticker = story.stickers.some((s) => s.userId === currentUserId);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportMenuStep, setReportMenuStep] = useState<'main' | 'reportPost' | 'reportUser' | 'writeReason'>('main');
  const [reportType, setReportType] = useState<'post' | 'user'>('post');
  const [customReportReason, setCustomReportReason] = useState("");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  
  const isHidden = hiddenStoryIds.includes(story.id);
  const isBlocked = blockedUserIds.includes(story.userId);
  
  const reportMenuRef = useRef<HTMLDivElement>(null);
  const reportButtonRef = useRef<HTMLButtonElement>(null);
  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle outside click for report menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReportMenu) {
        const target = event.target as Node;
        // Check if click is outside both the menu and the button
        if (
          reportMenuRef.current &&
          !reportMenuRef.current.contains(target) &&
          reportButtonRef.current &&
          !reportButtonRef.current.contains(target)
        ) {
          setShowReportMenu(false);
          setReportMenuStep('main');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReportMenu]);
  
  // Auto focus textarea when writeReason step is active
  useEffect(() => {
    if (reportMenuStep === 'writeReason' && reasonTextareaRef.current) {
      reasonTextareaRef.current.focus();
    }
  }, [reportMenuStep]);
  
  // Handle scroll to close settings menu
  useEffect(() => {
    const handleScroll = () => {
      if (isSettingsMenuOpen) {
        setIsSettingsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isSettingsMenuOpen]);
  
  const getTimeAgo = (date: Date) => {
    const now = Date.now();
    const then = date.getTime();
    const diffMs = now - then;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
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

  // Hidden story card
  if (isHidden && !isBlocked) {
    return (
      <Card className="p-6 bg-[#f5f3ed] border-[#e8e6e0] relative flex flex-col items-center justify-center min-h-[120px] gap-2">
        <p className="text-muted-foreground text-sm">가려진 게시글입니다.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnhide && onUnhide(story.id)}
        >
          되돌리기
        </Button>
      </Card>
    );
  }

  // Blocked user card
  if (isBlocked) {
    return (
      <Card className="p-6 bg-[#f5f3ed] border-[#e8e6e0] relative flex flex-col items-center justify-center min-h-[120px] gap-3">
        <p className="text-muted-foreground text-sm text-center">
          차단된 유저의 게시글입니다.
          <br />
          게시글을 보시려면 차단을 해제 해 주세요.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnblockUser && onUnblockUser(story.userId)}
        >
          되돌리기
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-[#f5f3ed] border-[#e8e6e0] relative">
      {/* Write Reason Mode - Full Card Transform */}
      {showReportMenu && reportMenuStep === 'writeReason' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">신고 사유 작성</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowReportMenu(false);
                setReportMenuStep('main');
                setCustomReportReason('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            ref={reasonTextareaRef}
            value={customReportReason}
            onChange={(e) => setCustomReportReason(e.target.value)}
            placeholder="신고 사유를 입력하세요..."
            className="h-40 resize-none"
          />
          
          <Button
            onClick={() => {
              setShowReportMenu(false);
              setReportMenuStep('main');
              if (reportType === 'post') {
                if (onReport) {
                  onReport(story.id, 'other', customReportReason);
                }
                alert('게시글이 신고되었습니다.');
              } else {
                alert(`${story.userName}님이 신고되었습니다.`);
              }
              setCustomReportReason('');
            }}
            className="w-full"
          >
            사유 제출
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {/* Header without Avatar */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{story.userName}</h3>
                <span className="text-xs text-muted-foreground/70">
                  {(() => {

                    const parts = [];
                    // Using story privacy settings directly
                    const showCity = story.showCity !== false;
                    const showAgeGroup = story.showAgeGroup !== false;
                    const showOccupation = story.showOccupation !== false;

                    if (showCity && story.userCity && story.userCity !== "비공개") parts.push(story.userCity);
                    if (showAgeGroup && story.userAgeGroup && story.userAgeGroup !== "비공개") parts.push(story.userAgeGroup);
                    if (showOccupation && story.userOccupation && story.userOccupation !== "비공개") parts.push(story.userOccupation);
                    
                    if (parts.length === 0) return '';
                    return `· ${parts.join(' · ')}`;
                  })()}
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
                        {/* 620px 이상에서는 로 한 줄, 이하에서는 2줄 */}
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
                        {/* 620px 미만에서�� 2줄로 표시 */}
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
            <DropdownMenu open={isSettingsMenuOpen} onOpenChange={setIsSettingsMenuOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-28 min-w-0" 
                align="end"
                sideOffset={8}
                alignOffset={0}
                collisionPadding={16}
              >
                <DropdownMenuItem
                  onClick={() => {
                    setIsSettingsMenuOpen(false);
                    onEdit && onEdit(story);
                  }}
                  className="text-sm"
                >
                  수정하기
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsSettingsMenuOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-sm"
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

          {/* Report Button */}
          {story.userId !== currentUserId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-20"
                onClick={() => setShowReportMenu(!showReportMenu)}
                ref={reportButtonRef}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {/* Back Button - Only show in secondary menus */}
              <AnimatePresence>
                {showReportMenu && (reportMenuStep === 'reportPost' || reportMenuStep === 'reportUser') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, delay: 0.25 }}
                    className="absolute top-2 left-2 z-20"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReportMenuStep('main')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Report Menu Overlay with Liquid Glass Effect */}
              <AnimatePresence>
                {showReportMenu && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-10 flex items-center justify-center p-6 rounded-lg"
                    style={{ 
                      backgroundColor: 'rgba(245, 243, 237, 0.001)',
                      backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => {
                      setShowReportMenu(false);
                      setReportMenuStep('main');
                    }}
                    ref={reportMenuRef}
                  >
                    <div 
                      className="w-full max-w-sm space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AnimatePresence mode="wait">
                        {reportMenuStep === 'main' && (
                          <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            {/* 게시글 신고하기 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.05 }}
                              onClick={() => setReportMenuStep('reportPost')}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              게시글 신고하기
                            </motion.button>

                            {/* 유저 신고하기 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              onClick={() => setReportMenuStep('reportUser')}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              유저 신고하기
                            </motion.button>

                            {/* 게시글 가리기 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.15 }}
                              onClick={() => {
                                setShowReportMenu(false);
                                setReportMenuStep('main');
                                if (onHide) {
                                  onHide(story.id);
                                }
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              게시글 가리기
                            </motion.button>

                            {/* 유저 차단하기 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              onClick={() => {
                                setShowReportMenu(false);
                                setReportMenuStep('main');
                                if (onBlockUser) {
                                  onBlockUser(story.userId);
                                }
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              유저 차단하기
                            </motion.button>
                          </motion.div>
                        )}

                        {reportMenuStep === 'reportPost' && (
                          <motion.div
                            key="reportPost"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            {/* 부적절한 내용 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.05 }}
                              onClick={() => {
                                setShowReportMenu(false);
                                setReportMenuStep('main');
                                if (onReport) {
                                  onReport(story.id, 'inappropriate', '');
                                }
                                alert('게시글이 신고되었습니다.');
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              부적절한 내용
                            </motion.button>

                            {/* 욕설이나 불쾌한 내용 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              onClick={() => {
                                setShowReportMenu(false);
                                setReportMenuStep('main');
                                if (onReport) {
                                  onReport(story.id, 'abusive', '');
                                }
                                alert('게시글이 신고되었습니다.');
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              욕설이나 불쾌한 내용
                            </motion.button>

                            {/* 스팸 또는 광고 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.15 }}
                              onClick={() => {
                                setShowReportMenu(false);
                                setReportMenuStep('main');
                                if (onReport) {
                                  onReport(story.id, 'spam', '');
                                }
                                alert('게시글이 신고되었습니다.');
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              스팸 또는 광고
                            </motion.button>

                            {/* 기타 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              onClick={() => {
                                setReportType('post');
                                setReportMenuStep('writeReason');
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              기타
                            </motion.button>
                          </motion.div>
                        )}

                        {reportMenuStep === 'reportUser' && (
                          <motion.div
                            key="reportUser"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            {/* 부적절한 닉네임 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.05 }}
                              onClick={() => {
                                setShowReportMenu(false);
                                setReportMenuStep('main');
                                alert(`${story.userName}님이 신고되었습니다.`);
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              부적절한 닉네임
                            </motion.button>

                            {/* 기타 */}
                            <motion.button
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              onClick={() => {
                                setReportType('user');
                                setReportMenuStep('writeReason');
                              }}
                              className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                              style={{
                                backgroundColor: 'rgba(235, 243, 250, 0.25)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(206, 222, 242, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              기타
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </>
      )}
    </Card>
  );
}