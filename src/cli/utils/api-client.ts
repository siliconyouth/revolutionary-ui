import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AuthManager } from './auth-manager'
import { version } from '../../../package.json'

export class APIClient {
  private client: AxiosInstance
  private authManager: AuthManager
  private baseURL: string

  constructor() {
    this.baseURL = process.env.REVOLUTIONARY_UI_API_URL || 'https://api.revolutionary-ui.com/v1'
    this.authManager = new AuthManager()
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `revolutionary-ui-cli/${version}`,
        'X-Client-Version': version
      }
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available and not already set
        if (!config.headers.Authorization) {
          const token = await this.authManager.getToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.authManager.clearCredentials()
        }
        
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  // Streaming API for AI responses
  async stream(url: string, data: any, onData: (chunk: string) => void): Promise<void> {
    const token = await this.authManager.getToken()
    
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            return
          }
          
          try {
            const parsed = JSON.parse(data)
            onData(parsed.content || parsed.delta?.content || '')
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  // File upload support
  async upload(url: string, file: Buffer | ReadableStream, filename: string, metadata?: any): Promise<AxiosResponse> {
    const FormData = require('form-data')
    const form = new FormData()
    
    form.append('file', file, filename)
    
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        form.append(key, metadata[key])
      })
    }
    
    return this.client.post(url, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })
  }

  // Download file
  async download(url: string, outputPath: string): Promise<void> {
    const fs = require('fs')
    const writer = fs.createWriteStream(outputPath)
    
    const response = await this.client.get(url, {
      responseType: 'stream'
    })
    
    response.data.pipe(writer)
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }

  // Paginated requests
  async *paginate<T = any>(url: string, params?: any): AsyncGenerator<T[], void, unknown> {
    let page = 1
    let hasMore = true
    
    while (hasMore) {
      const response = await this.get<{
        data: T[]
        pagination: {
          page: number
          pageSize: number
          total: number
          totalPages: number
        }
      }>(url, {
        params: {
          ...params,
          page,
          pageSize: params?.pageSize || 20
        }
      })
      
      yield response.data.data
      
      hasMore = page < response.data.pagination.totalPages
      page++
    }
  }

  // Retry logic for important operations
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error
        }
        
        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries')
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health')
      return response.data.status === 'ok'
    } catch (error) {
      return false
    }
  }
}