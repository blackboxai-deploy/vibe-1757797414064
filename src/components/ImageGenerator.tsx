'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { toast } from 'sonner';
import PromptInput from './PromptInput';
import GenerationControls from './GenerationControls';
import ProgressIndicator from './ProgressIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { GenerationSettings } from '@/lib/types';

export default function ImageGenerator() {
  const { state, actions } = useAppContext();
  const { generateImage, isGenerating, currentGeneration, error } = useImageGeneration();
  
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: state.settings.defaultAspectRatio,
    style: state.settings.defaultStyle,
    steps: 30,
    guidanceScale: 8
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (prompt.length > 500) {
      toast.error('Prompt is too long (max 500 characters)');
      return;
    }

    try {
      await generateImage({ prompt: prompt.trim(), settings });
      
      // Clear prompt on successful generation if auto-save is enabled
      if (state.settings.autoSave) {
        setPrompt('');
      }
      
      toast.success('Image generated successfully!');
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error(error || 'Failed to generate image');
    }
  };

  const handleQuickGenerate = (quickPrompt: string) => {
    setPrompt(quickPrompt);
    // Automatically generate after setting prompt
    setTimeout(() => {
      generateImage({ prompt: quickPrompt, settings });
    }, 100);
  };

  const recentImages = state.images.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Main Generation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Prompt and Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🎨</span>
                <span>AI Image Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleGenerate}
                disabled={isGenerating}
              />
            </CardContent>
          </Card>

          <GenerationControls
            settings={settings}
            onChange={setSettings}
            disabled={isGenerating}
            showAdvanced={state.settings.showAdvancedControls}
            onToggleAdvanced={() => 
              actions.updateSettings({ 
                showAdvancedControls: !state.settings.showAdvancedControls 
              })
            }
          />
        </div>

        {/* Right Column - Generation Status and Preview */}
        <div className="space-y-6">
          {/* Generation Progress */}
          {(isGenerating || currentGeneration) && (
            <ProgressIndicator
              isGenerating={isGenerating}
              progress={currentGeneration}
            />
          )}

          {/* Latest Generated Image */}
          {state.images.length > 0 && !isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={state.images[0].imageUrl}
                      alt={state.images[0].prompt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/87ddc41d-1ff3-44fb-a31a-502b6895bc70.png';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">"{state.images[0].prompt}"</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(state.images[0].timestamp).toLocaleString()}
                      </span>
                      <div className="flex space-x-2">
                        <span>{state.images[0].settings.aspectRatio}</span>
                        <span>•</span>
                        <span>{state.images[0].settings.style}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPrompt(state.images[0].prompt);
                        setSettings(state.images[0].settings);
                      }}
                    >
                      Use This Prompt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.toggleFavorite(state.images[0].id)}
                    >
                      {state.images[0].isFavorite ? '❤️' : '🤍'} 
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Generate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Beautiful landscape sunset',
                  'Cute cartoon character',
                  'Modern architecture',
                  'Abstract art pattern',
                  'Space exploration',
                  'Fantasy creature'
                ].map((quickPrompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickGenerate(quickPrompt)}
                    disabled={isGenerating}
                    className="text-xs h-auto py-2"
                  >
                    {quickPrompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Recent Images Gallery */}
      {recentImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Generations</h2>
            {state.images.length > 6 && (
              <Button variant="outline" asChild>
                <a href="/gallery">View All ({state.images.length})</a>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentImages.map((image) => (
              <Card key={image.id} className="group cursor-pointer hover:shadow-md transition-shadow">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/85fe7528-e870-43f9-b71b-3343879a4596.png';
                    }}
                  />
                  
                  {/* Quick actions overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrompt(image.prompt);
                          setSettings(image.settings);
                        }}
                      >
                        Reuse
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.toggleFavorite(image.id);
                        }}
                      >
                        {image.isFavorite ? '❤️' : '🤍'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {image.prompt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {state.images.length === 0 && !isGenerating && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-semibold mb-2">Ready to Create Amazing Images!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Enter a creative prompt above and let our AI generate stunning images for you. 
              Try describing scenes, objects, art styles, or anything you can imagine!
            </p>
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setPrompt('A beautiful mountain landscape at golden hour')}
              >
                Try Example 1
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPrompt('Cyberpunk city street with neon lights')}
              >
                Try Example 2
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}