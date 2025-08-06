/**
 * Type declarations for react-blessed
 */

declare module 'react-blessed' {
  import { Widgets } from 'blessed';
  import { ReactElement } from 'react';

  export function render(
    element: ReactElement,
    screen: Widgets.Screen
  ): void;

  export function createBlessedRenderer(
    blessed: any
  ): {
    render: (element: ReactElement, screen: Widgets.Screen) => void;
  };
}

// Extend JSX for blessed elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: any;
      list: any;
      log: any;
      text: any;
      progressbar: any;
      table: any;
      form: any;
      textbox: any;
      textarea: any;
      button: any;
      checkbox: any;
      radioset: any;
      radiobutton: any;
      line: any;
    }
  }
}