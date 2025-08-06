import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, GenerateOptions, GenerateResult } from '../types.js';
import { createLogger } from '@revolutionary-ui/cli-core';

export class GoogleProvider implements AIProvider {
  name = 'google';
  private client: GoogleGenerativeAI | null = null;
  private logger = createLogger();

  constructor(private apiKey?: string) {
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async isAvailable(): Promise<boolean> {
    const key = this.apiKey || process.env.GOOGLE_API_KEY;
    return !!key;
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    if (!this.client) {
      const key = this.apiKey || process.env.GOOGLE_API_KEY;
      if (!key) {
        throw new Error('Google API key not configured');
      }
      this.client = new GoogleGenerativeAI(key);
    }

    const {
      model = 'gemini-pro',
      temperature = 0.7,
      maxTokens = 4000,
      systemPrompt = 'You are an expert UI developer assistant.',
      stream = false,
      onStream,
    } = options;

    try {
      const genModel = this.client.getGenerativeModel({ model });

      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      if (stream && onStream) {
        const result = await genModel.generateContentStream({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        });

        let content = '';
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          content += text;
          onStream(text);
        }

        // Get final response for token counts
        const response = await result.response;
        const usage = (response as any).usageMetadata;

        return {
          content,
          usage: usage ? {
            promptTokens: usage.promptTokenCount || 0,
            completionTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
          } : undefined,
          model,
        };
      } else {
        const result = await genModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        });

        const response = await result.response;
        const content = response.text();
        const usage = (response as any).usageMetadata;

        return {
          content,
          usage: usage ? {
            promptTokens: usage.promptTokenCount || 0,
            completionTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
          } : undefined,
          model,
        };
      }
    } catch (error: any) {
      this.logger.error('Google generation failed:', error.message);
      throw new Error(`Google generation failed: ${error.message}`);
    }
  }
}