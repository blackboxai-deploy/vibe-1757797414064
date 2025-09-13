import { NextRequest, NextResponse } from 'next/server';
import { aiImageClient } from '@/lib/ai-client';
import type { GenerationRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerationRequest = await request.json();

    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    if (body.prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt too long (max 500 characters)' },
        { status: 400 }
      );
    }

    if (!body.settings) {
      return NextResponse.json(
        { error: 'Generation settings are required' },
        { status: 400 }
      );
    }

    // Set CORS headers for cross-origin requests
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    });

    // Generate image using AI client
    const result = await aiImageClient.generateImage(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Generation failed',
          details: 'The AI service was unable to generate an image for this prompt'
        },
        { status: 500, headers }
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        imageUrl: result.imageUrl,
        processingTime: result.processingTime,
        prompt: body.prompt,
        settings: body.settings
      },
      { status: 200, headers }
    );

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle preflight CORS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Health check endpoint
export async function GET() {
  try {
    // Test AI service connectivity
    const isHealthy = await aiImageClient.healthCheck();
    
    return NextResponse.json(
      {
        status: 'healthy',
        aiService: isHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}