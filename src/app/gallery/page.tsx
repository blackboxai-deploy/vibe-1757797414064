'use client';

import { useAppContext } from '@/contexts/AppContext';
import ImageGallery from '@/components/ImageGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function GalleryPage() {
  const { state, actions } = useAppContext();

  const stats = {
    total: state.images.length,
    favorites: state.images.filter(img => img.isFavorite).length,
    thisWeek: state.images.filter(img => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return img.timestamp > weekAgo;
    }).length
  };

  const topStyles = state.images.reduce((acc, img) => {
    const style = img.settings.style || 'photorealistic';
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (state.images.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Image Gallery</h1>
            <p className="text-muted-foreground">Your generated images will appear here</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">No Images Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start creating amazing AI-generated images to build your gallery!
              </p>
              <Button asChild>
                <Link href="/">Generate Your First Image</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Image Gallery</h1>
          <p className="text-muted-foreground">
            Browse and manage your AI-generated masterpieces
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Generate More</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Images</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.favorites}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.thisWeek}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Style Stats */}
      {Object.keys(topStyles).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Style Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(topStyles)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([style, count]) => (
                  <Badge key={style} variant="secondary" className="text-sm">
                    {style} ({count})
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Gallery */}
      <ImageGallery
        images={state.images}
        onDelete={actions.deleteImage}
        onToggleFavorite={actions.toggleFavorite}
        showFilters={true}
      />
    </div>
  );
}