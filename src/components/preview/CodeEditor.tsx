import React, { useRef, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

interface CodeEditorProps {
  code: string;
  language?: 'javascript' | 'typescript' | 'css' | 'html';
  onChange?: (code: string) => void;
  height?: number;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

const languageExtensions = {
  javascript: javascript({ jsx: true, typescript: false }),
  typescript: javascript({ jsx: true, typescript: true }),
  css: css(),
  html: html()
};

export default function CodeEditor({
  code,
  language = 'typescript',
  onChange,
  height = 300,
  readOnly = false,
  theme = 'dark',
  className = ''
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      languageExtensions[language] || languageExtensions.javascript,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorState.readOnly.of(readOnly),
      EditorView.theme({
        '&': { height: `${height}px` },
        '.cm-scroller': { overflow: 'auto' }
      })
    ];

    if (theme === 'dark') {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: code,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, readOnly, theme, height]);

  // Update code when it changes externally
  useEffect(() => {
    if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: code
        }
      });
    }
  }, [code]);

  return (
    <div 
      ref={editorRef} 
      className={`code-editor border rounded-lg overflow-hidden ${className}`}
    />
  );
}