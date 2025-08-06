/**
 * Screen abstraction for terminal operations
 * Handles low-level terminal interactions
 */

import { WriteStream } from 'tty';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ScreenBuffer {
  char: string;
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  underline?: boolean;
}

export class Screen {
  private stdout: WriteStream;
  private stdin: NodeJS.ReadStream;
  private buffer: ScreenBuffer[][];
  private previousBuffer: ScreenBuffer[][];
  private size: Size;
  private cursorVisible: boolean = false;
  private alternateScreen: boolean = false;

  constructor(stdout: WriteStream = process.stdout, stdin: NodeJS.ReadStream = process.stdin) {
    this.stdout = stdout;
    this.stdin = stdin;
    this.size = this.getSize();
    this.buffer = this.createBuffer();
    this.previousBuffer = this.createBuffer();
  }

  private getSize(): Size {
    return {
      width: this.stdout.columns || 80,
      height: this.stdout.rows || 24
    };
  }

  private createBuffer(): ScreenBuffer[][] {
    const buffer: ScreenBuffer[][] = [];
    for (let y = 0; y < this.size.height; y++) {
      buffer[y] = [];
      for (let x = 0; x < this.size.width; x++) {
        buffer[y][x] = { char: ' ' };
      }
    }
    return buffer;
  }

  public init(): void {
    // Enter alternate screen buffer
    if (!this.alternateScreen) {
      this.write('\x1b[?1049h');
      this.alternateScreen = true;
    }
    
    // Hide cursor
    this.hideCursor();
    
    // Clear screen
    this.clear();
    
    // Setup resize handler
    this.stdout.on('resize', () => {
      this.handleResize();
    });
    
    // Setup raw mode for input
    if (this.stdin.isTTY) {
      this.stdin.setRawMode(true);
    }
  }

  public destroy(): void {
    // Show cursor
    this.showCursor();
    
    // Exit alternate screen buffer
    if (this.alternateScreen) {
      this.write('\x1b[?1049l');
      this.alternateScreen = false;
    }
    
    // Restore normal mode
    if (this.stdin.isTTY) {
      this.stdin.setRawMode(false);
    }
  }

  private handleResize(): void {
    this.size = this.getSize();
    this.buffer = this.createBuffer();
    this.previousBuffer = this.createBuffer();
    this.clear();
  }

  public clear(): void {
    // Don't clear the actual screen, just the buffer
    // The render() method will handle the visual update
    this.buffer = this.createBuffer();
  }

  public clearLine(y: number): void {
    if (y < 0 || y >= this.size.height) return;
    
    for (let x = 0; x < this.size.width; x++) {
      this.buffer[y][x] = { char: ' ' };
    }
  }

  public write(text: string): void {
    this.stdout.write(text);
  }

  public moveCursor(x: number, y: number): void {
    this.write(`\x1b[${y + 1};${x + 1}H`);
  }

  public hideCursor(): void {
    if (this.cursorVisible) {
      this.write('\x1b[?25l');
      this.cursorVisible = false;
    }
  }

  public showCursor(): void {
    if (!this.cursorVisible) {
      this.write('\x1b[?25h');
      this.cursorVisible = true;
    }
  }

  public setCell(x: number, y: number, char: string, style?: Partial<ScreenBuffer>): void {
    if (x < 0 || x >= this.size.width || y < 0 || y >= this.size.height) return;
    
    this.buffer[y][x] = {
      char: char || ' ',
      ...style
    };
  }

  public writeText(x: number, y: number, text: string, style?: Partial<ScreenBuffer>): void {
    let currentX = x;
    for (const char of text) {
      if (currentX >= this.size.width) break;
      this.setCell(currentX, y, char, style);
      currentX++;
    }
  }

  public drawBox(x: number, y: number, width: number, height: number, style?: Partial<ScreenBuffer>): void {
    // Top border
    this.setCell(x, y, '┌', style);
    for (let i = 1; i < width - 1; i++) {
      this.setCell(x + i, y, '─', style);
    }
    this.setCell(x + width - 1, y, '┐', style);
    
    // Side borders
    for (let i = 1; i < height - 1; i++) {
      this.setCell(x, y + i, '│', style);
      this.setCell(x + width - 1, y + i, '│', style);
    }
    
    // Bottom border
    this.setCell(x, y + height - 1, '└', style);
    for (let i = 1; i < width - 1; i++) {
      this.setCell(x + i, y + height - 1, '─', style);
    }
    this.setCell(x + width - 1, y + height - 1, '┘', style);
  }

  public render(): void {
    // Diff and render only changed cells
    for (let y = 0; y < this.size.height; y++) {
      for (let x = 0; x < this.size.width; x++) {
        const cell = this.buffer[y][x];
        const prevCell = this.previousBuffer[y][x];
        
        if (this.cellsEqual(cell, prevCell)) continue;
        
        this.moveCursor(x, y);
        
        // Apply styles
        let styleCode = '\x1b[0m'; // Reset
        if (cell.bold) styleCode += '\x1b[1m';
        if (cell.dim) styleCode += '\x1b[2m';
        if (cell.underline) styleCode += '\x1b[4m';
        if (cell.fg) styleCode += this.getColorCode(cell.fg, true);
        if (cell.bg) styleCode += this.getColorCode(cell.bg, false);
        
        this.write(styleCode + cell.char + '\x1b[0m');
      }
    }
    
    // Update previous buffer
    this.previousBuffer = this.buffer.map(row => row.map(cell => ({ ...cell })));
  }

  private cellsEqual(a: ScreenBuffer, b: ScreenBuffer): boolean {
    return a.char === b.char &&
           a.fg === b.fg &&
           a.bg === b.bg &&
           a.bold === b.bold &&
           a.dim === b.dim &&
           a.underline === b.underline;
  }

  private getColorCode(color: string, isForeground: boolean): string {
    const base = isForeground ? 30 : 40;
    
    const colors: Record<string, number> = {
      black: 0,
      red: 1,
      green: 2,
      yellow: 3,
      blue: 4,
      magenta: 5,
      cyan: 6,
      white: 7
    };
    
    if (colors[color] !== undefined) {
      return `\x1b[${base + colors[color]}m`;
    }
    
    // Support bright colors
    const brightColors: Record<string, number> = {
      brightBlack: 0,
      brightRed: 1,
      brightGreen: 2,
      brightYellow: 3,
      brightBlue: 4,
      brightMagenta: 5,
      brightCyan: 6,
      brightWhite: 7
    };
    
    if (brightColors[color] !== undefined) {
      return `\x1b[${base + 60 + brightColors[color]}m`;
    }
    
    return '';
  }

  public getWidth(): number {
    return this.size.width;
  }

  public getHeight(): number {
    return this.size.height;
  }
}