import * as vscode from 'vscode';
import { Component } from '../api/RevolutionaryUIAPI';

export class ComponentPreviewPanel {
    public static currentPanel: ComponentPreviewPanel | undefined;
    public static readonly viewType = 'revolutionaryUIPreview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ComponentPreviewPanel.currentPanel) {
            ComponentPreviewPanel.currentPanel._panel.reveal(column);
            return ComponentPreviewPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            ComponentPreviewPanel.viewType,
            'Component Preview',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        ComponentPreviewPanel.currentPanel = new ComponentPreviewPanel(panel, extensionUri);
        return ComponentPreviewPanel.currentPanel;
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'insertComponent':
                        vscode.commands.executeCommand('revolutionaryUI.insertComponent', message.component);
                        break;
                    case 'copyCode':
                        vscode.env.clipboard.writeText(message.code);
                        vscode.window.showInformationMessage('Component code copied to clipboard');
                        break;
                    case 'openInBrowser':
                        vscode.env.openExternal(vscode.Uri.parse(message.url));
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public showComponent(component: Component) {
        this._panel.title = `Preview: ${component.name}`;
        this._panel.webview.html = this._getHtmlForComponent(component);
    }

    public showComponentLibrary(components: Component[]) {
        this._panel.title = 'Component Library';
        this._panel.webview.html = this._getHtmlForLibrary(components);
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    public dispose() {
        ComponentPreviewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Revolutionary UI Component Preview</title>
</head>
<body>
    <div class="container">
        <h1>Revolutionary UI Component Preview</h1>
        <p>Select a component to preview it here.</p>
    </div>
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }

    private _getHtmlForComponent(component: Component) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>${component.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .component-header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .component-name {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .component-meta {
            display: flex;
            gap: 20px;
            color: #666;
            font-size: 14px;
        }
        .component-description {
            margin: 15px 0;
            color: #333;
        }
        .component-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        .tag {
            background: #e0e0e0;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .button-primary {
            background: #007acc;
            color: white;
        }
        .button-primary:hover {
            background: #005a9e;
        }
        .button-secondary {
            background: #e0e0e0;
            color: #333;
        }
        .button-secondary:hover {
            background: #d0d0d0;
        }
        .preview-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 400px;
        }
        .preview-iframe {
            width: 100%;
            height: 600px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="component-header">
        <h1 class="component-name">${component.name}</h1>
        <div class="component-meta">
            <span>🔧 ${component.framework}</span>
            <span>📁 ${component.category}</span>
            <span>👤 ${component.author.name}</span>
            <span>⬇️ ${component.downloads} downloads</span>
        </div>
        <p class="component-description">${component.description}</p>
        <div class="component-tags">
            ${component.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="actions">
            <button class="button button-primary" onclick="insertComponent()">
                Insert Component
            </button>
            <button class="button button-secondary" onclick="copyCode()">
                Copy Code
            </button>
            <button class="button button-secondary" onclick="openInBrowser()">
                View Online
            </button>
        </div>
    </div>
    
    <div class="preview-container">
        <iframe 
            class="preview-iframe"
            srcdoc="<html><body><div style='padding: 40px; text-align: center; color: #666;'>Loading preview...</div></body></html>"
            sandbox="allow-scripts"
        ></iframe>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const component = ${JSON.stringify(component)};
        
        function insertComponent() {
            vscode.postMessage({
                command: 'insertComponent',
                component: component
            });
        }
        
        function copyCode() {
            vscode.postMessage({
                command: 'copyCode',
                code: component.code || '// Code not available'
            });
        }
        
        function openInBrowser() {
            vscode.postMessage({
                command: 'openInBrowser',
                url: 'https://revolutionary-ui.com/catalog/' + component.slug
            });
        }
        
        // Load preview
        setTimeout(() => {
            const iframe = document.querySelector('.preview-iframe');
            // In a real implementation, this would load the actual component preview
            iframe.srcdoc = \`
                <html>
                <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body style="padding: 40px;">
                    <div style="text-align: center; color: #666;">
                        <h3>Component Preview</h3>
                        <p>Preview for \${component.name} would be rendered here</p>
                        <p style="margin-top: 20px; font-size: 14px;">
                            Framework: \${component.framework}<br>
                            Category: \${component.category}
                        </p>
                    </div>
                </body>
                </html>
            \`;
        }, 100);
    </script>
</body>
</html>`;
    }

    private _getHtmlForLibrary(components: Component[]) {
        const componentCards = components.map(component => `
            <div class="component-card" onclick='selectComponent(${JSON.stringify(component)})'>
                <h3>${component.name}</h3>
                <p class="description">${component.description}</p>
                <div class="meta">
                    <span>${component.framework}</span>
                    <span>${component.category}</span>
                    <span>${component.downloads} downloads</span>
                </div>
            </div>
        `).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            margin: 0 0 20px 0;
        }
        .component-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .component-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.2s;
        }
        .component-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .component-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .description {
            color: #666;
            font-size: 14px;
            margin: 0 0 15px 0;
        }
        .meta {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <h1>Component Library</h1>
    <div class="component-grid">
        ${componentCards}
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function selectComponent(component) {
            vscode.postMessage({
                command: 'insertComponent',
                component: component
            });
        }
    </script>
</body>
</html>`;
    }
}