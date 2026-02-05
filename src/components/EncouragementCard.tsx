import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { getRandomEncouragementMessage } from "@/utils/encouragementMessages";

export const EncouragementCard: React.FC = () => {
  const message = useMemo(() => getRandomEncouragementMessage(), []);

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 my-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <p className="text-lg font-medium text-blue-900 break-keep">
          {message}
        </p>
        <p className="text-sm text-blue-700 mt-4">
          - 무제 팀 드림 💙
        </p>
      </div>
    </Card>
  );
};
