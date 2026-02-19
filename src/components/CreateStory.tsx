import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { AVAILABLE_CATEGORIES, Story } from "../types";
import { X, ArrowLeft, ArrowRight, FolderOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

interface CreateStoryProps {
  onCreateStory: (content: string, categories: string[], feedType: "worry" | "grateful", isPublic: boolean) => void;
  onUpdateStory?: (storyId: string, content: string, categories: string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentTab: string;
  editingStory?: Story | null;
}

interface DraftData {
  content: string;
  categories: string[];
  feedType: "worry" | "grateful";
  isPublic: boolean;
  savedAt: number;
}

export function CreateStory({ onCreateStory, onUpdateStory, open, onOpenChange, currentTab, editingStory }: CreateStoryProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showLoadDraftDialog, setShowLoadDraftDialog] = useState(false);
  const [showOverwriteDraftDialog, setShowOverwriteDraftDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false); // 임시 저장된 글을 불러왔는지 추적
  const [showCategoryLimitMessage, setShowCategoryLimitMessage] = useState(false); // 카테고리 제한 메시지
  
  const MAX_CHARS = 750;
  const DRAFT_EXPIRY_DAYS = 30;
  const MAX_CATEGORIES = 5;
  
  // 현재 탭에 따라 feedType 자동 결정
  const feedType: "worry" | "grateful" = currentTab === "grateful" ? "grateful" : "worry";

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load draft from localStorage
  const loadDraft = () => {
    const draftStr = localStorage.getItem("storyDraft");
    if (draftStr) {
      const draft: DraftData = JSON.parse(draftStr);
      const daysSinceCreation = (Date.now() - draft.savedAt) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCreation < DRAFT_EXPIRY_DAYS) {
        setContent(draft.content);
        setSelectedCategories(draft.categories);
        setIsPublic(draft.isPublic);
        setIsDraftLoaded(true); // 임시 저장된 글을 불러왔음을 표시
      } else {
        localStorage.removeItem("storyDraft");
      }
    }
  };

  // Save draft to localStorage
  const saveDraft = () => {
    if (content.trim()) {
      const draft: DraftData = {
        content,
        categories: selectedCategories,
        feedType,
        isPublic,
        savedAt: Date.now(),
      };
      localStorage.setItem("storyDraft", JSON.stringify(draft));
    }
  };

  // Delete draft
  const deleteDraft = () => {
    localStorage.removeItem("storyDraft");
  };

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
        onCreateStory(content, selectedCategories, feedType, isPublic);
      }
      deleteDraft(); // 작성 완료 시 임시저장 삭제
      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  // 감사와 따뜻함 탭에서는 카테고리 없이 바로 제출
  const handleGratefulSubmit = () => {
    if (content.trim() && content.length <= MAX_CHARS) {
      if (editingStory && onUpdateStory) {
        onUpdateStory(editingStory.id, content, []);
      } else {
        onCreateStory(content, [], feedType, true); // 카테고리 빈 배열, 항상 전체공개
      }
      deleteDraft();
      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // 이미 선택된 카테고리는 제거
        return prev.filter((c) => c !== category);
      } else {
        // 새로운 카테고리 추가 시도
        if (prev.length >= MAX_CATEGORIES) {
          // 최대 개수 초과 시 알림 표시
          setShowCategoryLimitMessage(true);
          setTimeout(() => {
            setShowCategoryLimitMessage(false);
          }, 2000);
          return prev;
        }
        return [...prev, category];
      }
    });
  };

  const resetForm = () => {
    setContent("");
    setSelectedCategories([]);
    setIsPublic(true);
    setStep(1);
    setIsDraftLoaded(false); // 초기화 시 draft 로드 상태도 리셋
  };

  const handleClose = () => {
    // 수정 모드일 때는 바로 닫기 (임시 저장 없음)
    if (editingStory) {
      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
      return;
    }
    
    // 작성 중인 내용이 있거나 임시 저장된 글 불러온 경우
    if (content.trim() || isDraftLoaded) {
      setShowExitDialog(true);
    } else {
      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const handleSaveDraftAndClose = () => {
    // 이미 임시 저장된 글이 있는지 확인
    const existingDraft = localStorage.getItem("storyDraft");
    if (existingDraft) {
      // 이미 임시 저장이 있으면 덮어쓰기 확인 다이얼로그 표시
      setShowExitDialog(false);
      setShowOverwriteDraftDialog(true);
    } else {
      // 임시 저장이 없으면 바로 저장
      saveDraft();
      setShowExitDialog(false);
      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const handleOverwriteDraft = () => {
    deleteDraft(); // 기존 임시 저장 삭제
    saveDraft(); // 새로 ��장
    setShowOverwriteDraftDialog(false);
    resetForm();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCancelOverwrite = () => {
    setShowOverwriteDraftDialog(false);
    // 다시 Exit Dialog로 돌아가기
    setShowExitDialog(true);
  };

  const handleDeleteAndClose = () => {
    setShowExitDialog(false);
    resetForm();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // 임시 저장된 글의 남은 날짜 계산
  const getDraftDaysRemaining = (): number => {
    const draftStr = localStorage.getItem("storyDraft");
    if (draftStr) {
      const draft: DraftData = JSON.parse(draftStr);
      const daysSinceCreation = (Date.now() - draft.savedAt) / (1000 * 60 * 60 * 24);
      const daysRemaining = Math.max(0, Math.ceil(DRAFT_EXPIRY_DAYS - daysSinceCreation));
      return daysRemaining;
    }
    return 0;
  };

  useEffect(() => {
    if (editingStory) {
      setContent(editingStory.content);
      setSelectedCategories(editingStory.categories);
      setIsPublic(editingStory.isPublic ?? true);
      setStep(1); // 수정 시 1단계(글 작성)부터 시작
    } else if (open) {
      // 새 게시글 작성 시
      setStep(1);
    }
  }, [editingStory, open]);

  if (!open) return null;

  // Mobile Full Screen View
  if (isMobile) {
    return (
      <>
        {/* Category Limit Message - Mobile */}
        <AnimatePresence>
          {showCategoryLimitMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 0 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: [0, -10, 10, -8, 8, -5, 5, 0] // 좌우 흔들림 효과
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                opacity: { duration: 0.2 },
                y: { duration: 0.2 },
                x: { duration: 0.5, times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1] }
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-black/80 text-white px-6 py-3 rounded-lg shadow-lg whitespace-nowrap text-sm"
            >
              카테고리 선택은 최대 5개까지 가능합니다.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Overlay - Mobile - Doesn't cover bottom nav */}
        <div className="fixed top-0 left-0 right-0 bottom-16 z-[70] bg-[#f5f3ed]">
          <AnimatePresence mode="wait">
            {/* Step 1: 글 작성 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* Header */}
                <div className="flex-shrink-0 px-4 py-4 border-b border-[#e8e6e0] bg-[#f5f3ed] flex items-center justify-between">
                  <button
                    onClick={() => {
                      const hasDraft = localStorage.getItem("storyDraft");
                      if (hasDraft) {
                        setShowLoadDraftDialog(true);
                      }
                    }}
                    disabled={!localStorage.getItem("storyDraft") || editingStory !== null}
                    className={`p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      editingStory ? 'invisible' : ''
                    }`}
                  >
                    <FolderOpen className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-bold">
                    {editingStory ? "게시글 수정" : "새 게시글 작성"}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Area - Expanded */}
                <div className="flex-1 px-4 py-4 overflow-y-auto bg-white/50 backdrop-blur">
                  <Textarea
                    placeholder={
                      feedType === "worry"
                        ? "오늘 나는 걱정이 되는 게... / 요즘 힘든 게... / 불안한 일이..."
                        : "오늘 감사했던 일은... / 따뜻했던 순간... / 행복했던 경험..."
                    }
                    value={content}
                    onChange={handleContentChange}
                    className="min-h-full resize-none border-none bg-transparent shadow-none focus-visible:ring-0 text-base"
                    maxLength={MAX_CHARS}
                    autoFocus
                  />
                </div>

                {/* Floating Next Button */}
                <button
                  onClick={() => feedType === "grateful" ? handleGratefulSubmit() : setStep(2)}
                  disabled={!content.trim() || content.length > MAX_CHARS}
                  className="fixed bottom-24 right-6 w-12 h-12 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center z-10"
                >
                  {feedType === "grateful" ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 2: 카테고리 및 공개 설정 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* Header */}
                <div className="flex-shrink-0 px-4 py-4 border-b border-[#e8e6e0] bg-[#f5f3ed] flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-bold">카테고리 선택</h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 px-4 py-6 overflow-y-auto pb-32 space-y-6 bg-white/50 backdrop-blur">
                  {/* 공개 설정 */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">공개 설정</label>
                    <div className="flex gap-2">
                      <Button
                        variant={isPublic ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setIsPublic(true)}
                      >
                        전체공개
                      </Button>
                      <Button
                        variant={!isPublic ? "default" : "outline"}
                        className={`flex-1 ${
                          !isPublic 
                            ? 'bg-[#6b4c7a] hover:bg-[#5a3e66] text-white border-[#6b4c7a]' 
                            : ''
                        }`}
                        onClick={() => setIsPublic(false)}
                      >
                        나만보기
                      </Button>
                    </div>
                  </div>

                  {/* 카테고리 선택 */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      이야기와 관련된 카테고리를 선택하세요 (최소 1개)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_CATEGORIES.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1.5"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-[#e8e6e0] bg-[#f5f3ed]">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white"
                      onClick={handleClose}
                    >
                      취소
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={selectedCategories.length === 0}
                    >
                      {editingStory ? "수정 완료" : "공유하기"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="max-w-sm bg-[#faf8f3] border-[#e8e6e0] z-[80]">
            <AlertDialogHeader>
              <AlertDialogTitle>성 중인 내용이 있습니다</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                지금 돌아가면 작성한 내용이 삭제됩니다. 작성 중인 내용을 임시 저장하시겠습니까?
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  (임시 저장 가능한 글은 1회이��, 임시 저장된 글은 30일 뒤 자동으로 삭제됩니다.)
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <div className="flex gap-2 w-full">
                <AlertDialogAction
                  onClick={handleDeleteAndClose}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  삭제
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={handleSaveDraftAndClose}
                  className="flex-1"
                >
                  임시 저장
                </AlertDialogAction>
              </div>
              <AlertDialogCancel className="w-full m-0">취소</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Load Draft Confirmation Dialog */}
        <AlertDialog open={showLoadDraftDialog} onOpenChange={setShowLoadDraftDialog}>
          <AlertDialogContent className="max-w-sm bg-[#faf8f3] border-[#e8e6e0] z-[80]">
            <AlertDialogHeader>
              <AlertDialogTitle>임시 저장된 글</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                임시 저장한 이전 글을 불러오시겠습니까?
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  ({getDraftDaysRemaining()}일 후 임시 저장된 글이 자동으로 삭제됩니다.)
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>아니오</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  loadDraft();
                  setShowLoadDraftDialog(false);
                }}
              >
                예
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Overwrite Draft Confirmation Dialog */}
        <AlertDialog open={showOverwriteDraftDialog} onOpenChange={setShowOverwriteDraftDialog}>
          <AlertDialogContent className="max-w-sm bg-[#faf8f3] border-[#e8e6e0] z-[80]">
            <AlertDialogHeader>
              <AlertDialogTitle>임시 저장된 글 덮어쓰기</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                이미 임시 저장된 글이 있습니다. 새로운 내용으로 덮어쓰시겠습니까?
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  (임시 저장 가능한 글은 1회이며, 임시 저장된 글은 30일 뒤 자동으로 삭제됩니다.)
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <div className="flex gap-2 w-full">
                <AlertDialogAction
                  onClick={handleCancelOverwrite}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={handleOverwriteDraft}
                  className="flex-1"
                >
                  덮어쓰기
                </AlertDialogAction>
              </div>
              <AlertDialogCancel className="w-full m-0">닫기</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Desktop Dialog View
  return (
    <>
      {/* Category Limit Message - Desktop */}
      <AnimatePresence>
        {showCategoryLimitMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              x: [0, -10, 10, -8, 8, -5, 5, 0] // 좌우 흔들림 효과
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              opacity: { duration: 0.2 },
              y: { duration: 0.2 },
              x: { duration: 0.5, times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1] }
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-black/80 text-white px-6 py-3 rounded-lg shadow-lg whitespace-nowrap"
          >
            카테고리 선택은 최대 5개까지 가능합니다.
          </motion.div>
        )}
      </AnimatePresence>

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
                    ? (editingStory ? "당신의 걱정과 불안을 수정하여 들려주세요." : "당신의 걱정과 불안을 들려주세요.")
                    : (editingStory ? "당신의 감사와 따뜻한 경험을 수정하여 들려주세요." : "당신의 감사와 따뜻한 경험을 들려주세요.")}
                </label>
                {feedType === "worry" && (
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
                )}
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
            
            {feedType === "worry" && (
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
            )}
          </div>
          
          <div className="flex gap-2 justify-end flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
              취소
            </Button>
            <Button 
              onClick={feedType === "grateful" ? handleGratefulSubmit : handleSubmit}
              disabled={feedType === "grateful" ? !content.trim() : (!content.trim() || selectedCategories.length === 0)}
            >
              {editingStory ? "수정 완료" : "공유하기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}