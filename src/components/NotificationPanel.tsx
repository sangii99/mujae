import React, { useRef, useEffect } from "react";
import { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/cn";
import { getTimeAgo } from "@/utils/time";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
       <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 z-50 rounded-lg border bg-white shadow-xl"
            style={{ transformOrigin: "top right" }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold">알림</h4>
              {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={onClearAll} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                    모두 지우기
                  </Button>
              )}
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  새로운 알림이 없습니다.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => onMarkAsRead(notif.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
                        !notif.read && "bg-blue-50/60"
                      )}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={notif.fromUserAvatar} />
                        <AvatarFallback>{notif.fromUserName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-tight">
                          <span className="font-semibold">{notif.fromUserName}</span> 님이
                          {notif.type === "sticker" ? (
                            <>
                                <span className="mx-1">{notif.stickerEmoji}</span>
                                <span>{notif.stickerMessage}</span> 스티커를 보냈습니다
                            </>
                          ) : (
                            " 공감했습니다"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 border-l-2 border-border pl-2 my-1">
                          {notif.storyContent}
                        </p>
                        <span className="text-xs text-muted-foreground">{getTimeAgo(notif.createdAt)}</span>
                      </div>
                      {!notif.read && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
