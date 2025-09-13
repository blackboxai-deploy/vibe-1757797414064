'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProgressIndicatorProps {
  isGenerating: boolean;
  progress?: {
    prompt: string;
    progress: number;
    status: string;
  };
  onCancel?: () => void;
}

export default function ProgressIndicator({
  isGenerating,
  progress,
  onCancel
}: ProgressIndicatorProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate progress smoothly
  useEffect(() => {
    if (progress?.progress) {
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          const diff = progress.progress - prev;
          if (Math.abs(diff) < 0.1) return progress.progress;
          return prev + diff * 0.1;
        });
      }, 50);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [progress?.progress]);

  // Animate loading dots
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setDots('');
    }
    return undefined;
  }, [isGenerating]);

  // Reset when not generating
  useEffect(() => {
    if (!isGenerating) {
      setAnimatedProgress(0);
    }
  }, [isGenerating]);

  if (!isGenerating && !progress) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Status and Progress */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <h3 className="font-medium text-sm">
                  {isGenerating ? 'Generating Image' : 'Generation Complete'}
                  {isGenerating && <span className="font-mono">{dots}</span>}
                </h3>
              </div>
              
              {progress?.status && (
                <p className="text-sm text-muted-foreground">
                  {progress.status}
                </p>
              )}

              {progress?.prompt && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  Prompt: "{progress.prompt}"
                </p>
              )}
            </div>

            {isGenerating && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="ml-4"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={animatedProgress} 
              className="w-full h-2" 
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {Math.round(animatedProgress)}% complete
              </span>
              {isGenerating && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Processing</span>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Time */}
          {isGenerating && (
            <div className="text-xs text-muted-foreground">
              Estimated time: 30-60 seconds
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}