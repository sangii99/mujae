import { Bell, Heart, X } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Notification } from "../types";
import { ScrollArea } from "./ui/scroll-area";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function NotificationPanel({ notifications, onMarkAsRead, onClearAll, onOpenChange }: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // 알림창을 열면 모든 알림을 읽음 처리
      notifications.forEach((notification) => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
      });
    }
    onOpenChange?.(open);
  };

  const getTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "방금 전";
    if (hours === 1) return "1시간 전";
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "1일 전";
    return `${days}일 전`;
  };

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] bg-[#faf8f3]">
        <SheetHeader>
          <SheetTitle>알림</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>알림이 없습니다</p>
              <p className="text-sm mt-2">새로운 공감이나 응원이 오면 알려드릴게요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read ? "bg-background" : "bg-accent/50"
                  }`}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.fromUserAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {notification.fromUserName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {notification.type === "empathy" ? (
                          <Heart className="h-4 w-4 fill-current text-red-500" />
                        ) : (
                          <span className="text-lg">{notification.stickerEmoji}</span>
                        )}
                        <span className="font-medium">{notification.fromUserName}</span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm">
                        {notification.type === "empathy" ? (
                          <>님이 회원님의 이야기에 공감했습니다</>
                        ) : (
                          <>님이 응원을 보냈어요!</>
                        )}
                      </p>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        "{notification.storyContent}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}