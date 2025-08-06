/**
 * Base component class
 * All UI components extend from this
 */

import { Screen } from '../../core/screen.js';
import { EventEmitter } from 'events';

export interface ComponentStyle {
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  underline?: boolean;
  border?: boolean;
  borderStyle?: {
    fg?: string;
    bg?: string;
  };
}

export interface ComponentOptions {
  style?: ComponentStyle;
  visible?: boolean;
  focusable?: boolean;
}

export abstract class Component extends EventEmitter {
  protected x: number = 0;
  protected y: number = 0;
  protected width: number = 0;
  protected height: number = 0;
  protected parent: Component | null = null;
  protected children: Component[] = [];
  protected style: ComponentStyle;
  protected visible: boolean;
  protected focusable: boolean;
  protected focused: boolean = false;
  protected absoluteX: number = 0;
  protected absoluteY: number = 0;

  constructor(options: ComponentOptions = {}) {
    super();
    this.style = options.style || {};
    this.visible = options.visible !== false;
    this.focusable = options.focusable || false;
  }

  public setBounds(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Calculate absolute position
    if (this.parent) {
      this.absoluteX = this.parent.getAbsoluteX() + x;
      this.absoluteY = this.parent.getAbsoluteY() + y;
    } else {
      this.absoluteX = x;
      this.absoluteY = y;
    }
    
    this.emit('resize', { width, height });
  }

  public getAbsoluteX(): number {
    return this.absoluteX;
  }

  public getAbsoluteY(): number {
    return this.absoluteY;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public setStyle(style: ComponentStyle): void {
    this.style = { ...this.style, ...style };
    this.emit('styleChange', this.style);
  }

  public getStyle(): ComponentStyle {
    return this.style;
  }

  public show(): void {
    this.visible = true;
    this.emit('show');
  }

  public hide(): void {
    this.visible = false;
    this.emit('hide');
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public focus(): void {
    if (!this.focusable) return;
    this.focused = true;
    this.emit('focus');
  }

  public blur(): void {
    this.focused = false;
    this.emit('blur');
  }

  public isFocused(): boolean {
    return this.focused;
  }

  public isFocusable(): boolean {
    return this.focusable;
  }

  public addChild(child: Component): void {
    child.parent = this;
    this.children.push(child);
    this.emit('childAdded', child);
  }

  public removeChild(child: Component): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
      this.emit('childRemoved', child);
    }
  }

  public getChildren(): Component[] {
    return this.children;
  }

  public getParent(): Component | null {
    return this.parent;
  }

  public layout(): void {
    // Default layout does nothing
    // Override in subclasses for custom layout
    for (const child of this.children) {
      child.layout();
    }
  }

  protected drawBorder(screen: Screen): void {
    if (!this.style.border) return;
    
    const borderStyle = this.style.borderStyle || {};
    screen.drawBox(
      this.absoluteX,
      this.absoluteY,
      this.width,
      this.height,
      borderStyle
    );
  }

  public abstract render(screen: Screen): void;
  
  public handleKeyPress(key: string): boolean {
    // Override in subclasses to handle input
    // Return true if handled, false otherwise
    return false;
  }

  public destroy(): void {
    // Remove from parent
    if (this.parent) {
      this.parent.removeChild(this);
    }
    
    // Destroy all children
    for (const child of [...this.children]) {
      child.destroy();
    }
    
    // Remove all listeners
    this.removeAllListeners();
    
    this.emit('destroy');
  }
}