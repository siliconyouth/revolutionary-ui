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
exports.ComponentCatalogProvider = void 0;
const vscode = __importStar(require("vscode"));
class ComponentCatalogProvider {
    async showCatalog() {
        const panel = vscode.window.createWebviewPanel('revolutionaryUICatalog', 'Revolutionary UI v2.0 - Component Catalog', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getCatalogHtml();
    }
    getCatalogHtml() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revolutionary UI v2.0 - Component Catalog</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #0969da;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 40px;
        }
        .stat {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #0969da;
        }
        .stat-label {
            color: #666;
        }
        .category {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .category h2 {
            color: #0969da;
            margin-top: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .components {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .component {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e1e4e8;
            transition: all 0.2s;
        }
        .component:hover {
            border-color: #0969da;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .component-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .component-reduction {
            color: #28a745;
            font-size: 14px;
        }
        .component-lines {
            color: #666;
            font-size: 12px;
        }
        .frameworks {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
        }
        .framework {
            background: #0969da;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>🏭 Revolutionary UI Factory v2.0</h1>
    <p class="subtitle">Generate ANY UI component for ANY framework with 60-95% code reduction!</p>
    
    <div class="stats">
        <div class="stat">
            <div class="stat-value">150+</div>
            <div class="stat-label">Components</div>
        </div>
        <div class="stat">
            <div class="stat-value">10+</div>
            <div class="stat-label">Frameworks</div>
        </div>
        <div class="stat">
            <div class="stat-value">60-95%</div>
            <div class="stat-label">Code Reduction</div>
        </div>
    </div>

    <div class="frameworks">
        <span class="framework">React</span>
        <span class="framework">Vue</span>
        <span class="framework">Angular</span>
        <span class="framework">Svelte</span>
        <span class="framework">Solid</span>
        <span class="framework">Preact</span>
        <span class="framework">Alpine.js</span>
        <span class="framework">Lit</span>
        <span class="framework">Qwik</span>
        <span class="framework">Astro</span>
    </div>

    <h2 style="margin-top: 40px;">Component Catalog</h2>

    <div class="category">
        <h2>📊 Data Visualization</h2>
        <div class="components">
            <div class="component">
                <div class="component-name">Dashboard</div>
                <div class="component-reduction">96% reduction</div>
                <div class="component-lines">1000 → 40 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Chart</div>
                <div class="component-reduction">93% reduction</div>
                <div class="component-lines">450 → 30 lines</div>
            </div>
            <div class="component">
                <div class="component-name">DataTable</div>
                <div class="component-reduction">94% reduction</div>
                <div class="component-lines">500 → 30 lines</div>
            </div>
            <div class="component">
                <div class="component-name">StatsCard</div>
                <div class="component-reduction">90% reduction</div>
                <div class="component-lines">200 → 20 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Sparkline</div>
                <div class="component-reduction">88% reduction</div>
                <div class="component-lines">250 → 30 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Heatmap</div>
                <div class="component-reduction">91% reduction</div>
                <div class="component-lines">400 → 36 lines</div>
            </div>
            <div class="component">
                <div class="component-name">TreeMap</div>
                <div class="component-reduction">92% reduction</div>
                <div class="component-lines">450 → 36 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Graph</div>
                <div class="component-reduction">93% reduction</div>
                <div class="component-lines">600 → 42 lines</div>
            </div>
        </div>
    </div>

    <div class="category">
        <h2>📝 Forms & Inputs</h2>
        <div class="components">
            <div class="component">
                <div class="component-name">Form</div>
                <div class="component-reduction">94% reduction</div>
                <div class="component-lines">400 → 24 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Input</div>
                <div class="component-reduction">85% reduction</div>
                <div class="component-lines">100 → 15 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Select</div>
                <div class="component-reduction">87% reduction</div>
                <div class="component-lines">150 → 20 lines</div>
            </div>
            <div class="component">
                <div class="component-name">DatePicker</div>
                <div class="component-reduction">92% reduction</div>
                <div class="component-lines">500 → 40 lines</div>
            </div>
            <div class="component">
                <div class="component-name">FileUpload</div>
                <div class="component-reduction">90% reduction</div>
                <div class="component-lines">300 → 30 lines</div>
            </div>
            <div class="component">
                <div class="component-name">RichTextEditor</div>
                <div class="component-reduction">94% reduction</div>
                <div class="component-lines">800 → 48 lines</div>
            </div>
            <div class="component">
                <div class="component-name">ColorPicker</div>
                <div class="component-reduction">91% reduction</div>
                <div class="component-lines">400 → 36 lines</div>
            </div>
            <div class="component">
                <div class="component-name">RangeSlider</div>
                <div class="component-reduction">88% reduction</div>
                <div class="component-lines">200 → 24 lines</div>
            </div>
        </div>
    </div>

    <div class="category">
        <h2>🧭 Navigation</h2>
        <div class="components">
            <div class="component">
                <div class="component-name">Navbar</div>
                <div class="component-reduction">89% reduction</div>
                <div class="component-lines">300 → 33 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Sidebar</div>
                <div class="component-reduction">90% reduction</div>
                <div class="component-lines">350 → 35 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Breadcrumb</div>
                <div class="component-reduction">86% reduction</div>
                <div class="component-lines">150 → 21 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Tabs</div>
                <div class="component-reduction">88% reduction</div>
                <div class="component-lines">250 → 30 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Stepper</div>
                <div class="component-reduction">91% reduction</div>
                <div class="component-lines">400 → 36 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Pagination</div>
                <div class="component-reduction">87% reduction</div>
                <div class="component-lines">200 → 26 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Menu</div>
                <div class="component-reduction">89% reduction</div>
                <div class="component-lines">300 → 33 lines</div>
            </div>
            <div class="component">
                <div class="component-name">CommandPalette</div>
                <div class="component-reduction">95% reduction</div>
                <div class="component-lines">500 → 25 lines</div>
            </div>
        </div>
    </div>

    <div class="category">
        <h2>📱 Mobile Components</h2>
        <div class="components">
            <div class="component">
                <div class="component-name">BottomSheet</div>
                <div class="component-reduction">90% reduction</div>
                <div class="component-lines">350 → 35 lines</div>
            </div>
            <div class="component">
                <div class="component-name">SwipeableList</div>
                <div class="component-reduction">92% reduction</div>
                <div class="component-lines">450 → 36 lines</div>
            </div>
            <div class="component">
                <div class="component-name">PullToRefresh</div>
                <div class="component-reduction">89% reduction</div>
                <div class="component-lines">300 → 33 lines</div>
            </div>
            <div class="component">
                <div class="component-name">FloatingActionButton</div>
                <div class="component-reduction">85% reduction</div>
                <div class="component-lines">150 → 23 lines</div>
            </div>
        </div>
    </div>

    <div class="category">
        <h2>🏢 Enterprise Components</h2>
        <div class="components">
            <div class="component">
                <div class="component-name">OrgChart</div>
                <div class="component-reduction">93% reduction</div>
                <div class="component-lines">700 → 49 lines</div>
            </div>
            <div class="component">
                <div class="component-name">Workflow</div>
                <div class="component-reduction">92% reduction</div>
                <div class="component-lines">750 → 60 lines</div>
            </div>
            <div class="component">
                <div class="component-name">ApprovalFlow</div>
                <div class="component-reduction">91% reduction</div>
                <div class="component-lines">600 → 54 lines</div>
            </div>
            <div class="component">
                <div class="component-name">ReportBuilder</div>
                <div class="component-reduction">94% reduction</div>
                <div class="component-lines">900 → 54 lines</div>
            </div>
            <div class="component">
                <div class="component-name">AuditLog</div>
                <div class="component-reduction">90% reduction</div>
                <div class="component-lines">400 → 40 lines</div>
            </div>
        </div>
    </div>

    <p style="text-align: center; margin-top: 40px; color: #666;">
        ... and 100+ more components across 15 categories!
    </p>

    <div style="text-align: center; margin-top: 40px;">
        <p><strong>Use Cmd+Shift+P → "Revolutionary UI: Create Component" to get started!</strong></p>
        <p style="color: #666;">by Vladimir Dukelic | <a href="https://github.com/siliconyouth/revolutionary-ui-factory-system">GitHub</a></p>
    </div>
</body>
</html>`;
    }
}
exports.ComponentCatalogProvider = ComponentCatalogProvider;
//# sourceMappingURL=componentCatalogProvider.js.map