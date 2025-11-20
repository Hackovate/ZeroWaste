import React, { useId } from 'react';
import { cn } from './utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ className, size = 'md', color = '#F55951' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const uniqueId = useId().replace(/:/g, '-');
  const clipPathId = `pacman-${uniqueId}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pacman-dot-${uniqueId} {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        `
      }} />
      
      <div
        className={cn(
          'relative flex items-center gap-1',
          className
        )}
        role="status"
        aria-label="Loading"
      >
        {/* Pacman with animated mouth */}
        <svg
          className={cn(sizeClasses[size], 'flex-shrink-0')}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={clipPathId}>
              <path d="M 50 50 L 50 0 A 50 50 0 1 1 50 100 Z">
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  values="0 50 50;45 50 50;0 50 50"
                  dur="0.6s"
                  repeatCount="indefinite"
                />
              </path>
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipPathId})`}>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill={color}
            />
          </g>
        </svg>
        
        {/* Animated dots */}
        <div className="flex items-center gap-1 ml-1">
          <div
            className={cn('rounded-full', dotSizeClasses[size])}
            style={{ 
              backgroundColor: color,
              animation: `pacman-dot-${uniqueId} 0.6s ease-in-out infinite`,
              animationDelay: '0s'
            }}
          />
          <div
            className={cn('rounded-full', dotSizeClasses[size])}
            style={{ 
              backgroundColor: color,
              animation: `pacman-dot-${uniqueId} 0.6s ease-in-out infinite`,
              animationDelay: '0.2s'
            }}
          />
          <div
            className={cn('rounded-full', dotSizeClasses[size])}
            style={{ 
              backgroundColor: color,
              animation: `pacman-dot-${uniqueId} 0.6s ease-in-out infinite`,
              animationDelay: '0.4s'
            }}
          />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function LoadingSkeleton({ className, variant = 'rectangular' }: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'h-12 w-12 rounded-full',
    rectangular: 'h-24 w-full',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label="Loading content"
    />
  );
}

export function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" color="#F55951" />
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Loading ZeroWaste</h3>
          <p className="text-sm text-muted-foreground">Please wait...</p>
        </div>
      </div>
    </div>
  );
}

export function ComponentLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="md" color="#F55951" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
