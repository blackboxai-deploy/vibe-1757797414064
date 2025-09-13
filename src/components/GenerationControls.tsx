'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { AspectRatio, GenerationStyle, GenerationSettings } from '@/lib/types';

interface GenerationControlsProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  disabled?: boolean;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; dimensions: string }[] = [
  { value: '1:1', label: 'Square', dimensions: '1024×1024' },
  { value: '16:9', label: 'Landscape', dimensions: '1344×768' },
  { value: '9:16', label: 'Portrait', dimensions: '768×1344' },
  { value: '4:3', label: 'Standard', dimensions: '1152×864' },
  { value: '3:4', label: 'Tall', dimensions: '864×1152' }
];

const GENERATION_STYLES: { value: GenerationStyle; label: string; description: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic', description: 'Realistic photography style' },
  { value: 'artistic', label: 'Artistic', description: 'Creative and expressive' },
  { value: 'abstract', label: 'Abstract', description: 'Non-representational art' },
  { value: 'anime', label: 'Anime', description: 'Japanese animation style' },
  { value: 'digital-art', label: 'Digital Art', description: 'Modern digital artwork' }
];

const PRESET_CONFIGS = {
  'Quick': { steps: 20, guidanceScale: 7 },
  'Quality': { steps: 30, guidanceScale: 8 },
  'Artistic': { steps: 40, guidanceScale: 12 },
  'Experimental': { steps: 50, guidanceScale: 15 }
};

export default function GenerationControls({
  settings,
  onChange,
  disabled = false,
  showAdvanced = false,
  onToggleAdvanced
}: GenerationControlsProps) {
  const [randomSeed, setRandomSeed] = useState(true);

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const applyPreset = (presetName: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetName];
    onChange({
      ...settings,
      steps: preset.steps,
      guidanceScale: preset.guidanceScale
    });
  };

  const generateRandomSeed = () => {
    const seed = Math.floor(Math.random() * 1000000);
    updateSetting('seed', seed);
    setRandomSeed(false);
  };

  const toggleRandomSeed = () => {
    if (randomSeed) {
      generateRandomSeed();
    } else {
      updateSetting('seed', undefined);
      setRandomSeed(true);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generation Settings</CardTitle>
          {onToggleAdvanced && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdvanced}
              disabled={disabled}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Aspect Ratio */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Aspect Ratio</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <Button
                key={ratio.value}
                variant={settings.aspectRatio === ratio.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('aspectRatio', ratio.value)}
                disabled={disabled}
                className="flex flex-col h-auto py-3"
              >
                <span className="font-medium">{ratio.label}</span>
                <span className="text-xs opacity-70">{ratio.dimensions}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Generation Style</Label>
          <Select
            value={settings.style}
            onValueChange={(value) => updateSetting('style', value as GenerationStyle)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style..." />
            </SelectTrigger>
            <SelectContent>
              {GENERATION_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showAdvanced && (
          <>
            <Separator />

            {/* Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quality Presets</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PRESET_CONFIGS).map((preset) => (
                  <Badge
                    key={preset}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => applyPreset(preset as keyof typeof PRESET_CONFIGS)}
                  >
                    {preset}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Generation Steps</Label>
                <span className="text-sm text-muted-foreground">{settings.steps || 30}</span>
              </div>
              <Slider
                value={[settings.steps || 30]}
                onValueChange={(value) => updateSetting('steps', value[0])}
                min={10}
                max={50}
                step={5}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Faster</span>
                <span>Higher Quality</span>
              </div>
            </div>

            {/* Guidance Scale */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Guidance Scale</Label>
                <span className="text-sm text-muted-foreground">{settings.guidanceScale || 8}</span>
              </div>
              <Slider
                value={[settings.guidanceScale || 8]}
                onValueChange={(value) => updateSetting('guidanceScale', value[0])}
                min={1}
                max={20}
                step={1}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More Creative</span>
                <span>Follow Prompt Exactly</span>
              </div>
            </div>

            {/* Seed Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Seed</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRandomSeed}
                  disabled={disabled}
                >
                  {randomSeed ? 'Random' : 'Fixed'}
                </Button>
              </div>
              
              {!randomSeed && (
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={settings.seed || ''}
                    onChange={(e) => updateSetting('seed', parseInt(e.target.value) || undefined)}
                    placeholder="Enter seed number"
                    disabled={disabled}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomSeed}
                    disabled={disabled}
                  >
                    🎲
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}