/**
 * Claude AI Authentication Manager
 * Handles browser-based authentication for Claude AI
 */

import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { homedir } from 'os';
import crypto from 'crypto';

interface ClaudeAuthToken {
  sessionKey: string;
  organizationId?: string;
  expiresAt?: string;
  createdAt: string;
}

export class ClaudeAuthManager {
  private configPath: string;
  private authToken: ClaudeAuthToken | null = null;
  private readonly AUTH_CALLBACK_PORT = 9876;
  private readonly CLAUDE_AUTH_URL = 'https://claude.ai/login';

  constructor() {
    this.configPath = path.join(homedir(), '.revolutionary-ui', 'claude-auth.json');
  }

  /**
   * Check if user is authenticated with Claude AI
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.loadAuthToken();
      return this.authToken !== null && this.isTokenValid();
    } catch {
      return false;
    }
  }

  /**
   * Get current auth token
   */
  async getAuthToken(): Promise<ClaudeAuthToken | null> {
    if (!this.authToken) {
      await this.loadAuthToken();
    }
    return this.authToken;
  }

  /**
   * Authenticate with Claude AI through browser
   */
  async authenticate(): Promise<boolean> {
    console.log(chalk.cyan('\n🔐 Claude AI Browser Authentication\n'));
    console.log(chalk.gray('This will open your browser to authenticate with Claude AI.'));
    console.log(chalk.gray('After logging in, you\'ll be redirected back to complete the setup.\n'));

    const spinner = ora('Starting authentication server...').start();

    try {
      // Generate state for security
      const state = crypto.randomBytes(32).toString('hex');
      
      // Start local server to receive callback
      const authCode = await this.startAuthServer(state);
      
      if (authCode) {
        spinner.succeed('Authentication successful!');
        
        // Extract session info from auth code
        const token = await this.extractSessionToken(authCode);
        
        if (token) {
          await this.saveAuthToken(token);
          console.log(chalk.green('\n✅ Claude AI authentication complete!'));
          return true;
        }
      }
      
      spinner.fail('Authentication failed');
      return false;
      
    } catch (error) {
      spinner.fail('Authentication failed');
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      return false;
    }
  }

