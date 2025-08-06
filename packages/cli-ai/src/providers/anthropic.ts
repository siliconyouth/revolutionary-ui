import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, GenerateOptions, GenerateResult } from '../types.js';
import { createLogger } from '@revolutionary-ui/cli-core';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic | null = null;
  private logger = createLogger();

  constructor(private apiKey?: string) {
    if (this.apiKey) {
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
  }

  async isAvailable(): Promise<boolean> {
    const key = this.apiKey || process.env.ANTHROPIC_API_KEY;
    return !!key;
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    if (!this.client) {
      const key = this.apiKey || process.env.ANTHROPIC_API_KEY;
      if (!key) {
        throw new Error('Anthropic API key not configured');
      }
      this.client = new Anthropic({ apiKey: key });
    }

    const {
      model = 'claude-3-5-sonnet-20241022',
      temperature = 0.7,
      maxTokens = 4000,
      systemPrompt = 'You are an expert UI developer assistant.',
      stream = false,
      onStream,
    } = options;

    try {
      if (stream && onStream) {
        const stream = await this.client.messages.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          system: systemPrompt,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        });

        let content = '';
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            content += chunk.delta.text;
            onStream(chunk.delta.text);
          }
          
          if (chunk.type === 'message_start' && chunk.message.usage) {
            inputTokens = chunk.message.usage.input_tokens;
          }
          
          if (chunk.type === 'message_delta' && chunk.usage) {
            outputTokens = chunk.usage.output_tokens;
          }
        }

        return {
          content,
          usage: {
            promptTokens: inputTokens,
            completionTokens: outputTokens,
            totalTokens: inputTokens + outputTokens,
          },
          model,
        };
      } else {
        const response = await this.client.messages.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          system: systemPrompt,
          temperature,
          max_tokens: maxTokens,
        });

        const content = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('');

        return {
          content,
          usage: response.usage ? {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          } : undefined,
          model,
        };
      }
    } catch (error: any) {
      this.logger.error('Anthropic generation failed:', error.message);
      throw new Error(`Anthropic generation failed: ${error.message}`);
    }
  }
}