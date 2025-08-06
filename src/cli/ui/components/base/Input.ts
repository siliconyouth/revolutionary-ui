/**
 * Input component - Basic text input field
 */

import { Component, ComponentOptions } from './Component.js';
import { Screen } from '../../core/screen.js';

export interface InputOptions extends ComponentOptions {
  value?: string;
  placeholder?: string;
  password?: boolean;
  maxLength?: number;
}

export class Input extends Component {
  protected value: string;
  protected placeholder: string;
  protected password: boolean;
  protected maxLength?: number;
  protected cursorPosition: number = 0;
  protected scrollOffset: number = 0;

  constructor(options: InputOptions = {}) {
    super({
      ...options,
      focusable: true
    });
    
    this.value = options.value || '';
    this.placeholder = options.placeholder || '';
    this.password = options.password || false;
    this.maxLength = options.maxLength;
    this.cursorPosition = this.value.length;
  }

  public getValue(): string {
    return this.value;
  }

  public setValue(value: string): void {
    if (this.maxLength && value.length > this.maxLength) {
      value = value.substring(0, this.maxLength);
    }
    
    this.value = value;
    this.cursorPosition = value.length;
    this.updateScrollOffset();
    this.emit('valueChange', value);
  }

  public clear(): void {
    this.setValue('');
  }

  private updateScrollOffset(): void {
    const visibleWidth = this.width - 2; // Account for borders/padding
    
    // Ensure cursor is visible
    if (this.cursorPosition < this.scrollOffset) {
      this.scrollOffset = this.cursorPosition;
    } else if (this.cursorPosition >= this.scrollOffset + visibleWidth) {
      this.scrollOffset = this.cursorPosition - visibleWidth + 1;
    }
  }

  public handleKeyPress(key: string): boolean {
    if (!this.focused) return false;
    
    switch (key) {
      case 'left':
        if (this.cursorPosition > 0) {
          this.cursorPosition--;
          this.updateScrollOffset();
          this.emit('cursorMove', this.cursorPosition);
        }
        return true;
        
      case 'right':
        if (this.cursorPosition < this.value.length) {
          this.cursorPosition++;
          this.updateScrollOffset();
          this.emit('cursorMove', this.cursorPosition);
        }
        return true;
        
      case 'home':
        this.cursorPosition = 0;
        this.updateScrollOffset();
        this.emit('cursorMove', this.cursorPosition);
        return true;
        
      case 'end':
        this.cursorPosition = this.value.length;
        this.updateScrollOffset();
        this.emit('cursorMove', this.cursorPosition);
        return true;
        
      case 'backspace':
        if (this.cursorPosition > 0) {
          this.value = 
            this.value.substring(0, this.cursorPosition - 1) +
            this.value.substring(this.cursorPosition);
          this.cursorPosition--;
          this.updateScrollOffset();
          this.emit('valueChange', this.value);
        }
        return true;
        
      case 'delete':
        if (this.cursorPosition < this.value.length) {
          this.value = 
            this.value.substring(0, this.cursorPosition) +
            this.value.substring(this.cursorPosition + 1);
          this.emit('valueChange', this.value);
        }
        return true;
        
      default:
        // Handle regular character input
        if (key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) < 127) {
          if (!this.maxLength || this.value.length < this.maxLength) {
            this.value = 
              this.value.substring(0, this.cursorPosition) +
              key +
              this.value.substring(this.cursorPosition);
            this.cursorPosition++;
            this.updateScrollOffset();
            this.emit('valueChange', this.value);
          }
          return true;
        }
    }
    
    return false;
  }

  public render(screen: Screen): void {
    if (!this.visible) return;
    
    // Draw background
    for (let x = 0; x < this.width; x++) {
      screen.setCell(
        this.absoluteX + x,
        this.absoluteY,
        ' ',
        {
          bg: this.focused ? this.style.bg || 'blue' : this.style.bg,
          fg: this.style.fg
        }
      );
    }
    
    // Prepare display text
    let displayText = this.value;
    if (this.password) {
      displayText = '*'.repeat(this.value.length);
    }
    
    // Show placeholder if empty
    if (displayText.length === 0 && this.placeholder && !this.focused) {
      screen.writeText(
        this.absoluteX + 1,
        this.absoluteY,
        this.placeholder.substring(0, this.width - 2),
        {
          ...this.style,
          dim: true
        }
      );
      return;
    }
    
    // Calculate visible portion
    const visibleWidth = this.width - 2;
    const visibleText = displayText.substring(
      this.scrollOffset,
      this.scrollOffset + visibleWidth
    );
    
    // Draw text
    screen.writeText(
      this.absoluteX + 1,
      this.absoluteY,
      visibleText,
      this.style
    );
    
    // Draw cursor if focused
    if (this.focused) {
      const cursorX = this.cursorPosition - this.scrollOffset;
      if (cursorX >= 0 && cursorX < visibleWidth) {
        const charUnderCursor = displayText[this.cursorPosition] || ' ';
        screen.setCell(
          this.absoluteX + 1 + cursorX,
          this.absoluteY,
          charUnderCursor,
          {
            ...this.style,
            bg: this.style.fg || 'white',
            fg: this.style.bg || 'black'
          }
        );
      }
    }
  }
}