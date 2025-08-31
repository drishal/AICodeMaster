import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollableCardProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function ScrollableCard({ children, className, maxHeight = "70vh" }: ScrollableCardProps) {
  return (
    <div 
      className={cn(
        "scrollable-card",
        "overflow-y-auto overflow-x-hidden",
        "scroll-smooth",
        "px-1",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}

export default ScrollableCard;