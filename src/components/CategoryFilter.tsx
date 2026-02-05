import React from "react";
import { AVAILABLE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface CategoryFilterProps {
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onToggleCategory,
  onClearCategories
}) => {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      <Button
        variant={selectedCategories.length === 0 ? "default" : "outline"}
        size="sm"
        onClick={onClearCategories}
        className="rounded-full"
      >
        전체
      </Button>
      {AVAILABLE_CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={selectedCategories.includes(category) ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleCategory(category)}
          className={cn(
             "rounded-full transition-all",
             selectedCategories.includes(category) 
                ? "bg-slate-800 text-white hover:bg-slate-900" 
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
