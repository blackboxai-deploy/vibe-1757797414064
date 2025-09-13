'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const PROMPT_SUGGESTIONS = [
  'a beautiful sunset over mountains',
  'cyberpunk city at night',
  'abstract geometric patterns',
  'portrait of a wise old wizard',
  'futuristic spacecraft in space',
  'peaceful garden with flowers',
  'dramatic storm clouds',
  'minimalist modern architecture'
];

const STYLE_KEYWORDS = [
  'photorealistic', 'artistic', 'abstract', 'minimalist',
  'vintage', 'modern', 'dramatic', 'peaceful',
  'colorful', 'monochrome', 'bright', 'dark'
];

export default function PromptInput({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false,
  placeholder = "Describe the image you want to generate..."
}: PromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        // Submit with Enter
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSubmit();
        }
      }
    }
  };

  const insertSuggestion = (suggestion: string) => {
    const newValue = value ? `${value}, ${suggestion}` : suggestion;
    onChange(newValue);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const toggleKeyword = (keyword: string) => {
    const isSelected = selectedKeywords.includes(keyword);
    let newKeywords: string[];
    
    if (isSelected) {
      newKeywords = selectedKeywords.filter(k => k !== keyword);
      // Remove from prompt
      const regex = new RegExp(`\\b${keyword}\\b,?\\s*`, 'gi');
      onChange(value.replace(regex, '').replace(/,\s*,/g, ',').trim());
    } else {
      newKeywords = [...selectedKeywords, keyword];
      // Add to prompt
      const newValue = value ? `${value}, ${keyword}` : keyword;
      onChange(newValue);
    }
    
    setSelectedKeywords(newKeywords);
  };

  const clearPrompt = () => {
    onChange('');
    setSelectedKeywords([]);
  };

  return (
    <div className="space-y-4">
      {/* Main prompt input */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[100px] max-h-[300px] resize-none pr-20"
        />
        
        {/* Character count and clear button */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {value.length}/500
          </span>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearPrompt}
              disabled={disabled}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Style keywords */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">Style Keywords:</div>
        <div className="flex flex-wrap gap-2">
          {STYLE_KEYWORDS.map((keyword) => (
            <Badge
              key={keyword}
              variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSuggestions(!showSuggestions)}
          disabled={disabled}
        >
          {showSuggestions ? 'Hide' : 'Show'} Suggestions
        </Button>

        {showSuggestions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border rounded-lg bg-muted/50">
            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => insertSuggestion(suggestion)}
                disabled={disabled}
              >
                <span className="text-sm">{suggestion}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Submit button and tips */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Enter</kbd> to generate,{' '}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Shift</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Enter</kbd> for new line
        </div>
        
        <Button 
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="min-w-[100px]"
        >
          {disabled ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
}