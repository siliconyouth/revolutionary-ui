/**
 * Claude AI Session Authentication
 * Simple browser-based authentication using official Claude AI session
 */

import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SessionData {
  sessionKey: string;
  createdAt: number;
  expiresAt: number;
}

export class ClaudeSessionAuth {
  private configPath: string;
  
  constructor() {
    const configDir = path.join(os.homedir(), '.revolutionary-ui');
    this.configPath = path.join(configDir, 'claude-session.json');
  }

  /**
   * Start the authentication flow - simplified like Claude Code
   */
  async authenticate(): Promise<boolean> {
    console.log(chalk.cyan('\n🌐 Claude AI Browser Authentication\n'));
    console.log(chalk.gray('Authenticating with your Claude.ai account for unlimited AI usage.\n'));

    // Step 1: Open Claude.ai login page
    console.log(chalk.bold('Step 1: Opening Claude.ai...'));
    const loginUrl = 'https://claude.ai/login?return-to=/api/auth/session';
    
    console.log(chalk.gray('\nYour browser will open to Claude.ai'));
    console.log(chalk.gray('Please log in if you\'re not already logged in.\n'));
    
    await open(loginUrl);
    
    // Step 2: Wait for user to complete login
    console.log(chalk.bold('Step 2: Complete login in your browser\n'));
    
    const { ready } = await inquirer.prompt([{
      type: 'confirm',
      name: 'ready',
      message: 'Have you completed login to Claude.ai?',
      default: true
    }]);
    
    if (!ready) {
      console.log(chalk.yellow('\nAuthentication cancelled.'));
      return false;
    }

    // Step 3: Retrieve session automatically
    console.log(chalk.bold('\nStep 3: Retrieving session...'));
    const spinner = ora('Connecting to Claude.ai...').start();
    
    try {
      // Get session from the Claude.ai API endpoint
      const sessionKey = await this.retrieveSession();
      
      if (sessionKey) {
        const sessionData: SessionData = {
          sessionKey,
          createdAt: Date.now(),
          expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        };
        
        await this.saveSession(sessionData);
        spinner.succeed('Session retrieved successfully!');
        return true;
      } else {
        spinner.fail('Could not retrieve session');
        console.log(chalk.gray('\nPlease make sure you are logged in to Claude.ai'));
        return false;
      }
    } catch (error) {
      spinner.fail('Authentication failed');
      console.error(chalk.red('\nError:'), error.message);
      return false;
    }
  }

  /**
   * Retrieve session from Claude.ai - simplified method
   */
  private async retrieveSession(): Promise<string | null> {
    try {
      // Use the same method Claude Code uses - check for existing session
      // This is a simplified approach that checks if the user has an active session
      
      // First, try to get session from system keychain (if available)
      if (process.platform === 'darwin') {
        try {
          const { stdout } = await execAsync(
            'security find-generic-password -s "claude.ai" -w 2>/dev/null'
          );
          if (stdout.trim()) {
            return stdout.trim();
          }
        } catch {
          // Keychain not available or no stored session
        }
      }
      
      // Fallback: Prompt user for session key directly
      console.log(chalk.yellow('\n\nAutomatic session retrieval not available.'));
      console.log(chalk.gray('You can get your session key by:'));
      console.log(chalk.gray('1. Going to: https://claude.ai/api/auth/session'));
      console.log(chalk.gray('2. Copy the "sessionKey" value from the JSON response\n'));
      
      const { sessionKey } = await inquirer.prompt([{
        type: 'password',
        name: 'sessionKey',
        message: 'Paste your session key:',
        validate: (value: string) => {
          if (!value || value.length < 20) {
            return 'Please enter a valid session key';
          }
          return true;
        }
      }]);
      
      return sessionKey;
    } catch (error) {
      throw new Error('Failed to retrieve session');
    }
  }

  /**
   * Save session data to config file
   */
  private async saveSession(sessionData: SessionData): Promise<void> {
    const configDir = path.dirname(this.configPath);
    
    // Ensure config directory exists
    await fs.mkdir(configDir, { recursive: true });
    
    // Save session data
    await fs.writeFile(
      this.configPath,
      JSON.stringify(sessionData, null, 2),
      'utf-8'
    );
    
    // Set file permissions to be readable only by the user
    await fs.chmod(this.configPath, 0o600);
    
    // Store in system keychain if available (macOS)
    if (process.platform === 'darwin') {
      try {
        await execAsync(
          `security add-generic-password -U -s "claude.ai" -a "revolutionary-ui" -w "${sessionData.sessionKey}"`
        );
      } catch {
        // Keychain storage is optional
      }
    }
  }

  /**
   * Load saved session data
   */
  async loadSession(): Promise<SessionData | null> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const session = JSON.parse(data) as SessionData;
      
      // Check if session is expired
      if (session.expiresAt && session.expiresAt < Date.now()) {
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.loadSession();
    return session !== null;
  }

  /**
   * Get current session key
   */
  async getSessionKey(): Promise<string | null> {
    const session = await this.loadSession();
    return session?.sessionKey || null;
  }

  /**
   * Clear saved session
   */
  async logout(): Promise<void> {
    try {
      await fs.unlink(this.configPath);
      
      // Remove from keychain if on macOS
      if (process.platform === 'darwin') {
        try {
          await execAsync('security delete-generic-password -s "claude.ai" 2>/dev/null');
        } catch {
          // Ignore keychain errors
        }
      }
    } catch {
      // File doesn't exist, that's okay
    }
  }
}