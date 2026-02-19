import { Bell, Heart, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Notification } from "../types";
import { ScrollArea } from "./ui/scroll-area";
import empathyIcon from "../assets/1cf87df5e848e0368281bc2ddabccc0ba1ece188.png";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function NotificationPanel({ notifications, onMarkAsRead, onClearAll, onOpenChange }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (isOpen) {
      // 닫을 때: 애니메이션 시작
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        onOpenChange?.(false);
      }, 300); // 애니메이션 시간과 동일
    } else {
      // 열 때
      setIsOpen(true);
      // 알림창을 열면 ��든 알림을 읽음 처리
      notifications.forEach((notification) => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
      });
      onOpenChange?.(true);
    }
  };
  
  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !isClosing) {
        const target = event.target as Node;
        // Check if click is outside both the panel and the button
        if (
          panelRef.current &&
          !panelRef.current.contains(target) &&
          buttonRef.current &&
          !buttonRef.current.contains(target)
        ) {
          handleToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isClosing]);

  const getTimeAgo = (date: Date) => {
    const now = Date.now();
    const then = date.getTime();
    const diffMs = now - then;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days <= 7) return `${days}일 전`;
    
    // 7일 이후: 날짜 표시 (YYYY.MM.DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 게시글 내용을 간략하게 표시 (절반 길이로)
  const getShortenedContent = (content: string) => {
    const maxLength = Math.floor(content.length / 2);
    // 최대 100자로 제한하여 2줄을 넘지 않도록
    const limitedLength = Math.min(maxLength, 100);
    if (content.length <= limitedLength) return content;
    return content.slice(0, limitedLength) + "...";
  };

  return (
    <>
      {/* Trigger Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={handleToggle}
        ref={buttonRef}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </>
        )}
      </Button>

      {/* Notification Panel */}
      {(isOpen || isClosing) && (
        createPortal(
          <div 
            className={`fixed left-0 right-0 flex flex-col mx-auto ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}
            style={{ 
              top: '73px', 
              bottom: '0px',
              zIndex: 50,
              maxWidth: 'min(100%, 600px)',
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
            }}
            ref={panelRef}
          >
            <div className="flex-shrink-0 px-6 py-4">
              <h2 className="text-lg font-semibold">알림</h2>
            </div>
            
            <div className="flex-1 overflow-hidden" style={{ marginBottom: '73px' }}>
              <ScrollArea className="h-full px-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mb-4 opacity-20" />
                    <p>알림이 없습니다</p>
                    <p className="text-sm mt-2">새로운 공감이나 응원이 오면 알려드릴게요!</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4 pb-6">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read ? "bg-[#faf8f3]" : "bg-[#faf8f3]/90"
                        }`}
                        style={{
                          borderColor: 'rgba(232, 230, 224, 0.5)',
                        }}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{notification.fromUserName}</span>
                              <span className="text-sm">
                                {notification.type === "empathy" ? (
                                  <>님이 공감 하였습니다.</>
                                ) : (
                                  <>님이 응원스티커를 보냈어요!</>
                                )}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          
                          {notification.type === "sticker" && (
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{notification.stickerEmoji}</span>
                              <span className="text-sm font-semibold">{notification.stickerMessage}</span>
                            </div>
                          )}
                          
                          {notification.type === "empathy" && (
                            <img src={empathyIcon} alt="공감" className="h-4 w-4" />
                          )}
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            "{getShortenedContent(notification.storyContent)}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Close Button at Bottom - Fixed above navigation */}
            <div 
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-4 cursor-pointer" 
              style={{ 
                height: '73px',
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              }}
              onClick={handleToggle}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>,
          document.body
        )
      )}

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-in;
        }
      `}</style>
    </>
  );
}