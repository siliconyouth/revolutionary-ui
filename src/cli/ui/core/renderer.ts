/**
 * Main rendering engine
 * Manages component tree and rendering pipeline
 */

import { Screen } from './screen.js';
import { Component } from '../components/base/Component.js';
import { EventEmitter } from 'events';

export interface RenderOptions {
  fps?: number;
  fullscreen?: boolean;
}

export class Renderer extends EventEmitter {
  private screen: Screen;
  private rootComponent: Component | null = null;
  private renderInterval: NodeJS.Timeout | null = null;
  private options: RenderOptions;
  private isRunning: boolean = false;

  constructor(screen: Screen, options: RenderOptions = {}) {
    super();
    this.screen = screen;
    this.options = {
      fps: 30,
      fullscreen: true,
      ...options
    };
  }

  public setRoot(component: Component): void {
    this.rootComponent = component;
    if (this.isRunning) {
      this.render();
    }
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.screen.init();
    
    // Start render loop
    const interval = 1000 / (this.options.fps || 30);
    this.renderInterval = setInterval(() => {
      this.render();
    }, interval);
    
    // Initial render
    this.render();
    
    this.emit('start');
  }

  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
      this.renderInterval = null;
    }
    
    this.screen.destroy();
    this.emit('stop');
  }

  private render(): void {
    if (!this.rootComponent) return;
    
    // Clear screen buffer (not the actual screen)
    this.screen.clear();
    
    // Calculate layout
    const width = this.screen.getWidth();
    const height = this.screen.getHeight();
    
    this.rootComponent.setBounds(0, 0, width, height);
    this.rootComponent.layout();
    
    // Render component tree
    this.renderComponent(this.rootComponent);
    
    // Flush to screen
    this.screen.render();
    
    this.emit('render');
  }

  private renderComponent(component: Component): void {
    if (!component.isVisible()) return;
    
    // Render the component
    component.render(this.screen);
    
    // Render children
    const children = component.getChildren();
    for (const child of children) {
      this.renderComponent(child);
    }
  }

  public forceRender(): void {
    if (this.isRunning) {
      this.render();
    }
  }

  public getScreen(): Screen {
    return this.screen;
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}