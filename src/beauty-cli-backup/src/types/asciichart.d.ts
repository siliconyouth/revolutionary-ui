declare module 'asciichart' {
  interface PlotOptions {
    height?: number;
    offset?: number;
    padding?: string;
    format?: (x: number) => string;
  }
  
  export function plot(data: number[], options?: PlotOptions): string;
}