// Core types for AI Image Generation App

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
  settings: GenerationSettings;
  isFavorite?: boolean;
}

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
  style?: GenerationStyle;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type GenerationStyle = 'photorealistic' | 'artistic' | 'abstract' | 'anime' | 'digital-art';

export interface GenerationRequest {
  prompt: string;
  settings: GenerationSettings;
}

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface AppState {
  images: GeneratedImage[];
  isGenerating: boolean;
  currentGeneration?: {
    prompt: string;
    progress: number;
    status: string;
  };
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultAspectRatio: AspectRatio;
  defaultStyle: GenerationStyle;
  autoSave: boolean;
  showAdvancedControls: boolean;
}

export interface AIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

// Utility type for async operations
export type AsyncState<T> = {
  data?: T;
  loading: boolean;
  error?: string;
};