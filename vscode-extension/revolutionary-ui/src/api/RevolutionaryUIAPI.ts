import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export interface Component {
    id: string;
    name: string;
    slug: string;
    description: string;
    framework: string;
    category: string;
    tags: string[];
    author: {
        name: string;
        image?: string;
    };
    downloads: number;
    reviews: number;
    createdAt: string;
    updatedAt: string;
}

export interface SearchResult {
    id: string;
    score: number;
    resource: Component;
}

export class RevolutionaryUIAPI {
    private client: AxiosInstance;
    private apiUrl: string;
    private apiKey: string;

    constructor(private context: vscode.ExtensionContext) {
        this.updateConfiguration();
        
        this.client = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for auth
        this.client.interceptors.request.use(config => {
            if (this.apiKey) {
                config.headers.Authorization = `Bearer ${this.apiKey}`;
            }
            return config;
        });
    }

    updateConfiguration() {
        const config = vscode.workspace.getConfiguration('revolutionaryUI');
        this.apiUrl = config.get<string>('apiUrl') || 'https://revolutionary-ui.com/api';
        this.apiKey = config.get<string>('apiKey') || '';
        
        if (this.client) {
            this.client.defaults.baseURL = this.apiUrl;
        }
    }

    async getComponents(options?: {
        framework?: string;
        category?: string;
        limit?: number;
        offset?: number;
    }): Promise<Component[]> {
        try {
            const response = await this.client.get('/resources', {
                params: options
            });
            return response.data.resources || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async searchComponents(query: string, options?: {
        framework?: string;
        category?: string;
        tags?: string[];
        limit?: number;
    }): Promise<SearchResult[]> {
        try {
            const response = await this.client.post('/search/semantic', {
                query,
                limit: options?.limit || 20,
                threshold: 0.6,
                filters: {
                    framework: options?.framework,
                    category: options?.category,
                    tags: options?.tags
                }
            });
            return response.data.results || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async getComponent(id: string): Promise<Component | null> {
        try {
            const response = await this.client.get(`/resources/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    async getComponentCode(id: string): Promise<string> {
        try {
            const response = await this.client.get(`/resources/${id}`);
            return response.data.code || '';
        } catch (error) {
            this.handleError(error);
            return '';
        }
    }

    async getSimilarComponents(id: string, limit: number = 5): Promise<SearchResult[]> {
        try {
            const response = await this.client.get(`/resources/${id}/similar`, {
                params: { limit }
            });
            return response.data.similar || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async getCategories(): Promise<string[]> {
        try {
            const response = await this.client.get('/categories');
            return response.data.categories || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async getFrameworks(): Promise<string[]> {
        try {
            const response = await this.client.get('/frameworks');
            return response.data.frameworks || [];
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    async generateComponent(description: string, framework: string): Promise<Component | null> {
        try {
            const response = await this.client.post('/generate', {
                description,
                framework
            });
            return response.data.component;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    private handleError(error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                vscode.window.showErrorMessage('Authentication failed. Please check your API key in settings.');
            } else if (error.response?.status === 429) {
                vscode.window.showErrorMessage('Rate limit exceeded. Please try again later.');
            } else if (error.code === 'ECONNABORTED') {
                vscode.window.showErrorMessage('Request timeout. Please check your internet connection.');
            } else {
                vscode.window.showErrorMessage(`API Error: ${error.response?.data?.message || error.message}`);
            }
        } else {
            vscode.window.showErrorMessage(`Unexpected error: ${error.message}`);
        }
    }
}