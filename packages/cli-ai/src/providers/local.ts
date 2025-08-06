import type { AIProvider, GenerateOptions, GenerateResult } from '../types.js';
import { createLogger } from '@revolutionary-ui/cli-core';
import { execSync, spawn } from 'child_process';

export class LocalProvider implements AIProvider {
  name = 'local';
  private logger = createLogger();

  async isAvailable(): Promise<boolean> {
    try {
      // Check if ollama is installed
      execSync('ollama --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    const {
      model = 'llama3.2',
      temperature = 0.7,
      systemPrompt = 'You are an expert UI developer assistant.',
      stream = false,
      onStream,
    } = options;

    try {
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      if (stream && onStream) {
        return await this.streamGenerate(model, fullPrompt, temperature, onStream);
      } else {
        // Use ollama API for non-streaming
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt: fullPrompt,
            options: { temperature },
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json() as any;

        return {
          content: data.response,
          usage: {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          },
          model,
        };
      }
    } catch (error: any) {
      this.logger.error('Local generation failed:', error.message);
      throw new Error(`Local generation failed: ${error.message}`);
    }
  }

  private async streamGenerate(
    model: string,
    prompt: string,
    temperature: number,
    onStream: (chunk: string) => void
  ): Promise<GenerateResult> {
    return new Promise((resolve, reject) => {
      const ollama = spawn('ollama', ['run', model, '--nowordwrap']);
      
      let content = '';
      let isFirstOutput = true;

      ollama.stdout.on('data', (data) => {
        const text = data.toString();
        
        // Skip the first output which is often the model loading message
        if (isFirstOutput && text.includes('>>>')) {
          isFirstOutput = false;
          return;
        }
        
        content += text;
        onStream(text);
      });

      ollama.stderr.on('data', (data) => {
        this.logger.debug('Ollama stderr:', data.toString());
      });

      ollama.on('error', (error) => {
        reject(new Error(`Failed to spawn ollama: ${error.message}`));
      });

      ollama.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Ollama exited with code ${code}`));
        } else {
          resolve({
            content: content.trim(),
            model,
            // Local models don't typically provide token counts
            usage: undefined,
          });
        }
      });

      // Send the prompt
      ollama.stdin.write(prompt);
      ollama.stdin.end();
    });
  }
}