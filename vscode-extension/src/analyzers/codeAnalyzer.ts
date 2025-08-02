import * as vscode from 'vscode';

interface CodeMetrics {
    hasFactoryPatterns: boolean;
    traditionalLines: number;
    factoryLines: number;
    reductionPercentage: number;
    components: {
        name: string;
        type: string;
        traditionalLines: number;
        factoryLines: number;
    }[];
}

export class CodeAnalyzer {
    async analyze() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const metrics = await this.getDocumentMetrics(document);

        if (!metrics.hasFactoryPatterns) {
            vscode.window.showInformationMessage(
                'No Revolutionary UI Factory patterns found in this file. Use "Convert to Factory Pattern" to optimize your code!'
            );
            return;
        }

        // Create detailed report
        const report = this.generateReport(metrics);
        
        // Show in new document
        const reportDoc = await vscode.workspace.openTextDocument({
            content: report,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(reportDoc, { preview: false });
    }

    async getDocumentMetrics(document: vscode.TextDocument): Promise<CodeMetrics> {
        const text = document.getText();
        const metrics: CodeMetrics = {
            hasFactoryPatterns: false,
            traditionalLines: 0,
            factoryLines: 0,
            reductionPercentage: 0,
            components: []
        };

        // Find factory patterns
        const factoryPatterns = [
            /factory\.createDataTable\(/g,
            /factory\.createForm\(/g,
            /ReactFactory\(\)/g,
            /@vladimirdukelic\/revolutionary-ui-factory/g
        ];

        for (const pattern of factoryPatterns) {
            if (pattern.test(text)) {
                metrics.hasFactoryPatterns = true;
                break;
            }
        }

        if (!metrics.hasFactoryPatterns) {
            return metrics;
        }

        // Analyze each component
        const componentRegex = /(?:const|let|var)\s+(\w+)\s*=\s*factory\.(createDataTable|createForm)\(/g;
        let match;

        while ((match = componentRegex.exec(text)) !== null) {
            const [, componentName, componentType] = match;
            const factoryLines = this.countFactoryLines(text, match.index);
            const traditionalLines = this.estimateTraditionalLines(componentType, factoryLines);

            metrics.components.push({
                name: componentName,
                type: componentType,
                traditionalLines,
                factoryLines
            });

            metrics.factoryLines += factoryLines;
            metrics.traditionalLines += traditionalLines;
        }

        if (metrics.traditionalLines > 0) {
            metrics.reductionPercentage = Math.round(
                ((metrics.traditionalLines - metrics.factoryLines) / metrics.traditionalLines) * 100
            );
        }

        return metrics;
    }

    private countFactoryLines(text: string, startIndex: number): number {
        let lines = 0;
        let braceCount = 0;
        let inFactory = false;

        for (let i = startIndex; i < text.length; i++) {
            if (text[i] === '{') {
                braceCount++;
                inFactory = true;
            } else if (text[i] === '}') {
                braceCount--;
                if (braceCount === 0 && inFactory) {
                    // Count lines from start to here
                    const factoryCode = text.substring(startIndex, i + 1);
                    lines = factoryCode.split('\n').length;
                    break;
                }
            }
        }

        return lines || 10; // Default estimate
    }

    private estimateTraditionalLines(componentType: string, factoryLines: number): number {
        // Based on real-world averages
        const multipliers: { [key: string]: number } = {
            createDataTable: 16, // ~800 lines traditional / ~50 factory
            createForm: 15,      // ~450 lines traditional / ~30 factory
        };

        return Math.round(factoryLines * (multipliers[componentType] || 10));
    }

    private generateReport(metrics: CodeMetrics): string {
        const timestamp = new Date().toLocaleString();
        
        let report = `# Revolutionary UI Factory - Code Analysis Report

Generated: ${timestamp}

## Summary

- **Total Code Reduction**: ${metrics.reductionPercentage}%
- **Lines Saved**: ${metrics.traditionalLines - metrics.factoryLines} lines
- **Traditional Implementation**: ~${metrics.traditionalLines} lines
- **Factory Implementation**: ${metrics.factoryLines} lines

## Component Analysis

`;

        for (const component of metrics.components) {
            const reduction = Math.round(
                ((component.traditionalLines - component.factoryLines) / component.traditionalLines) * 100
            );
            
            report += `### ${component.name}
- **Type**: ${component.type}
- **Traditional**: ~${component.traditionalLines} lines
- **Factory**: ${component.factoryLines} lines
- **Reduction**: ${reduction}%

`;
        }

        report += `## Benefits Achieved

1. **Code Reduction**: Achieved ${metrics.reductionPercentage}% reduction in code size
2. **Maintainability**: Centralized configuration makes updates easier
3. **Consistency**: Factory patterns ensure UI consistency across the application
4. **Best Practices**: Built-in accessibility, performance optimization, and responsive design
5. **Type Safety**: Full TypeScript support with IntelliSense

## Next Steps

- Convert more components to factory patterns
- Use snippets for faster development
- Explore advanced factory configurations
- Share metrics with your team

---

*Powered by Revolutionary UI Factory System*
`;

        return report;
    }
}