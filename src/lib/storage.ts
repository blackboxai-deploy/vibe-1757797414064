import type { GeneratedImage, UserSettings } from './types';

// Local storage utilities for the AI image generation app
export class LocalStorageManager {
  private readonly IMAGES_KEY = 'ai-app-generated-images';
  private readonly SETTINGS_KEY = 'ai-app-user-settings';

  // Default settings
  private defaultSettings: UserSettings = {
    theme: 'system',
    defaultAspectRatio: '1:1',
    defaultStyle: 'photorealistic',
    autoSave: true,
    showAdvancedControls: false
  };

  // Image management
  saveImage(image: GeneratedImage): void {
    try {
      const images = this.getImages();
      const updatedImages = [image, ...images].slice(0, 100); // Keep latest 100 images
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  }

  getImages(): GeneratedImage[] {
    try {
      const stored = localStorage.getItem(this.IMAGES_KEY);
      if (!stored) return [];
      
      const images = JSON.parse(stored) as GeneratedImage[];
      // Convert timestamp strings back to Date objects
      return images.map(img => ({
        ...img,
        timestamp: new Date(img.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load images:', error);
      return [];
    }
  }

  deleteImage(imageId: string): void {
    try {
      const images = this.getImages();
      const filteredImages = images.filter(img => img.id !== imageId);
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(filteredImages));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  toggleFavorite(imageId: string): void {
    try {
      const images = this.getImages();
      const updatedImages = images.map(img =>
        img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
      );
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }

  getFavoriteImages(): GeneratedImage[] {
    return this.getImages().filter(img => img.isFavorite);
  }

  clearAllImages(): void {
    try {
      localStorage.removeItem(this.IMAGES_KEY);
    } catch (error) {
      console.error('Failed to clear images:', error);
    }
  }

  // Settings management
  saveSettings(settings: Partial<UserSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (!stored) return this.defaultSettings;
      
      const settings = JSON.parse(stored) as Partial<UserSettings>;
      return { ...this.defaultSettings, ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.defaultSettings;
    }
  }

  resetSettings(): void {
    try {
      localStorage.removeItem(this.SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }

  // Statistics
  getGenerationStats() {
    const images = this.getImages();
    const totalImages = images.length;
    const favoriteCount = images.filter(img => img.isFavorite).length;
    
    // Calculate style usage
    const styleStats = images.reduce((acc, img) => {
      const style = img.settings.style || 'photorealistic';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentImages = images.filter(img => img.timestamp > weekAgo).length;

    return {
      totalImages,
      favoriteCount,
      recentImages,
      styleStats,
      oldestImage: images[images.length - 1]?.timestamp,
      newestImage: images[0]?.timestamp
    };
  }

  // Export/Import functionality
  exportData(): string {
    const images = this.getImages();
    const settings = this.getSettings();
    
    return JSON.stringify({
      images,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    });
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.images && Array.isArray(data.images)) {
        localStorage.setItem(this.IMAGES_KEY, JSON.stringify(data.images));
      }
      
      if (data.settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageManager = new LocalStorageManager();