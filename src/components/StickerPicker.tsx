import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { SUPPORT_STICKERS } from "../types";

interface StickerPickerProps {
  onSendSticker: (emoji: string, message: string) => void;
  stickerCount: number;
  disabled?: boolean;
}

export function StickerPicker({ onSendSticker, stickerCount, disabled }: StickerPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string, message: string) => {
    onSendSticker(emoji, message);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={disabled || stickerCount === 0}
        >
          <Sparkles className="h-4 w-4" />
          <span>응원하기</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>응원 스티커 보내기</DialogTitle>
          <DialogDescription>
            따뜻한 응원 메시지를 선택해서 보내보세요. (남은 스티커: {stickerCount}개)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-4">
          {SUPPORT_STICKERS.map((sticker) => (
            <Button
              key={sticker.message}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:bg-accent hover:scale-105 transition-all"
              onClick={() => handleSelect(sticker.emoji, sticker.message)}
            >
              <span className="text-3xl">{sticker.emoji}</span>
              <span className="text-sm">{sticker.message}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}