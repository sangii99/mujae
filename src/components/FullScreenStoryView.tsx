import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, MoreVertical, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Story } from "../types";
import { Textarea } from "./ui/textarea";

interface FullScreenStoryViewProps {
  stories: Story[];
  onEmpathize: (storyId: string) => void;
  currentUserId: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onReport?: (storyId: string, reason: string, details?: string) => void;
  onHide?: (storyId: string) => void;
  onBlockUser?: (userId: string) => void;
  onReportUser?: (userId: string, userName: string, reason: string, details?: string) => void;
}

export function FullScreenStoryView({ 
  stories, 
  onEmpathize, 
  currentUserId,
  fontSize = 16,
  fontWeight = "normal",
  onEdit,
  onDelete,
  onReport,
  onHide,
  onBlockUser,
  onReportUser
}: FullScreenStoryViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportMenuStep, setReportMenuStep] = useState<'main' | 'reportPost' | 'reportUser' | 'writeReason'>('main');
  const [reportType, setReportType] = useState<'post' | 'user'>('post');
  const [customReportReason, setCustomReportReason] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const reportMenuRef = useRef<HTMLDivElement>(null);
  const reportButtonRef = useRef<HTMLButtonElement>(null);
  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);
  
  // Handle outside click for report menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReportMenu) {
        const target = event.target as Node;
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
  
  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center text-muted-foreground">
        <p>이야기가 없습니다. 첫 번째로 이야기를 공유해보세요!</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex];
  const hasEmpathized = currentStory.empathizedBy.includes(currentUserId);
  const isOwnStory = currentStory.userId === currentUserId;

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
      <div className="w-full h-full flex flex-col justify-center bg-gradient-to-br from-[#faf8f3] via-[#f5f3ed] to-[#ede8dc] rounded-lg p-8 md:p-12 shadow-sm relative">
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
                닫기
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
                    onReport(currentStory.id, 'other', customReportReason);
                  }
                  alert('게시글이 신고되었습니다.');
                } else {
                  if (onReportUser) {
                    onReportUser(currentStory.userId, currentStory.userName, 'other', customReportReason);
                  }
                  alert(`${currentStory.userName}님이 신고되었습니다.`);
                }
                setCustomReportReason('');
              }}
              className="w-full"
              disabled={!customReportReason.trim()}
            >
              신고하기
            </Button>
          </div>
        ) : (
          <>
            {/* Story Header */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">{currentStory.userName}</h3>
                  <span className="text-xs text-muted-foreground/70">
                    {(() => {
                      // 사용자의 프로필 설정 가져오기
                      const savedProfile = localStorage.getItem("userProfile");
                      const profile = savedProfile ? JSON.parse(savedProfile) : {};
                      
                      // 현재 사용자의 게시글인 경우에만 공개 설정 적용
                      if (currentStory.userId === currentUserId) {
                        const showCity = profile.showCity !== false;
                        const showAgeGroup = profile.showAgeGroup !== false;
                        const showOccupation = profile.showOccupation !== false;
                        
                        const parts = [];
                        if (showCity) parts.push(currentStory.userCity);
                        if (showAgeGroup) parts.push(currentStory.userAgeGroup);
                        if (showOccupation) parts.push(currentStory.userOccupation);
                        
                        return parts.length > 0 ? `· ${parts.join(' · ')}` : '';
                      }
                      
                      // 다른 사용자의 게시글은 모두 표시
                      return `· ${currentStory.userCity} · ${currentStory.userAgeGroup} ${currentStory.userOccupation}`;
                    })()}
                  </span>
                </div>
                
                {/* More Options Button - Always show */}
                <button
                  ref={reportButtonRef}
                  onClick={() => {
                    setShowReportMenu(!showReportMenu);
                    setReportMenuStep('main');
                  }}
                  className="p-2 hover:bg-background/50 rounded-full transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
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
          </>
        )}

        {/* Back Button for report sub-menus */}
        <AnimatePresence>
          {showReportMenu && reportMenuStep !== 'main' && reportMenuStep !== 'writeReason' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
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
          {showReportMenu && reportMenuStep !== 'writeReason' && (
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
                      {isOwnStory ? (
                        /* 내 게시글: 수정하기 & 삭제하기 */
                        <>
                          {/* 게시글 수정하기 */}
                          <motion.button
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.05 }}
                            onClick={() => {
                              setShowReportMenu(false);
                              setReportMenuStep('main');
                              if (onEdit) {
                                onEdit(currentStory);
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
                            게시글 수정하기
                          </motion.button>

                          {/* 게시글 삭제하기 */}
                          <motion.button
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => {
                              setShowReportMenu(false);
                              setReportMenuStep('main');
                              setShowDeleteConfirm(true);
                            }}
                            className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02] text-red-600"
                            style={{
                              backgroundColor: 'rgba(254, 226, 226, 0.25)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(252, 165, 165, 0.15)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                            }}
                          >
                            게시글 삭제하기
                          </motion.button>
                        </>
                      ) : (
                        /* 다른 유저의 게시글: 신고/가리기/차단 메뉴 */
                        <>
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
                            유저 ��고하기
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
                                onHide(currentStory.id);
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
                                onBlockUser(currentStory.userId);
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
                            유저 차단기
                          </motion.button>
                        </>
                      )}
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
                            onReport(currentStory.id, 'inappropriate', '');
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
                            onReport(currentStory.id, 'abusive', '');
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
                            onReport(currentStory.id, 'spam', '');
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
                      {/* 괴롭힘 또는 혐오 발언 */}
                      <motion.button
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => {
                          setShowReportMenu(false);
                          setReportMenuStep('main');
                          if (onReportUser) {
                            onReportUser(currentStory.userId, currentStory.userName, 'harassment');
                          }
                          alert(`${currentStory.userName}님이 신고되었습.`);
                        }}
                        className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'rgba(235, 243, 250, 0.25)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(206, 222, 242, 0.15)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        괴롭힘 또는 혐오 발언
                      </motion.button>

                      {/* 사칭 */}
                      <motion.button
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => {
                          setShowReportMenu(false);
                          setReportMenuStep('main');
                          if (onReportUser) {
                            onReportUser(currentStory.userId, currentStory.userName, 'impersonation');
                          }
                          alert(`${currentStory.userName}님이 신고되었습니다.`);
                        }}
                        className="w-full px-4 py-3 rounded-lg text-center font-medium transition-all hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'rgba(235, 243, 250, 0.25)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(206, 222, 242, 0.15)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        사칭
                      </motion.button>

                      {/* 기타 */}
                      <motion.button
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
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

        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 flex items-center justify-center p-6 z-[9999]"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.01)'
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
                onClick={() => {
                  setShowDeleteConfirm(false);
                }}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl z-[10000]"
                style={{
                  backgroundColor: '#f5f3ed',
                  border: '1px solid #e8e6e0'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-center" style={{ color: '#1f2937' }}>
                    게시글을 삭제하시겠습니까?
                  </h3>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      if (onDelete) {
                        onDelete(currentStory.id);
                      }
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons - Hide when report menu is open */}
      <AnimatePresence>
        {!showReportMenu && currentIndex > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur hover:bg-background"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showReportMenu && currentIndex < stories.length - 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur hover:bg-background"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}