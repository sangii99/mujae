import { Badge } from "./ui/badge";
import { AVAILABLE_CATEGORIES } from "../types";

interface CategoryFilterProps {
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategories, onToggleCategory }: CategoryFilterProps) {
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
        {AVAILABLE_CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onToggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
}
