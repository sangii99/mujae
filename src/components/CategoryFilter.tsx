import { Badge } from "./ui/badge";
import { AVAILABLE_CATEGORIES } from "../types";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryFilterProps {
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategories, onToggleCategory }: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false);
  
  // "모든 이야기" 포함 총 10개까지 노출
  const allItems = ["all", ...AVAILABLE_CATEGORIES];
  const visibleCount = showAll ? allItems.length : 10;
  const hasMore = allItems.length > 10;

  return (
    <div className="space-y-3">
      <h3 className="font-medium">카테고리별 필터</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategories.length === 0 ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onToggleCategory("all")}
        >
          모든 이야기
        </Badge>
        {AVAILABLE_CATEGORIES.slice(0, showAll ? AVAILABLE_CATEGORIES.length : 9).map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onToggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
        {hasMore && !showAll && (
          <Badge
            variant="outline"
            className="cursor-pointer gap-1 text-muted-foreground hover:bg-accent"
            onClick={() => setShowAll(true)}
          >
            <ChevronDown className="h-3 w-3" />
            더보기
          </Badge>
        )}
        {hasMore && showAll && (
          <Badge
            variant="outline"
            className="cursor-pointer gap-1 text-muted-foreground hover:bg-accent"
            onClick={() => setShowAll(false)}
          >
            <ChevronUp className="h-3 w-3" />
            접기
          </Badge>
        )}
      </div>
    </div>
  );
}