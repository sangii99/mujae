import React from "react";
import { Story } from "@/types";
import { StoryCard } from "@/components/StoryCard";
import { EncouragementCard } from "@/components/EncouragementCard";
import { motion } from "motion/react";

interface FeedProps {
  stories: Story[];
  currentUserId: string;
  fontSize: number;
  onEmpathize: (storyId: string) => void;
  onSendSticker: (storyId: string, emoji: string, message: string) => void;
  onStickerPickerOpenChange?: (isOpen: boolean) => void;
}

export const Feed: React.FC<FeedProps> = ({
  stories,
  currentUserId,
  fontSize,
  onEmpathize,
  onSendSticker,
  onStickerPickerOpenChange,
}) => {
  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="text-4xl">📭</div>
        <p className="text-muted-foreground">아직 이야기가 없네요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {stories.map((story, index) => (
        <React.Fragment key={story.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <StoryCard
              story={story}
              currentUserId={currentUserId}
              fontSize={fontSize}
              onEmpathize={onEmpathize}
              onSendSticker={onSendSticker}
              onStickerPickerOpenChange={onStickerPickerOpenChange}
            />
          </motion.div>
          {(index + 1) % 4 === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <EncouragementCard />
              </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
