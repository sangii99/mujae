import * as React from "react"
import { cn } from "@/utils/cn"

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange([parseFloat(e.target.value)]);
    };
    
    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
             {/* Native range input hidden on top for functionality */}
             <input 
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={handleChange}
                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
             />
          <div className="absolute h-full bg-primary" style={{ width: `${percentage}%` }} />
        </div>
        <div
            className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-10 pointer-events-none"
             style={{ 
                 position: 'absolute',
                 left: `calc(${percentage}% - 10px)`
             }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
