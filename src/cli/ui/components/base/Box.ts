/**
 * Box component - Container with optional border
 */

import { Component, ComponentOptions } from './Component.js';
import { Screen } from '../../core/screen.js';

export interface BoxOptions extends ComponentOptions {
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  title?: string;
  titleAlign?: 'left' | 'center' | 'right';
}

export class Box extends Component {
  protected padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  protected title?: string;
  protected titleAlign: 'left' | 'center' | 'right';

  constructor(options: BoxOptions = {}) {
    super({
      ...options,
      style: {
        border: true,
        ...options.style
      }
    });
    
    const p = options.padding || {};
    this.padding = {
      top: p.top || 0,
      right: p.right || 0,
      bottom: p.bottom || 0,
      left: p.left || 0
    };
    
    this.title = options.title;
    this.titleAlign = options.titleAlign || 'left';
  }

  public setTitle(title: string): void {
    this.title = title;
    this.emit('titleChange', title);
  }

  public getContentBounds(): { x: number; y: number; width: number; height: number } {
    const borderOffset = this.style.border ? 1 : 0;
    
    return {
      x: this.padding.left + borderOffset,
      y: this.padding.top + borderOffset,
      width: Math.max(0, this.width - this.padding.left - this.padding.right - (borderOffset * 2)),
      height: Math.max(0, this.height - this.padding.top - this.padding.bottom - (borderOffset * 2))
    };
  }

  public layout(): void {
    if (this.children.length === 0) return;
    
    const content = this.getContentBounds();
    
    // Simple stacking layout by default
    let currentY = 0;
    
    for (const child of this.children) {
      const childHeight = Math.min(
        child.getHeight() || content.height,
        content.height - currentY
      );
      
      if (childHeight <= 0) break;
      
      child.setBounds(
        content.x,
        content.y + currentY,
        content.width,
        childHeight
      );
      
      child.layout();
      currentY += childHeight;
    }
  }

  public render(screen: Screen): void {
    if (!this.visible) return;
    
    // Fill background
    if (this.style.bg) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          screen.setCell(
            this.absoluteX + x,
            this.absoluteY + y,
            ' ',
            { bg: this.style.bg }
          );
        }
      }
    }
    
    // Draw border
    if (this.style.border) {
      this.drawBorder(screen);
      
      // Draw title if present
      if (this.title) {
        this.drawTitle(screen);
      }
    }
  }

  private drawTitle(screen: Screen): void {
    if (!this.title || !this.style.border) return;
    
    const maxTitleWidth = this.width - 4; // Leave space for border corners and padding
    const title = this.title.length > maxTitleWidth 
      ? this.title.substring(0, maxTitleWidth - 3) + '...'
      : this.title;
    
    let titleX = this.absoluteX + 2; // Default left align
    
    if (this.titleAlign === 'center') {
      titleX = this.absoluteX + Math.floor((this.width - title.length) / 2);
    } else if (this.titleAlign === 'right') {
      titleX = this.absoluteX + this.width - title.length - 2;
    }
    
    // Draw title
    screen.writeText(
      titleX,
      this.absoluteY,
      title,
      {
        fg: this.style.fg,
        bg: this.style.bg,
        bold: true
      }
    );
  }
}