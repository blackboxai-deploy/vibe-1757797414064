'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, GeneratedImage, UserSettings } from '@/lib/types';
import { storageManager } from '@/lib/storage';

// Action types
type AppAction =
  | { type: 'SET_IMAGES'; payload: GeneratedImage[] }
  | { type: 'ADD_IMAGE'; payload: GeneratedImage }
  | { type: 'DELETE_IMAGE'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_GENERATION_PROGRESS'; payload: { prompt: string; progress: number; status: string } }
  | { type: 'CLEAR_GENERATION_PROGRESS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'RESET_SETTINGS' };

// Initial state
const initialState: AppState = {
  images: [],
  isGenerating: false,
  settings: {
    theme: 'system',
    defaultAspectRatio: '1:1',
    defaultStyle: 'photorealistic',
    autoSave: true,
    showAdvancedControls: false
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_IMAGES':
      return { ...state, images: action.payload };

    case 'ADD_IMAGE':
      return { 
        ...state, 
        images: [action.payload, ...state.images] 
      };

    case 'DELETE_IMAGE':
      return {
        ...state,
        images: state.images.filter(img => img.id !== action.payload)
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        images: state.images.map(img =>
          img.id === action.payload 
            ? { ...img, isFavorite: !img.isFavorite }
            : img
        )
      };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_GENERATION_PROGRESS':
      return { 
        ...state, 
        currentGeneration: action.payload 
      };

    case 'CLEAR_GENERATION_PROGRESS':
      return { 
        ...state, 
        currentGeneration: undefined 
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: initialState.settings
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    addImage: (image: GeneratedImage) => void;
    deleteImage: (imageId: string) => void;
    toggleFavorite: (imageId: string) => void;
    setGenerating: (isGenerating: boolean) => void;
    setGenerationProgress: (progress: { prompt: string; progress: number; status: string }) => void;
    clearGenerationProgress: () => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    resetSettings: () => void;
  };
}

const AppContext = createContext<AppContextType | null>(null);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const images = storageManager.getImages();
    const settings = storageManager.getSettings();
    
    dispatch({ type: 'SET_IMAGES', payload: images });
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  // Action creators with side effects
  const actions = {
    addImage: (image: GeneratedImage) => {
      dispatch({ type: 'ADD_IMAGE', payload: image });
      if (state.settings.autoSave) {
        storageManager.saveImage(image);
      }
    },

    deleteImage: (imageId: string) => {
      dispatch({ type: 'DELETE_IMAGE', payload: imageId });
      storageManager.deleteImage(imageId);
    },

    toggleFavorite: (imageId: string) => {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: imageId });
      storageManager.toggleFavorite(imageId);
    },

    setGenerating: (isGenerating: boolean) => {
      dispatch({ type: 'SET_GENERATING', payload: isGenerating });
    },

    setGenerationProgress: (progress: { prompt: string; progress: number; status: string }) => {
      dispatch({ type: 'SET_GENERATION_PROGRESS', payload: progress });
    },

    clearGenerationProgress: () => {
      dispatch({ type: 'CLEAR_GENERATION_PROGRESS' });
    },

    updateSettings: (settings: Partial<UserSettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      storageManager.saveSettings(settings);
    },

    resetSettings: () => {
      dispatch({ type: 'RESET_SETTINGS' });
      storageManager.resetSettings();
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}