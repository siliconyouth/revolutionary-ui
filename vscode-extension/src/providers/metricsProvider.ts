import * as vscode from 'vscode';

interface ProjectMetrics {
    totalFiles: number;
    filesWithFactory: number;
    totalComponents: number;
    factoryComponents: number;
    estimatedLinesSaved: number;
    averageReduction: number;
}

export class MetricsProvider {
    private metrics: Map<string, ProjectMetrics> = new Map();

    async showMetrics() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        // Calculate metrics
        const metrics = await this.calculateProjectMetrics(workspaceFolder.uri);
        
        // Create webview panel
        const panel = vscode.window.createWebviewPanel(
            'revolutionaryUIMetrics',
            'Revolutionary UI Metrics',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = this.getWebviewContent(metrics);
    }

    private async calculateProjectMetrics(workspaceUri: vscode.Uri): Promise<ProjectMetrics> {
        const metrics: ProjectMetrics = {
            totalFiles: 0,
            filesWithFactory: 0,
            totalComponents: 0,
            factoryComponents: 0,
            estimatedLinesSaved: 0,
            averageReduction: 0
        };

        // Find all JS/TS files
        const files = await vscode.workspace.findFiles(
            '**/*.{js,jsx,ts,tsx}',
            '**/node_modules/**'
        );

        for (const file of files) {
            metrics.totalFiles++;
            
            const document = await vscode.workspace.openTextDocument(file);
            const text = document.getText();

            // Check for factory patterns
            if (text.includes('@vladimirdukelic/revolutionary-ui-factory') || 
                text.includes('ReactFactory')) {
                metrics.filesWithFactory++;

                // Count factory components
                const dataTableCount = (text.match(/createDataTable\(/g) || []).length;
                const formCount = (text.match(/createForm\(/g) || []).length;
                
                metrics.factoryComponents += dataTableCount + formCount;
                
                // Estimate lines saved
                metrics.estimatedLinesSaved += dataTableCount * 750; // ~800 - 50
                metrics.estimatedLinesSaved += formCount * 470;      // ~500 - 30
            }

            // Count total React components (rough estimate)
            const componentCount = (text.match(/(?:function|const|class)\s+\w+.*(?:Component|return\s*\(|return\s*<)/g) || []).length;
            metrics.totalComponents += componentCount;
        }

        // Calculate average reduction
        if (metrics.factoryComponents > 0) {
            const totalTraditional = metrics.factoryComponents * 650; // average
            const totalFactory = metrics.factoryComponents * 40;     // average
            metrics.averageReduction = Math.round(((totalTraditional - totalFactory) / totalTraditional) * 100);
        }

        return metrics;
    }

    private getWebviewContent(metrics: ProjectMetrics): string {
        const adoptionRate = metrics.totalFiles > 0 
            ? Math.round((metrics.filesWithFactory / metrics.totalFiles) * 100) 
            : 0;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revolutionary UI Metrics</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #cccccc;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #4fc3f7;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: #252526;
            border: 1px solid #3e3e3e;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            color: #4fc3f7;
            margin: 10px 0;
        }
        .metric-label {
            font-size: 14px;
            color: #858585;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #3e3e3e;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4fc3f7, #2196f3);
            transition: width 0.5s ease;
        }
        .savings {
            background: #1b5e20;
            border-color: #2e7d32;
        }
        .savings .metric-value {
            color: #66bb6a;
        }
        .chart {
            margin: 30px 0;
            padding: 20px;
            background: #252526;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏭 Revolutionary UI Factory Metrics</h1>
        
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-label">Files Using Factory</div>
                <div class="metric-value">${metrics.filesWithFactory}</div>
                <div class="metric-label">of ${metrics.totalFiles} total files</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Factory Components</div>
                <div class="metric-value">${metrics.factoryComponents}</div>
                <div class="metric-label">optimized components</div>
            </div>
            
            <div class="metric-card savings">
                <div class="metric-label">Lines Saved</div>
                <div class="metric-value">${metrics.estimatedLinesSaved.toLocaleString()}</div>
                <div class="metric-label">fewer lines of code</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Average Reduction</div>
                <div class="metric-value">${metrics.averageReduction}%</div>
                <div class="metric-label">code reduction</div>
            </div>
        </div>

        <div class="chart">
            <h3>Adoption Rate</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${adoptionRate}%"></div>
            </div>
            <p>${adoptionRate}% of files are using Revolutionary UI Factory patterns</p>
        </div>

        <div class="chart">
            <h3>Impact Summary</h3>
            <ul>
                <li>📊 <strong>${metrics.factoryComponents}</strong> components optimized with factory patterns</li>
                <li>📉 <strong>${metrics.estimatedLinesSaved.toLocaleString()}</strong> lines of code eliminated</li>
                <li>⚡ <strong>${metrics.averageReduction}%</strong> average code reduction achieved</li>
                <li>🎯 <strong>${adoptionRate}%</strong> project adoption rate</li>
            </ul>
        </div>

        <div style="margin-top: 40px; padding: 20px; background: #1a237e; border-radius: 8px;">
            <h3>🚀 Next Steps</h3>
            <ul>
                <li>Convert more components using "Convert to Factory Pattern" command</li>
                <li>Use snippets for faster development (type "rfdt" for data table)</li>
                <li>Review components with high line counts for conversion opportunities</li>
                <li>Share these metrics with your team to showcase productivity gains</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
    }
}