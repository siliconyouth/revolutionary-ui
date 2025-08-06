import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface SessionData {
  startTime: Date;
  componentsGenerated: number;
  codeReduction: number;
  lastActivity: Date;
  projectConfig?: any;
  history: any[];
}

class SessionManagerClass {
  private sessionData: SessionData;
  private sessionPath: string;

  constructor() {
    this.sessionPath = path.join(os.homedir(), '.revolutionary-ui', 'session.json');
    this.sessionData = {
      startTime: new Date(),
      componentsGenerated: 0,
      codeReduction: 0,
      lastActivity: new Date(),
      history: []
    };
  }

  async initialize(): Promise<SessionData> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.sessionPath), { recursive: true });
      
      // Try to load existing session
      const data = await fs.readFile(this.sessionPath, 'utf-8');
      const savedSession = JSON.parse(data);
      
      // Merge with new session
      this.sessionData = {
        ...savedSession,
        lastActivity: new Date()
      };
    } catch {
      // New session
      await this.save();
    }
    
    return this.sessionData;
  }

  async updateActivity(activity: any) {
    this.sessionData.lastActivity = new Date();
    this.sessionData.history.push({
      timestamp: new Date(),
      ...activity
    });
    
    if (activity.type === 'component_generated') {
      this.sessionData.componentsGenerated++;
      if (activity.codeReduction) {
        // Calculate average code reduction
        const total = this.sessionData.codeReduction * (this.sessionData.componentsGenerated - 1);
        this.sessionData.codeReduction = (total + activity.codeReduction) / this.sessionData.componentsGenerated;
      }
    }
    
    await this.save();
  }

  async setProjectConfig(config: any) {
    this.sessionData.projectConfig = config;
    await this.save();
  }

  getSessionData(): SessionData {
    return this.sessionData;
  }

  getAnalytics() {
    const sessionDuration = Date.now() - new Date(this.sessionData.startTime).getTime();
    const minutesActive = Math.floor(sessionDuration / 1000 / 60);
    
    return {
      sessionDuration: minutesActive,
      componentsGenerated: this.sessionData.componentsGenerated,
      averageCodeReduction: Math.round(this.sessionData.codeReduction),
      totalActions: this.sessionData.history.length,
      mostUsedFeature: this.getMostUsedFeature()
    };
  }

  private getMostUsedFeature(): string {
    const features = this.sessionData.history.reduce((acc, item) => {
      const feature = item.type || 'unknown';
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sorted = Object.entries(features).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] || 'none';
  }

  private async save() {
    try {
      await fs.writeFile(
        this.sessionPath,
        JSON.stringify(this.sessionData, null, 2)
      );
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }
}

export const SessionManager = new SessionManagerClass();