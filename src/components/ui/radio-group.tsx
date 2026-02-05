import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/utils/cn"

const RadioGroupContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

export const RadioGroup: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    children: React.ReactNode;
}> = ({ value, onValueChange, className, children }) => {
    return (
        <RadioGroupContext.Provider value={{ value, onValueChange }}>
            <div className={cn("grid gap-2", className)} role="radiogroup">{children}</div>
        </RadioGroupContext.Provider>
    )
}

export const RadioGroupItem: React.FC<{
    value: string;
    id?: string;
    className?: string;
}> = ({ value, id, className }) => {
    const context = React.useContext(RadioGroupContext);
    const checked = context?.value === value;
    
    return (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            id={id}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
                className
            )}
            onClick={() => context?.onValueChange(value)}
        >
            {checked && <div className="h-2.5 w-2.5 fill-current text-current bg-current rounded-full" />}
        </button>
    )
}
