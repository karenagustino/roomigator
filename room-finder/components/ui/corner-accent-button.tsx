'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CornerAccentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
}

export const CornerAccentButton = React.forwardRef<HTMLButtonElement, CornerAccentButtonProps>(({
    className,
    children = "Get Started",
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                "relative flex items-center px-6 py-3 overflow-hidden font-medium transition-all bg-indigo-500 rounded-md group",
                className
            )}
            {...props}
        >
            {/* Top right corner accent */}
            <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-mr-4 group-hover:-mt-4">
                <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
            </span>

            {/* Bottom left corner accent */}
            <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-ml-4 group-hover:-mb-4">
                <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
            </span>

            {/* Sliding background */}
            <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-indigo-600 rounded-md group-hover:translate-x-0" />

            {/* Button text */}
            <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">
                {children}
            </span>
        </button>
    );
});

CornerAccentButton.displayName = "CornerAccentButton";
