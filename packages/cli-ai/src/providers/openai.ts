import OpenAI from 'openai';
import type { AIProvider, GenerateOptions, GenerateResult } from '../types.js';
import { createLogger } from '@revolutionary-ui/cli-core';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI | null = null;
  private logger = createLogger();

  constructor(private apiKey?: string) {
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  async isAvailable(): Promise<boolean> {
    const key = this.apiKey || process.env.OPENAI_API_KEY;
    if (!key) return false;

    if (!this.client) {
      this.client = new OpenAI({ apiKey: key });
    }

    try {
      // Test API with a minimal request
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    if (!this.client) {
      const key = this.apiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        throw new Error('OpenAI API key not configured');
      }
      this.client = new OpenAI({ apiKey: key });
    }

    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 4000,
      systemPrompt = 'You are an expert UI developer assistant.',
      stream = false,
      onStream,
    } = options;

    try {
      if (stream && onStream) {
        const stream = await this.client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
          stream: true,
        });

        let content = '';
        let promptTokens = 0;
        let completionTokens = 0;

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          content += delta;
          onStream(delta);

          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens;
            completionTokens = chunk.usage.completion_tokens;
          }
        }

        return {
          content,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          },
          model,
        };
      } else {
        const response = await this.client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
        });

        const content = response.choices[0]?.message?.content || '';

        return {
          content,
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          } : undefined,
          model,
        };
      }
    } catch (error: any) {
      this.logger.error('OpenAI generation failed:', error.message);
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }
}