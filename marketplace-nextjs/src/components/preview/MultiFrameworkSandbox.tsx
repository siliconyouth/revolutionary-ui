'use client';

import React, { useMemo } from 'react';

interface FrameworkConfig {
  name: string;
  scripts: string[];
  styles?: string[];
  setupCode: string;
  transformCode: (code: string) => string;
}

const FRAMEWORK_CONFIGS: Record<string, FrameworkConfig> = {
  react: {
    name: 'React',
    scripts: [
      'https://unpkg.com/react@18/umd/react.production.min.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    ],
    setupCode: `
      window.React = React;
      window.ReactDOM = ReactDOM;
    `,
    transformCode: (code) => code,
  },
  
  vue: {
    name: 'Vue 3',
    scripts: [
      'https://unpkg.com/vue@3/dist/vue.global.js',
    ],
    setupCode: `
      const { createApp, ref, reactive, computed, watch, onMounted } = Vue;
    `,
    transformCode: (code) => {
      // Simple Vue 3 component transformation
      return `
        const App = {
          ${code}
        };
        
        createApp(App).mount('#root');
      `;
    },
  },
  
  angular: {
    name: 'Angular',
    scripts: [
      'https://unpkg.com/zone.js@0.14.2/dist/zone.js',
      'https://unpkg.com/@angular/core@17/bundles/core.umd.js',
      'https://unpkg.com/@angular/common@17/bundles/common.umd.js',
      'https://unpkg.com/@angular/platform-browser@17/bundles/platform-browser.umd.js',
      'https://unpkg.com/@angular/platform-browser-dynamic@17/bundles/platform-browser-dynamic.umd.js',
    ],
    setupCode: `
      // Angular setup
      const { Component, NgModule } = ng.core;
      const { BrowserModule } = ng.platformBrowser;
      const { platformBrowserDynamic } = ng.platformBrowserDynamic;
    `,
    transformCode: (code) => {
      return `
        @Component({
          selector: 'app-root',
          template: \`${code}\`
        })
        class AppComponent { }
        
        @NgModule({
          imports: [BrowserModule],
          declarations: [AppComponent],
          bootstrap: [AppComponent]
        })
        class AppModule { }
        
        platformBrowserDynamic().bootstrapModule(AppModule);
      `;
    },
  },
  
  svelte: {
    name: 'Svelte',
    scripts: [
      'https://unpkg.com/svelte@4/compiler.js',
    ],
    setupCode: '',
    transformCode: (code) => {
      // This would need server-side compilation for full support
      return `
        // Svelte requires compilation
        // This is a simplified preview
        document.getElementById('root').innerHTML = \`
          <div class="svelte-preview">
            <p>Svelte components require server-side compilation.</p>
            <pre>\${code}</pre>
          </div>
        \`;
      `;
    },
  },
  
  vanilla: {
    name: 'Vanilla JS',
    scripts: [],
    setupCode: '',
    transformCode: (code) => code,
  },
};

export function createMultiFrameworkSandbox(
  framework: string,
  code: string,
  theme: 'light' | 'dark' = 'light'
): string {
  const config = FRAMEWORK_CONFIGS[framework] || FRAMEWORK_CONFIGS.vanilla;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name} Component Preview</title>
  
  <!-- Framework Scripts -->
  ${config.scripts.map(src => `<script crossorigin src="${src}"></script>`).join('\n  ')}
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Framework Styles -->
  ${config.styles?.map(href => `<link rel="stylesheet" href="${href}">`).join('\n  ') || ''}
  
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${theme === 'dark' ? '#111827' : '#f9fafb'};
      color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
    }
    
    #root {
      background: ${theme === 'dark' ? '#1f2937' : 'white'};
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .error {
      color: #ef4444;
      padding: 16px;
      background: ${theme === 'dark' ? '#7f1d1d' : '#fee'};
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      white-space: pre-wrap;
    }
    
    /* Framework-specific styles */
    .vue-app { font-family: Avenir, Helvetica, Arial, sans-serif; }
    .angular-app { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .svelte-preview pre { 
      background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script>
    // Error handling
    window.addEventListener('error', (event) => {
      const root = document.getElementById('root');
      root.innerHTML = '<div class="error">Error: ' + event.error.message + '</div>';
      event.preventDefault();
    });
    
    try {
      // Framework setup
      ${config.setupCode}
      
      // Component code
      ${config.transformCode(code)}
    } catch (err) {
      document.getElementById('root').innerHTML = 
        '<div class="error">Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>
  `;
  
  return html;
}

// Hook for easy integration
export function useMultiFrameworkPreview(
  framework: string,
  code: string,
  theme: 'light' | 'dark' = 'light'
) {
  return useMemo(
    () => createMultiFrameworkSandbox(framework, code, theme),
    [framework, code, theme]
  );
}