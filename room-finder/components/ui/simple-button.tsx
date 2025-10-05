import * as React from "react";
import { cn } from "@/lib/utils";

interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost" | "outline";
    size?: "default" | "sm" | "lg";
}

const SimpleButton = React.forwardRef<HTMLButtonElement, SimpleButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border-2 border-black";

        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700 border-black",
            ghost: "hover:bg-gray-100 hover:text-gray-900 border-black",
            outline: "border border-black bg-white hover:bg-gray-50 hover:text-gray-900",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-sm",
            lg: "h-12 px-8",
        };

        return (
            <button
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
SimpleButton.displayName = "SimpleButton";

export { SimpleButton };
