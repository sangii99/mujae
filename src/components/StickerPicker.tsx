import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { SUPPORT_STICKERS } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StickerPickerProps {
  onSendSticker: (emoji: string, message: string) => void;
  stickerCount: number;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  authorName?: string;
}

export function StickerPicker({ onSendSticker, stickerCount, disabled, onOpenChange, authorName }: StickerPickerProps) {
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [stickerSent, setStickerSent] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleSupportClick = () => {
    if (disabled || stickerCount === 0 || stickerSent) return;
    
    setShowStickerPicker(true);
    onOpenChange?.(true);
  };

  const handleSendSticker = (emoji: string, message: string) => {
    onSendSticker(emoji, message);
    setStickerSent(true);
    setShowStickerPicker(false);
    onOpenChange?.(false);
  };

  const handleClose = () => {
    setShowStickerPicker(false);
    onOpenChange?.(false);
  };

  const handleMouseEnter = () => {
    if (disabled || stickerCount === 0 || stickerSent) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showStickerPicker) return;
      
      const target = event.target as Node;
      
      // 패널 내부나 버튼 클릭은 무시
      if (
        (pickerRef.current && pickerRef.current.contains(target)) ||
        (buttonRef.current && buttonRef.current.contains(target))
      ) {
        return;
      }
      
      // 외부 클릭이면 패널 닫기
      handleClose();
    };

    if (showStickerPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStickerPicker]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // 스티커를 이미 보냈거나 disabled 상태인 경우
  if (disabled || stickerSent) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white cursor-default"
        disabled
      >
        <Sparkles className="h-4 w-4" />
        <span>응원 완료!</span>
      </Button>
    );
  }

  return (
    <>
      {!showStickerPicker && (
        <div className="relative inline-block">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={stickerCount === 0}
            onClick={handleSupportClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={buttonRef}
          >
            <Sparkles className="h-4 w-4" />
            <span>응원하기</span>
          </Button>
          {showTooltip && authorName && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap shadow-lg z-50"
            >
              {authorName}님에게 응원 스티커를 보내보세요!
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </motion.div>
          )}
        </div>
      )}

      {/* Sticker Picker Panel */}
      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            ref={pickerRef}
          >
            <div className="bg-[#ede8dc] border border-[#e0dbd0] rounded-lg p-3 shadow-md">
              <p className="text-sm font-medium mb-2.5">응원 스티커를 선택해주세요!</p>
              <div className="flex flex-col gap-2">
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
    </>
  );
}