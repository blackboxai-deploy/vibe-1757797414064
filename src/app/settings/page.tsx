'use client';

import { useAppContext } from '@/contexts/AppContext';
import { storageManager } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SettingsPage() {
  const { state, actions, dispatch } = useAppContext();

  const handleExportData = () => {
    try {
      const exportData = storageManager.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-images-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = storageManager.importData(data);
        
        if (success) {
          // Refresh the app state
          const images = storageManager.getImages();
          const settings = storageManager.getSettings();
          
          dispatch({ type: 'SET_IMAGES', payload: images });
          actions.updateSettings(settings);
          
          toast.success('Data imported successfully!');
        } else {
          toast.error('Invalid backup file format');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllImages = () => {
    if (confirm('Are you sure you want to delete all images? This cannot be undone.')) {
      storageManager.clearAllImages();
      dispatch({ type: 'SET_IMAGES', payload: [] });
      toast.success('All images cleared successfully!');
    }
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to default values?')) {
      actions.resetSettings();
      toast.success('Settings reset to defaults!');
    }
  };

  const stats = storageManager.getGenerationStats();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your AI image generation experience
          </p>
        </div>
        
        <Button variant="outline" asChild>
          <Link href="/">Back to Generator</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generation Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Aspect Ratio</Label>
                <Select
                  value={state.settings.defaultAspectRatio}
                  onValueChange={(value: any) => 
                    actions.updateSettings({ defaultAspectRatio: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="3:4">Tall (3:4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Style</Label>
                <Select
                  value={state.settings.defaultStyle}
                  onValueChange={(value: any) => 
                    actions.updateSettings({ defaultStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interface Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-save Generated Images</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save images to your gallery
                  </p>
                </div>
                <Switch
                  checked={state.settings.autoSave}
                  onCheckedChange={(checked) => 
                    actions.updateSettings({ autoSave: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Advanced Controls</Label>
                  <p className="text-sm text-muted-foreground">
                    Display advanced generation parameters
                  </p>
                </div>
                <Switch
                  checked={state.settings.showAdvancedControls}
                  onCheckedChange={(checked) => 
                    actions.updateSettings({ showAdvancedControls: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalImages}</div>
                  <div className="text-sm text-muted-foreground">Total Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.favoriteCount}</div>
                  <div className="text-sm text-muted-foreground">Favorites</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.recentImages}</div>
                <div className="text-sm text-muted-foreground">Generated This Week</div>
              </div>

              {Object.keys(stats.styleStats).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Most Used Styles</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.styleStats)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 3)
                      .map(([style, count]) => (
                        <Badge key={style} variant="secondary">
                          {style} ({count})
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Backup & Restore</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExportData}>
                    📤 Export Data
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline">
                      📥 Import Data
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Export your images and settings as a backup file
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleClearAllImages}
                  >
                    🗑️ Clear All Images
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResetSettings}
                  >
                    🔄 Reset All Settings
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  These actions cannot be undone. Consider exporting your data first.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}