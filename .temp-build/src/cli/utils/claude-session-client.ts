/**
 * Claude Session Client
 * Makes API calls to Claude using session authentication
 */

import axios, { AxiosInstance } from 'axios';
import { ClaudeSessionAuth } from './claude-session-auth';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  id: string;
  model: string;
  role: 'assistant';
  type: 'message';
}

export class ClaudeSessionClient {
  private sessionAuth: ClaudeSessionAuth;
  private client: AxiosInstance;
  private organizationId?: string;

  constructor() {
    this.sessionAuth = new ClaudeSessionAuth();
    this.client = axios.create({
      baseURL: 'https://claude.ai/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://claude.ai',
        'Referer': 'https://claude.ai/chat'
      }
    });
  }

  /**
   * Ensure we have a valid session
   */
  private async ensureAuthenticated(): Promise<string> {
    const sessionKey = await this.sessionAuth.getSessionKey();
    
    if (!sessionKey) {
      throw new Error('Not authenticated with Claude AI. Run "revolutionary-ui ai-auth" first.');
    }
    
    return sessionKey;
  }

  /**
   * Get or create organization ID
   */
  private async getOrganizationId(sessionKey: string): Promise<string> {
    if (this.organizationId) {
      return this.organizationId;
    }

    try {
      // Get organization info
      const response = await this.client.get('/organizations', {
        headers: {
          'Cookie': `sessionKey=${sessionKey}`
        }
      });

      if (response.data && response.data.length > 0) {
        this.organizationId = response.data[0].uuid;
        return this.organizationId;
      }

      throw new Error('No organization found');
    } catch (error) {
      // Fallback to a default org ID if needed
      this.organizationId = 'default';
      return this.organizationId;
    }
  }

  /**
   * Create a new conversation
   */
  private async createConversation(sessionKey: string, orgId: string): Promise<string> {
    try {
      const response = await this.client.post(
        `/organizations/${orgId}/conversations`,
        {
          name: 'Revolutionary UI Session',
          model: 'claude-3-5-sonnet-20241022'
        },
        {
          headers: {
            'Cookie': `sessionKey=${sessionKey}`
          }
        }
      );

      return response.data.uuid;
    } catch (error) {
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Send a message to Claude
   */
  async createMessage(params: {
    messages: ClaudeMessage[];
    model?: string;
    max_tokens?: number;
    temperature?: number;
    system?: string;
  }): Promise<ClaudeResponse> {
    const sessionKey = await this.ensureAuthenticated();
    const orgId = await this.getOrganizationId(sessionKey);
    const conversationId = await this.createConversation(sessionKey, orgId);

    // Build the prompt
    let prompt = params.system ? `System: ${params.system}\n\n` : '';
    
    for (const message of params.messages) {
      if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant:';

    try {
      const response = await this.client.post(
        `/organizations/${orgId}/conversations/${conversationId}/messages`,
        {
          prompt,
          model: params.model || 'claude-3-5-sonnet-20241022',
          max_tokens: params.max_tokens || 1000,
          temperature: params.temperature || 0.3
        },
        {
          headers: {
            'Cookie': `sessionKey=${sessionKey}`
          }
        }
      );

      // Transform response to match Anthropic SDK format
      return {
        content: [{
          type: 'text',
          text: response.data.completion || response.data.text || ''
        }],
        id: response.data.id || 'msg_' + Date.now(),
        model: params.model || 'claude-3-5-sonnet-20241022',
        role: 'assistant',
        type: 'message'
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please re-authenticate with "revolutionary-ui ai-auth"');
      }
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  /**
   * Check if we have a valid session
   */
  async isAuthenticated(): Promise<boolean> {
    return this.sessionAuth.isAuthenticated();
  }
}