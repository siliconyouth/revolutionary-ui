import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Transpiler temporarily disabled for production build' },
    { status: 503 }
  );
}

/* Original implementation commented out for production build
import { FrameworkTranspiler } from '@/transpiler/FrameworkTranspiler';
import { FrameworkType } from '@/types/transpiler';

export async function POST_ORIGINAL(request: NextRequest) {
  try {
    const { code, sourceFramework, targetFramework, options } = await request.json();

    // Validate input
    if (!code || !sourceFramework || !targetFramework) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: code, sourceFramework, and targetFramework' 
        },
        { status: 400 }
      );
    }

    // Validate frameworks
    const validFrameworks: FrameworkType[] = ['react', 'vue', 'angular', 'svelte', 'solid', 'preact', 'lit'];
    if (!validFrameworks.includes(sourceFramework) || !validFrameworks.includes(targetFramework)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid framework. Supported frameworks: ' + validFrameworks.join(', ') 
        },
        { status: 400 }
      );
    }

    if (sourceFramework === targetFramework) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Source and target frameworks must be different' 
        },
        { status: 400 }
      );
    }

    // Create transpiler instance
    const transpiler = new FrameworkTranspiler();

    // Perform transpilation
    const result = await transpiler.transpile(
      code,
      sourceFramework,
      targetFramework,
      options || {}
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transpilation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during transpilation',
        warnings: []
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check available transpilation paths
export async function GET() {
  const availablePaths = [
    { from: 'react', to: ['vue', 'angular', 'svelte', 'solid', 'preact', 'lit'] },
    { from: 'vue', to: ['react', 'angular', 'svelte', 'solid'] },
    { from: 'angular', to: ['react', 'vue'] },
    { from: 'svelte', to: ['react', 'vue'] },
    { from: 'solid', to: ['react'] },
    { from: 'preact', to: ['react'] },
    { from: 'lit', to: ['react'] }
  ];

  return NextResponse.json({
    availablePaths,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid', 'preact', 'lit'],
    features: {
      typescript: true,
      formatting: true,
      sourceMap: false,
      preserveComments: true,
      componentStyles: ['function', 'class', 'options', 'composition']
    }
  });
}
*/