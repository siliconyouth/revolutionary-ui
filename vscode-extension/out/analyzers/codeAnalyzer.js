"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
class CodeAnalyzer {
    async analyze() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const metrics = await this.getDocumentMetrics(document);
        if (!metrics.hasFactoryPatterns) {
            vscode.window.showInformationMessage('No Revolutionary UI Factory patterns found in this file. Use "Convert to Factory Pattern" to optimize your code!');
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
    async getDocumentMetrics(document) {
        const text = document.getText();
        const metrics = {
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
            metrics.reductionPercentage = Math.round(((metrics.traditionalLines - metrics.factoryLines) / metrics.traditionalLines) * 100);
        }
        return metrics;
    }
    countFactoryLines(text, startIndex) {
        let lines = 0;
        let braceCount = 0;
        let inFactory = false;
        for (let i = startIndex; i < text.length; i++) {
            if (text[i] === '{') {
                braceCount++;
                inFactory = true;
            }
            else if (text[i] === '}') {
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
    estimateTraditionalLines(componentType, factoryLines) {
        // Based on real-world averages
        const multipliers = {
            createDataTable: 16,
            createForm: 15, // ~450 lines traditional / ~30 factory
        };
        return Math.round(factoryLines * (multipliers[componentType] || 10));
    }
    generateReport(metrics) {
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
            const reduction = Math.round(((component.traditionalLines - component.factoryLines) / component.traditionalLines) * 100);
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
exports.CodeAnalyzer = CodeAnalyzer;
//# sourceMappingURL=codeAnalyzer.js.map