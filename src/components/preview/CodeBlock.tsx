import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: number;
  className?: string;
}

const languageMap: Record<string, string> = {
  'react': 'tsx',
  'vue': 'javascript',
  'angular': 'typescript',
  'svelte': 'javascript',
  'js': 'javascript',
  'ts': 'typescript'
};

export default function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = false,
  maxHeight,
  className = ''
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const mappedLanguage = languageMap[language] || language;
  const lineNumberClass = showLineNumbers ? 'line-numbers' : '';

  return (
    <div 
      className={`code-block ${className}`}
      style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
    >
      <pre className={`language-${mappedLanguage} ${lineNumberClass} overflow-auto`}>
        <code ref={codeRef} className={`language-${mappedLanguage}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}