import * as React from "react";
import { cn } from "@/lib/utils";

interface SimpleCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const SimpleCard = React.forwardRef<HTMLDivElement, SimpleCardProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "bg-white border border-black rounded-lg shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
SimpleCard.displayName = "SimpleCard";

const SimpleCardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("p-0", className)}
        {...props}
    />
));
SimpleCardContent.displayName = "SimpleCardContent";

const SimpleCardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("p-4 pb-2", className)}
        {...props}
    />
));
SimpleCardHeader.displayName = "SimpleCardHeader";

const SimpleCardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
SimpleCardTitle.displayName = "SimpleCardTitle";

const SimpleCardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
SimpleCardDescription.displayName = "SimpleCardDescription";

export {
    SimpleCard,
    SimpleCardContent,
    SimpleCardHeader,
    SimpleCardTitle,
    SimpleCardDescription,
};
