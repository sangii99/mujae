import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { SUPPORT_STICKERS } from "@/types";

interface StickerPickerProps {
  onSendSticker: (emoji: string, message: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  disabled?: boolean;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onSendSticker,
  onOpenChange,
  disabled = false,
}) => {
  const [showSticker, setShowSticker] = useState(false);
  const [currentStickerIndex, setCurrentStickerIndex] = useState(0);
  const [stickerSent, setStickerSent] = useState(false);

  const handleSupportClick = () => {
    setShowSticker(true);
    onOpenChange?.(true);
  };

  const handleNextSticker = () => {
    setCurrentStickerIndex((prev) => (prev + 1) % SUPPORT_STICKERS.length);
  };

  const handleSendCurrentSticker = () => {
    const currentSticker = SUPPORT_STICKERS[currentStickerIndex];
    onSendSticker(currentSticker.emoji, currentSticker.message);
    setStickerSent(true);
    setShowSticker(false);
    setCurrentStickerIndex(0);
    onOpenChange?.(false);
  };

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

  const currentSticker = SUPPORT_STICKERS[currentStickerIndex];

  return (
    <div className="relative inline-block" style={{ perspective: "600px" }}>
      <AnimatePresence mode="wait" initial={false}>
        {!showSticker ? (
          <motion.div
            key="support-button"
            exit={{
              rotateX: -90,
              transformOrigin: "center bottom",
            }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <Button onClick={handleSupportClick} variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" /> 
              <span>응원하기</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="sticker-button"
            initial={{
              rotateX: 90,
              transformOrigin: "center top",
            }}
            animate={{
              rotateX: 0,
              transformOrigin: "center top",
            }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="relative">
              <Button onClick={handleSendCurrentSticker} size="sm" className="gap-2 px-6">
                <span className="text-xl">{currentSticker.emoji}</span>
                <span>{currentSticker.message}</span>
              </Button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextSticker();
                }}
                className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm hover:bg-primary/90 transition-colors"
                aria-label="Change Sticker"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
