/**
 * Main application class
 * Coordinates the terminal UI application
 */

import { Screen } from '../core/screen.js';
import { Renderer } from '../core/renderer.js';
import { EventManager } from '../core/events.js';
import { Component } from '../components/base/Component.js';
import { EventEmitter } from 'events';

export interface AppOptions {
  title?: string;
  fullscreen?: boolean;
  fps?: number;
}

export class TerminalApp extends EventEmitter {
  private screen: Screen;
  private renderer: Renderer;
  private eventManager: EventManager;
  private options: AppOptions;
  private views: Map<string, Component> = new Map();
  private currentView: string | null = null;
  private isRunning: boolean = false;

  constructor(options: AppOptions = {}) {
    super();
    this.options = {
      title: 'Revolutionary UI',
      fullscreen: true,
      fps: 30,
      ...options
    };
    
    this.screen = new Screen();
    this.renderer = new Renderer(this.screen, {
      fps: this.options.fps,
      fullscreen: this.options.fullscreen
    });
    this.eventManager = new EventManager();
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle quit event
    this.eventManager.on('quit', () => {
      this.exit();
    });
    
    // Forward key events
    this.eventManager.on('keypress', (key) => {
      this.emit('keypress', key);
    });
    
    // Handle focus changes
    this.eventManager.on('focusChange', (component) => {
      this.emit('focusChange', component);
    });
  }

  public addView(name: string, view: Component): void {
    this.views.set(name, view);
    
    // If no current view, set this as current
    if (!this.currentView) {
      this.showView(name);
    }
  }

  public showView(name: string): void {
    const view = this.views.get(name);
    if (!view) {
      throw new Error(`View '${name}' not found`);
    }
    
    this.currentView = name;
    this.renderer.setRoot(view);
    this.eventManager.setRootComponent(view);
    
    this.emit('viewChange', name);
  }

  public getCurrentView(): string | null {
    return this.currentView;
  }

  public getView(name: string): Component | undefined {
    return this.views.get(name);
  }

  public run(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Set process title
    if (this.options.title) {
      process.title = this.options.title;
    }
    
    // Handle process signals
    process.on('SIGINT', () => this.exit());
    process.on('SIGTERM', () => this.exit());
    
    // Start components
    this.renderer.start();
    this.eventManager.start();
    
    this.emit('start');
  }

  public exit(code: number = 0): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    // Stop components
    this.eventManager.stop();
    this.renderer.stop();
    
    this.emit('exit', code);
    
    // Exit process
    process.exit(code);
  }

  public getScreen(): Screen {
    return this.screen;
  }

  public getRenderer(): Renderer {
    return this.renderer;
  }

  public getEventManager(): EventManager {
    return this.eventManager;
  }

  public on(event: 'start', listener: () => void): this;
  public on(event: 'exit', listener: (code: number) => void): this;
  public on(event: 'viewChange', listener: (view: string) => void): this;
  public on(event: 'keypress', listener: (key: any) => void): this;
  public on(event: 'focusChange', listener: (component: Component) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}