import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { createLogger } from '@revolutionary-ui/cli-core';
import type { CLIConfig } from '@revolutionary-ui/cli-core';
import type { 
  CloudComponent, 
  CloudSyncStatus, 
  CloudConfig,
  CloudConflict,
  CloudChange 
} from './types.js';

export class CloudClient {
  private api: AxiosInstance;
  private ws?: WebSocket;
  private logger = createLogger();
  private config: CloudConfig;
  
  constructor(private cliConfig: CLIConfig) {
    this.config = this.getCloudConfig();
    
    this.api = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private getCloudConfig(): CloudConfig {
    return {
      apiUrl: process.env.RUI_CLOUD_API_URL || 'https://api.revolutionary-ui.com',
      wsUrl: process.env.RUI_CLOUD_WS_URL || 'wss://ws.revolutionary-ui.com',
      teamId: this.cliConfig.team?.id,
      projectId: this.cliConfig.project?.name,
    };
  }
  
  private setupInterceptors(): void {
    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      const auth = this.cliConfig.auth;
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
      
      if (this.config.teamId) {
        config.headers['X-Team-Id'] = this.config.teamId;
      }
      
      if (this.config.projectId) {
        config.headers['X-Project-Id'] = this.config.projectId;
      }
      
      return config;
    });
    
    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.logger.error('Authentication failed. Please run "rui auth login"');
        }
        return Promise.reject(error);
      }
    );
  }
  
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const auth = this.cliConfig.auth;
    if (!auth?.token) {
      throw new Error('Not authenticated. Please run "rui auth login"');
    }
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.config.wsUrl, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'X-Team-Id': this.config.teamId || '',
          'X-Project-Id': this.config.projectId || '',
        },
      });
      
      this.ws.on('open', () => {
        this.logger.debug('WebSocket connected');
        resolve();
      });
      
      this.ws.on('error', (error) => {
        this.logger.error('WebSocket error:', error);
        reject(error);
      });
      
      this.ws.on('close', () => {
        this.logger.debug('WebSocket disconnected');
      });
      
      this.ws.on('message', (data) => {
        this.handleWebSocketMessage(data.toString());
      });
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
  
  private handleWebSocketMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'sync-update':
          this.logger.info(`Component ${data.componentName} updated by ${data.author}`);
          break;
          
        case 'conflict':
          this.logger.warn(`Conflict detected in ${data.componentName}`);
          break;
          
        default:
          this.logger.debug('Received message:', data);
      }
    } catch (error) {
      this.logger.error('Failed to parse WebSocket message:', error);
    }
  }
  
  async getSyncStatus(): Promise<CloudSyncStatus> {
    const response = await this.api.get<CloudSyncStatus>('/sync/status');
    return response.data;
  }
  
  async listComponents(filter?: {
    types?: string[];
    frameworks?: string[];
    tags?: string[];
  }): Promise<CloudComponent[]> {
    const response = await this.api.get<CloudComponent[]>('/components', {
      params: filter,
    });
    return response.data;
  }
  
  async getComponent(id: string): Promise<CloudComponent> {
    const response = await this.api.get<CloudComponent>(`/components/${id}`);
    return response.data;
  }
  
  async pushComponent(component: Omit<CloudComponent, 'id' | 'checksum'>): Promise<CloudComponent> {
    const response = await this.api.post<CloudComponent>('/components', component);
    return response.data;
  }
  
  async updateComponent(id: string, component: Partial<CloudComponent>): Promise<CloudComponent> {
    const response = await this.api.put<CloudComponent>(`/components/${id}`, component);
    return response.data;
  }
  
  async deleteComponent(id: string): Promise<void> {
    await this.api.delete(`/components/${id}`);
  }
  
  async resolveConflict(
    componentId: string, 
    resolution: 'local' | 'remote' | 'merge',
    mergedContent?: string
  ): Promise<void> {
    await this.api.post(`/sync/conflicts/${componentId}/resolve`, {
      resolution,
      mergedContent,
    });
  }
  
  async getChanges(): Promise<{
    local: CloudChange[];
    remote: CloudChange[];
  }> {
    const response = await this.api.get<{
      local: CloudChange[];
      remote: CloudChange[];
    }>('/sync/changes');
    return response.data;
  }
  
  async createSnapshot(message: string): Promise<{ id: string; timestamp: string }> {
    const response = await this.api.post<{ id: string; timestamp: string }>('/sync/snapshots', {
      message,
    });
    return response.data;
  }
  
  async getSnapshots(): Promise<Array<{
    id: string;
    message: string;
    timestamp: string;
    componentCount: number;
  }>> {
    const response = await this.api.get<Array<{
      id: string;
      message: string;
      timestamp: string;
      componentCount: number;
    }>>('/sync/snapshots');
    return response.data;
  }
  
  async restoreSnapshot(snapshotId: string): Promise<void> {
    await this.api.post(`/sync/snapshots/${snapshotId}/restore`);
  }
}