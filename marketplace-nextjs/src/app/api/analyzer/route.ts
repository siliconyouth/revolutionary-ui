
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { ProjectDetector } from '@/lib/analyzer/project-detector';
import { ProjectAnalyzer } from '@/lib/analyzer/project-analyzer';
import { AIAnalyzer } from '@/lib/analyzer/ai-analyzer';

// Promisify exec for async/await usage
const execPromise = (command: string) => {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

export async function POST(req: NextRequest) {
  const { repoUrl } = await req.json();

  // 1. Validate the incoming GitHub URL
  if (!repoUrl || typeof repoUrl !== 'string') {
    return NextResponse.json({ error: 'Repository URL is required.' }, { status: 400 });
  }

  const githubUrlRegex = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-.]+$/;
  if (!githubUrlRegex.test(repoUrl)) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL format.' }, { status: 400 });
  }

  // Sanitize URL to prevent command injection
  const sanitizedUrl = repoUrl.replace(/[^a-zA-Z0-9-_\/.:]/g, '');

  // 2. Create a secure, temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-analyzer-'));

  try {
    // 3. Clone the repository
    await execPromise(`git clone --depth 1 ${sanitizedUrl} ${tempDir}`);

    const packageJsonPath = path.join(tempDir, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch {
      return NextResponse.json({ error: 'No package.json found in the repository root.' }, { status: 400 });
    }

    // 4. Run the analysis
    const detector = new ProjectDetector(tempDir);
    const analysis = await detector.analyze();
    
    const projectAnalyzer = new ProjectAnalyzer(analysis);
    const report = projectAnalyzer.generateReport();
    
    // The AI Analyzer might require an API key, which should be handled via environment variables.
    // For this implementation, we'll assume it can run without one or has one configured.
    const aiAnalyzer = new AIAnalyzer(analysis, report);
    const aiResults = await aiAnalyzer.generateAIRecommendations();

    // 5. Return the full report
    return NextResponse.json({
      analysis,
      report,
      aiResults,
    });

  } catch (error: any) {
    console.error('Analysis failed:', error);
    let errorMessage = 'Failed to analyze the repository.';
    if (error.message.includes('Repository not found')) {
        errorMessage = 'Repository not found. Please check the URL and make sure it is a public repository.';
    } else if (error.message.includes('git clone')) {
        errorMessage = 'Failed to clone the repository. It might be private or the URL is incorrect.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    // 6. Clean up the cloned repository
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
