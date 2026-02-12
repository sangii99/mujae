import { Sparkles } from "lucide-react";

interface EncouragementCardProps {
  message: string;
}

export function EncouragementCard({ message }: EncouragementCardProps) {
  return (
    <div className="my-8 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-lg text-amber-900 leading-relaxed italic">
            "{message}"
          </p>
        </div>
      </div>
    </div>
  );
}
