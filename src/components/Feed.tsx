import { Story } from "../types";
import { StoryCard } from "./StoryCard";
import { EncouragementCard } from "./EncouragementCard";
import { encouragementMessages } from "../utils/encouragementMessages";
import { FullScreenStoryView } from "./FullScreenStoryView";

interface FeedProps {
  stories: Story[];
  onEmpathize: (storyId: string) => void;
  onSendSticker: (storyId: string, emoji: string, message: string) => void;
  currentUserId: string;
  currentUserStickerCount: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  onStickerPickerOpenChange?: (open: boolean) => void;
  fullScreenMode?: boolean;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onReport?: (storyId: string, reason: string, details?: string) => void;
  onHide?: (storyId: string) => void;
  onUnhide?: (storyId: string) => void;
  onBlockUser?: (userId: string) => void;
  onUnblockUser?: (userId: string) => void;
  onReportUser?: (userId: string, userName: string, reason: string, details?: string) => void;
  hiddenStoryIds?: string[];
  blockedUserIds?: string[];
}

export function Feed({ stories, onEmpathize, onSendSticker, currentUserId, currentUserStickerCount, fontSize = 16, fontWeight = "normal", onStickerPickerOpenChange, fullScreenMode = false, onEdit, onDelete, onReport, onHide, onUnhide, onBlockUser, onUnblockUser, onReportUser, hiddenStoryIds = [], blockedUserIds = [] }: FeedProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>이야기가 없습니다. 첫 번째로 이야기를 공유해보세요!</p>
      </div>
    );
  }

  // Full screen mode for grateful stories
  if (fullScreenMode) {
    return (
      <FullScreenStoryView
        stories={stories}
        onEmpathize={onEmpathize}
        currentUserId={currentUserId}
        fontSize={fontSize}
        fontWeight={fontWeight}
        onEdit={onEdit}
        onDelete={onDelete}
        onReport={onReport}
        onHide={onHide}
        onBlockUser={onBlockUser}
        onReportUser={onReportUser}
      />
    );
  }

  // Regular card mode for worry stories
  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <div key={story.id}>
          <StoryCard
            story={story}
            onEmpathize={onEmpathize}
            onSendSticker={onSendSticker}
            currentUserId={currentUserId}
            currentUserStickerCount={currentUserStickerCount}
            fontSize={fontSize}
            fontWeight={fontWeight}
            onStickerPickerOpenChange={onStickerPickerOpenChange}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            onHide={onHide}
            onUnhide={onUnhide}
            onBlockUser={onBlockUser}
            onUnblockUser={onUnblockUser}
            onReportUser={onReportUser}
            hiddenStoryIds={hiddenStoryIds}
            blockedUserIds={blockedUserIds}
          />
          {(index + 1) % 8 === 0 && index < stories.length - 1 && (
            <EncouragementCard
              key={`encouragement-${index}`}
              message={encouragementMessages[Math.floor((index + 1) / 8 - 1) % encouragementMessages.length].text}
            />
          )}
        </div>
      ))}
    </div>
  );
}