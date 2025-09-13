'use client';

import { useState, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { aiImageClient } from '@/lib/ai-client';
import type { GenerationRequest, GeneratedImage } from '@/lib/types';

export function useImageGeneration() {
  const { state, actions } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (request: GenerationRequest) => {
    if (state.isGenerating) {
      return; // Prevent multiple concurrent generations
    }

    setError(null);
    actions.setGenerating(true);
    
    // Set initial progress
    actions.setGenerationProgress({
      prompt: request.prompt,
      progress: 10,
      status: 'Initializing generation...'
    });

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 25, status: 'Processing prompt...' },
        { progress: 50, status: 'Generating image...' },
        { progress: 75, status: 'Finalizing results...' }
      ];

      // Update progress with delays
      for (const step of progressSteps) {
        actions.setGenerationProgress({
          prompt: request.prompt,
          ...step
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Make the actual API call
      const response = await aiImageClient.generateImage(request);

      if (!response.success) {
        throw new Error(response.error || 'Generation failed');
      }

      if (!response.imageUrl) {
        throw new Error('No image URL received');
      }

      // Create the generated image object
      const generatedImage: GeneratedImage = {
        id: crypto.randomUUID(),
        prompt: request.prompt,
        imageUrl: response.imageUrl,
        timestamp: new Date(),
        settings: request.settings,
        isFavorite: false
      };

      // Add to state and storage
      actions.addImage(generatedImage);
      
      // Complete progress
      actions.setGenerationProgress({
        prompt: request.prompt,
        progress: 100,
        status: 'Generation complete!'
      });

      // Clear progress after a short delay
      setTimeout(() => {
        actions.clearGenerationProgress();
      }, 2000);

      return generatedImage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      actions.setGenerationProgress({
        prompt: request.prompt,
        progress: 0,
        status: `Error: ${errorMessage}`
      });

      // Clear progress and error after delay
      setTimeout(() => {
        actions.clearGenerationProgress();
        setError(null);
      }, 5000);

      throw error;
    } finally {
      actions.setGenerating(false);
    }
  }, [state.isGenerating, actions]);

  const generateBatch = useCallback(async (requests: GenerationRequest[]) => {
    const results: (GeneratedImage | Error)[] = [];
    
    for (const request of requests) {
      try {
        const result = await generateImage(request);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        results.push(error instanceof Error ? error : new Error('Unknown error'));
      }
      
      // Add delay between batch generations
      if (requests.indexOf(request) < requests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }, [generateImage]);

  const cancelGeneration = useCallback(() => {
    actions.setGenerating(false);
    actions.clearGenerationProgress();
    setError(null);
  }, [actions]);

  return {
    generateImage,
    generateBatch,
    cancelGeneration,
    isGenerating: state.isGenerating,
    currentGeneration: state.currentGeneration,
    error
  };
}