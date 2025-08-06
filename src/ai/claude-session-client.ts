/**
 * Claude Session Client - Uses browser session token instead of API keys
 */

import axios, { AxiosInstance } from 'axios';
import { ClaudeAuthManager } from '../cli/utils/claude-auth-manager';
import chalk from 'chalk';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: string;
  model: string;
  stop_reason?: string;
}

export class ClaudeSessionClient {
  private authManager: ClaudeAuthManager;
  private client: AxiosInstance;
  private organizationId?: string;

  constructor() {
    this.authManager = new ClaudeAuthManager();
    this.client = axios.create({
      baseURL: 'https://claude.ai/api',
      timeout: 120000, // 2 minutes
    });
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return this.authManager.isAuthenticated();
  }

  /**
   * Authenticate through browser
   */
  async authenticate(): Promise<boolean> {
    return this.authManager.authenticate();
  }

  /**
   * Create a chat completion using Claude session
   */
  async createMessage(params: {
    messages: ClaudeMessage[];
    model: 'claude-3-opus-20240229' | 'claude-3-5-sonnet-20241022';
    max_tokens?: number;
    temperature?: number;
    system?: string;
  }): Promise<ClaudeResponse> {
    // Ensure authenticated
    const token = await this.authManager.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated with Claude AI. Run "revolutionary-ui ai-auth" first.');
    }

    try {
      // Get organization ID if not cached
      if (!this.organizationId) {
        await this.getOrganizationId();
      }

      // Prepare the request in Claude's web format
      const conversation = this.buildConversation(params.messages, params.system);
      
      const response = await this.client.post(
        `/organizations/${this.organizationId}/chat_conversations`,
        {
          conversation,
          model: params.model,
          max_tokens_to_sample: params.max_tokens || 4096,
          temperature: params.temperature || 0.7,
        },
        {
          headers: this.authManager.getAuthHeaders(),
        }
      );

      // Extract the assistant's response
      const assistantMessage = response.data.conversation.messages.find(
        (msg: any) => msg.role === 'assistant'
      );

      return {
        content: assistantMessage?.content || '',
        model: params.model,
        stop_reason: response.data.stop_reason,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Claude AI session expired. Please re-authenticate.');
      }
      throw new Error(`Claude AI request failed: ${error.message}`);
    }
  }

  /**
   * Stream a chat completion
   */
  async streamMessage(params: {
    messages: ClaudeMessage[];
    model: 'claude-3-opus-20240229' | 'claude-3-5-sonnet-20241022';
    max_tokens?: number;
    temperature?: number;
    system?: string;
    onChunk: (chunk: string) => void;
  }): Promise<ClaudeResponse> {
    // For now, we'll simulate streaming by calling createMessage
    // Real streaming implementation would use SSE or WebSockets
    console.log(chalk.yellow('⚠️  Streaming not yet implemented for session-based auth. Using non-streaming mode.'));
    
    const response = await this.createMessage({
      messages: params.messages,
      model: params.model,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      system: params.system,
    });

    // Simulate streaming by chunking the response
    const chunks = this.chunkText(response.content, 50);
    for (const chunk of chunks) {
      params.onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
    }

    return response;
  }

  /**
   * Get organization ID for the authenticated user
   */
  private async getOrganizationId(): Promise<void> {
    try {
      const response = await this.client.get('/organizations', {
        headers: this.authManager.getAuthHeaders(),
      });

      if (response.data && response.data.length > 0) {
        this.organizationId = response.data[0].uuid;
      } else {
        throw new Error('No organizations found for this account');
      }
    } catch (error: any) {
      throw new Error(`Failed to get organization ID: ${error.message}`);
    }
  }

  /**
   * Build conversation in Claude's format
   */
  private buildConversation(messages: ClaudeMessage[], system?: string): any {
    const conversation = {
      uuid: this.generateUUID(),
      name: 'Revolutionary UI Component Generation',
      messages: [] as any[],
    };

    // Add system message if provided
    if (system) {
      conversation.messages.push({
        role: 'assistant',
        content: `System: ${system}`,
        created_at: new Date().toISOString(),
      });
    }

    // Add user/assistant messages
    messages.forEach(msg => {
      conversation.messages.push({
        role: msg.role,
        content: msg.content,
        created_at: new Date().toISOString(),
      });
    });

    return conversation;
  }

  /**
   * Generate a UUID for conversations
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Chunk text for simulated streaming
   */
  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' ') + ' ');
    }
    
    return chunks;
  }

  /**
   * Logout from Claude
   */
  async logout(): Promise<void> {
    await this.authManager.logout();
  }
}