import { Story } from "../types";
import { StoryCard } from "./StoryCard";
import { EncouragementCard } from "./EncouragementCard";
import { encouragementMessages } from "../utils/encouragementMessages";

interface FeedProps {
  stories: Story[];
  onEmpathize: (storyId: string) => void;
  onSendSticker: (storyId: string, emoji: string, message: string) => void;
  currentUserId: string;
  currentUserStickerCount: number;
  fontSize?: number;
}

export function Feed({ stories, onEmpathize, onSendSticker, currentUserId, currentUserStickerCount, fontSize = 16 }: FeedProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>이야기가 없습니다. 첫 번째로 이야기를 공유해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <>
          <StoryCard
            key={story.id}
            story={story}
            onEmpathize={onEmpathize}
            onSendSticker={onSendSticker}
            currentUserId={currentUserId}
            currentUserStickerCount={currentUserStickerCount}
            fontSize={fontSize}
          />
          {(index + 1) % 4 === 0 && index < stories.length - 1 && (
            <EncouragementCard
              key={`encouragement-${index}`}
              message={encouragementMessages[Math.floor((index + 1) / 4 - 1) % encouragementMessages.length].text}
            />
          )}
        </>
      ))}
    </div>
  );
}