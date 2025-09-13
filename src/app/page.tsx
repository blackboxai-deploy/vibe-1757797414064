import ImageGenerator from '@/components/ImageGenerator';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your ideas into stunning visuals with the power of artificial intelligence. 
          Simply describe what you want to see, and watch it come to life.
        </p>
      </div>
      
      <ImageGenerator />
    </div>
  );
}