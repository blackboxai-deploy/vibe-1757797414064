import type { GenerationRequest, GenerationResponse, AIResponse } from './types';

// AI Client for image generation using custom endpoint
export class AIImageClient {
  private readonly endpoint = 'https://oi-server.onrender.com/chat/completions';
  private readonly headers = {
    'customerId': 'cus_ShzgycyvrUzLle',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  };
  private readonly model = 'replicate/black-forest-labs/flux-1.1-pro';

  async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Build the prompt with settings
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.settings);
      
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: enhancedPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Generation failed');
      }

      const imageUrl = data.choices?.[0]?.message?.content;
      
      if (!imageUrl) {
        throw new Error('No image URL received from AI service');
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        imageUrl,
        processingTime
      };

    } catch (error) {
      console.error('AI Generation Error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown generation error',
        processingTime: Date.now() - startTime
      };
    }
  }

  private enhancePrompt(prompt: string, settings: GenerationRequest['settings']): string {
    let enhancedPrompt = prompt;
    
    // Add style modifiers
    if (settings.style) {
      const styleModifiers = {
        'photorealistic': 'photorealistic, high quality, detailed',
        'artistic': 'artistic, creative, expressive',
        'abstract': 'abstract, conceptual, non-representational',
        'anime': 'anime style, manga inspired, stylized',
        'digital-art': 'digital art, contemporary, modern'
      };
      
      enhancedPrompt = `${enhancedPrompt}, ${styleModifiers[settings.style]}`;
    }

    // Add aspect ratio context
    if (settings.aspectRatio) {
      const ratioContext = {
        '1:1': 'square composition',
        '16:9': 'widescreen landscape composition',
        '9:16': 'portrait composition',
        '4:3': 'landscape composition',
        '3:4': 'portrait composition'
      };
      
      enhancedPrompt = `${enhancedPrompt}, ${ratioContext[settings.aspectRatio]}`;
    }

    // Add quality modifiers
    enhancedPrompt = `${enhancedPrompt}, high resolution, professional quality`;
    
    return enhancedPrompt;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Test connection - generate a simple red circle'
            }
          ]
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const aiImageClient = new AIImageClient();