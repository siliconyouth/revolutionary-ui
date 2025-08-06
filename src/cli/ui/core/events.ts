/**
 * Event handling system
 * Manages keyboard and mouse input
 */

import { EventEmitter } from 'events';
import { Component } from '../components/base/Component.js';

export interface KeyEvent {
  name: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  sequence: string;
}

export class EventManager extends EventEmitter {
  private stdin: NodeJS.ReadStream;
  private rootComponent: Component | null = null;
  private focusedComponent: Component | null = null;
  private isActive: boolean = false;

  constructor(stdin: NodeJS.ReadStream = process.stdin) {
    super();
    this.stdin = stdin;
  }

  public setRootComponent(component: Component): void {
    this.rootComponent = component;
    this.findAndFocusFirstFocusable();
  }

  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.stdin.on('data', this.handleInput);
    
    // Ensure stdin is in raw mode
    if (this.stdin.isTTY) {
      this.stdin.setRawMode(true);
    }
    this.stdin.resume();
  }

  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.stdin.off('data', this.handleInput);
    this.stdin.pause();
  }

  private handleInput = (data: Buffer): void => {
    const key = this.parseKey(data);
    
    // Global quit handler
    if (key.name === 'q' && key.ctrl) {
      this.emit('quit');
      return;
    }
    
    // Tab navigation
    if (key.name === 'tab') {
      if (key.shift) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
      return;
    }
    
    // Send to focused component first
    if (this.focusedComponent) {
      const handled = this.focusedComponent.handleKeyPress(key.name);
      if (handled) return;
    }
    
    // Send to root component
    if (this.rootComponent) {
      const handled = this.propagateKeyPress(this.rootComponent, key.name);
      if (handled) return;
    }
    
    // Emit unhandled key event
    this.emit('keypress', key);
  };

  private parseKey(data: Buffer): KeyEvent {
    const sequence = data.toString();
    const key: KeyEvent = {
      name: '',
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
      sequence
    };
    
    // Parse common key sequences
    if (sequence === '\x1b[A') key.name = 'up';
    else if (sequence === '\x1b[B') key.name = 'down';
    else if (sequence === '\x1b[C') key.name = 'right';
    else if (sequence === '\x1b[D') key.name = 'left';
    else if (sequence === '\x1b[H') key.name = 'home';
    else if (sequence === '\x1b[F') key.name = 'end';
    else if (sequence === '\x1b[5~') key.name = 'pageup';
    else if (sequence === '\x1b[6~') key.name = 'pagedown';
    else if (sequence === '\x7f' || sequence === '\x08') key.name = 'backspace';
    else if (sequence === '\x1b[3~') key.name = 'delete';
    else if (sequence === '\r' || sequence === '\n') key.name = 'enter';
    else if (sequence === '\t') key.name = 'tab';
    else if (sequence === '\x1b[Z') { key.name = 'tab'; key.shift = true; }
    else if (sequence === '\x1b') key.name = 'escape';
    else if (sequence === ' ') key.name = 'space';
    else {
      // Control characters
      if (sequence.length === 1) {
        const code = sequence.charCodeAt(0);
        if (code < 32) {
          key.ctrl = true;
          key.name = String.fromCharCode(code + 96); // Convert to letter
        } else {
          key.name = sequence;
        }
      } else if (sequence.startsWith('\x1b')) {
        // Alt + key
        key.alt = true;
        key.name = sequence.substring(1);
      } else {
        key.name = sequence;
      }
    }
    
    return key;
  }

  private propagateKeyPress(component: Component, key: string): boolean {
    // Try current component
    if (component.handleKeyPress(key)) {
      return true;
    }
    
    // Try children
    for (const child of component.getChildren()) {
      if (this.propagateKeyPress(child, key)) {
        return true;
      }
    }
    
    return false;
  }

  public setFocus(component: Component): void {
    if (!component.isFocusable()) return;
    
    if (this.focusedComponent) {
      this.focusedComponent.blur();
    }
    
    this.focusedComponent = component;
    component.focus();
    this.emit('focusChange', component);
  }

  private findAndFocusFirstFocusable(): void {
    if (!this.rootComponent) return;
    
    const focusable = this.findFirstFocusable(this.rootComponent);
    if (focusable) {
      this.setFocus(focusable);
    }
  }

  private findFirstFocusable(component: Component): Component | null {
    if (component.isFocusable() && component.isVisible()) {
      return component;
    }
    
    for (const child of component.getChildren()) {
      const focusable = this.findFirstFocusable(child);
      if (focusable) return focusable;
    }
    
    return null;
  }

  private getAllFocusables(component: Component, list: Component[] = []): Component[] {
    if (component.isFocusable() && component.isVisible()) {
      list.push(component);
    }
    
    for (const child of component.getChildren()) {
      this.getAllFocusables(child, list);
    }
    
    return list;
  }

  private focusNext(): void {
    if (!this.rootComponent) return;
    
    const focusables = this.getAllFocusables(this.rootComponent);
    if (focusables.length === 0) return;
    
    if (!this.focusedComponent) {
      this.setFocus(focusables[0]);
      return;
    }
    
    const currentIndex = focusables.indexOf(this.focusedComponent);
    const nextIndex = (currentIndex + 1) % focusables.length;
    this.setFocus(focusables[nextIndex]);
  }

  private focusPrevious(): void {
    if (!this.rootComponent) return;
    
    const focusables = this.getAllFocusables(this.rootComponent);
    if (focusables.length === 0) return;
    
    if (!this.focusedComponent) {
      this.setFocus(focusables[focusables.length - 1]);
      return;
    }
    
    const currentIndex = focusables.indexOf(this.focusedComponent);
    const prevIndex = currentIndex === 0 ? focusables.length - 1 : currentIndex - 1;
    this.setFocus(focusables[prevIndex]);
  }

  public getFocusedComponent(): Component | null {
    return this.focusedComponent;
  }
}