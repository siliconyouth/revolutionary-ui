/**
 * Text component - Displays text with word wrapping
 */

import { Component, ComponentOptions } from './Component.js';
import { Screen } from '../../core/screen.js';

export interface TextOptions extends ComponentOptions {
  content?: string;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
}

export class Text extends Component {
  protected content: string;
  protected align: 'left' | 'center' | 'right';
  protected wrap: boolean;
  protected lines: string[] = [];

  constructor(options: TextOptions = {}) {
    super(options);
    this.content = options.content || '';
    this.align = options.align || 'left';
    this.wrap = options.wrap !== false;
    this.updateLines();
  }

  public setContent(content: string): void {
    this.content = content;
    this.updateLines();
    this.emit('contentChange', content);
  }

  public getContent(): string {
    return this.content;
  }

  public setAlign(align: 'left' | 'center' | 'right'): void {
    this.align = align;
    this.updateLines();
  }

  private updateLines(): void {
    if (!this.wrap) {
      this.lines = this.content.split('\n');
      return;
    }
    
    // Word wrap
    this.lines = [];
    const paragraphs = this.content.split('\n');
    
    for (const paragraph of paragraphs) {
      if (paragraph.length === 0) {
        this.lines.push('');
        continue;
      }
      
      const words = paragraph.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= this.width) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            this.lines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        this.lines.push(currentLine);
      }
    }
  }

  public setBounds(x: number, y: number, width: number, height: number): void {
    super.setBounds(x, y, width, height);
    this.updateLines();
  }

  public render(screen: Screen): void {
    if (!this.visible) return;
    
    const maxLines = Math.min(this.lines.length, this.height);
    
    for (let i = 0; i < maxLines; i++) {
      const line = this.lines[i];
      let x = this.absoluteX;
      
      // Apply alignment
      if (this.align === 'center') {
        x += Math.floor((this.width - line.length) / 2);
      } else if (this.align === 'right') {
        x += this.width - line.length;
      }
      
      screen.writeText(
        x,
        this.absoluteY + i,
        line,
        this.style
      );
    }
  }

  public getLineCount(): number {
    return this.lines.length;
  }

  public getLines(): string[] {
    return [...this.lines];
  }
}