  /**
   * Start local server to handle auth callback
   */
  private async startAuthServer(state: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const app = express();
      let server: any;
      
      // Setup callback route
      app.get('/auth/callback', (req, res) => {
        const { code, state: returnedState, sessionKey } = req.query;
        
        // For now, we'll accept sessionKey directly
        if (sessionKey) {
          res.send(`
            <html>
              <head>
                <title>Authentication Successful</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #f5f5f5;
                  }
                  .container {
                    text-align: center;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  h1 { color: #4CAF50; }
                  p { color: #666; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>✅ Authentication Successful!</h1>
                  <p>You can now close this window and return to the terminal.</p>
                  <script>
                    setTimeout(() => window.close(), 3000);
                  </script>
                </div>
              </body>
            </html>
          `);
          
          server.close();
          resolve(sessionKey as string);
        } else {
          res.status(400).send('Missing session key');
          server.close();
          reject(new Error('Missing session key'));
        }
      });
      
      // Start server
      server = app.listen(this.AUTH_CALLBACK_PORT, async () => {
        console.log(chalk.gray(`\n🌐 Auth server listening on http://localhost:${this.AUTH_CALLBACK_PORT}`));
        
        // Open browser with instructions
        const authUrl = this.buildAuthInstructionsPage(state);
        await open(authUrl);
        
        console.log(chalk.yellow('\n📋 Manual Instructions:'));
        console.log(chalk.gray('1. Log in to Claude AI in your browser'));
        console.log(chalk.gray('2. Open Developer Tools (F12)'));
        console.log(chalk.gray('3. Go to Application/Storage → Cookies'));
        console.log(chalk.gray('4. Find the sessionKey cookie value'));
        console.log(chalk.gray('5. Visit: ' + chalk.cyan(`http://localhost:${this.AUTH_CALLBACK_PORT}/auth/callback?sessionKey=YOUR_SESSION_KEY`)));
        console.log(chalk.gray('\nWaiting for authentication...'));
      });
      
      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  /**
   * Build auth instructions page
   */
  private buildAuthInstructionsPage(state: string): string {
    // Create a local HTML file with instructions
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Revolutionary UI - Claude AI Authentication</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    .steps {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .step {
      margin: 15px 0;
      padding-left: 30px;
      position: relative;
    }
    .step::before {
      content: attr(data-step);
      position: absolute;
      left: 0;
      background: #007bff;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    code {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    .button {
      display: inline-block;
      background: #007bff;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      text-decoration: none;
      margin-top: 20px;
    }
    .button:hover {
      background: #0056b3;
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .submit-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .submit-btn:hover {
      background: #218838;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Revolutionary UI - Claude AI Authentication</h1>
    <p class="subtitle">Connect your Claude AI account to use advanced AI generation features</p>
    
    <div class="steps">
      <h3>Steps to authenticate:</h3>
      <div class="step" data-step="1">
        <strong>Open Claude AI in a new tab</strong><br>
        <a href="https://claude.ai" target="_blank" class="button">Open Claude AI</a>
      </div>
      
      <div class="step" data-step="2">
        <strong>Log in to your Claude AI account</strong><br>
        <small>Make sure you're logged in and can access Claude</small>
      </div>
      
      <div class="step" data-step="3">
        <strong>Extract your session key</strong><br>
        <small>Open Developer Tools (F12) → Application → Cookies → claude.ai → Copy <code>sessionKey</code> value</small>
      </div>
      
      <div class="step" data-step="4">
        <strong>Paste your session key below</strong><br>
        <form onsubmit="submitAuth(event)">
          <input type="text" id="sessionKey" placeholder="Paste your sessionKey here..." required>
          <button type="submit" class="submit-btn">Complete Authentication</button>
        </form>
      </div>
    </div>
    
    <p style="color: #666; margin-top: 30px;">
      <strong>Why do we need this?</strong><br>
      Using your Claude AI session allows you to leverage your existing Claude subscription without API rate limits.
      Your session key is stored locally and never sent to our servers.
    </p>
  </div>
  
  <script>
    function submitAuth(event) {
      event.preventDefault();
      const sessionKey = document.getElementById('sessionKey').value;
      if (sessionKey) {
        window.location.href = 'http://localhost:${this.AUTH_CALLBACK_PORT}/auth/callback?sessionKey=' + encodeURIComponent(sessionKey);
      }
    }
  </script>
</body>
</html>`;
    
    const tempFile = path.join(require('os').tmpdir(), 'revolutionary-ui-auth.html');
    require('fs').writeFileSync(tempFile, htmlContent);
    return `file://${tempFile}`;
  }

  /**
   * Extract session token from auth code
   */
  private async extractSessionToken(authCode: string): Promise<ClaudeAuthToken> {
    // In this implementation, authCode is already the sessionKey
    return {
      sessionKey: authCode,
      createdAt: new Date().toISOString(),
      // Session keys typically last for a while, but we'll set a conservative expiry
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
  }

  /**
   * Save auth token to disk
   */
  private async saveAuthToken(token: ClaudeAuthToken): Promise<void> {
    const configDir = path.dirname(this.configPath);
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(token, null, 2), 'utf-8');
    this.authToken = token;
  }

  /**
   * Load auth token from disk
   */
  private async loadAuthToken(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.authToken = JSON.parse(data);
    } catch {
      this.authToken = null;
    }
  }

  /**
   * Check if token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.authToken) return false;
    
    if (this.authToken.expiresAt) {
      const expiryDate = new Date(this.authToken.expiresAt);
      return expiryDate > new Date();
    }
    
    // If no expiry, check if token is older than 7 days
    const createdDate = new Date(this.authToken.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > weekAgo;
  }

  /**
   * Clear stored authentication
   */
  async logout(): Promise<void> {
    try {
      await fs.unlink(this.configPath);
      this.authToken = null;
      console.log(chalk.green('✅ Logged out from Claude AI'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to logout:', error.message));
    }
  }

  /**
   * Get authentication headers for Claude AI requests
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.authToken) {
      throw new Error('Not authenticated with Claude AI');
    }
    
    return {
      'Cookie': `sessionKey=${this.authToken.sessionKey}`,
      'User-Agent': 'Revolutionary-UI-CLI/3.3.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }
}