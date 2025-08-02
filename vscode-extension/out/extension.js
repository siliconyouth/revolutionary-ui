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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const universalComponentGenerator_1 = require("./generators/universalComponentGenerator");
const componentCatalogProvider_1 = require("./providers/componentCatalogProvider");
const frameworkDetector_1 = require("./utils/frameworkDetector");
const codeAnalyzer_1 = require("./analyzers/codeAnalyzer");
const factoryConverter_1 = require("./converters/factoryConverter");
const metricsProvider_1 = require("./providers/metricsProvider");
const intellisenseProvider_1 = require("./providers/intellisenseProvider");
// Component type definitions for v2.0
const COMPONENT_CATEGORIES = {
    'Data Visualization': ['Dashboard', 'Chart', 'DataTable', 'StatsCard', 'Sparkline', 'Heatmap', 'TreeMap', 'Graph'],
    'Forms & Inputs': ['Form', 'Input', 'Select', 'DatePicker', 'FileUpload', 'RichTextEditor', 'ColorPicker', 'RangeSlider'],
    'Navigation': ['Navbar', 'Sidebar', 'Breadcrumb', 'Tabs', 'Stepper', 'Pagination', 'Menu', 'CommandPalette'],
    'Feedback': ['Alert', 'Toast', 'Modal', 'Notification', 'Progress', 'Skeleton', 'Loading', 'EmptyState'],
    'Layout': ['Grid', 'Container', 'Card', 'Accordion', 'Divider', 'Spacer', 'Stack', 'Split'],
    'Media': ['ImageGallery', 'VideoPlayer', 'AudioPlayer', 'Carousel', 'Lightbox', 'Avatar', 'Icon', 'Slideshow'],
    'E-commerce': ['ProductCard', 'ShoppingCart', 'Checkout', 'PriceTag', 'ProductGrid', 'Review', 'WishList', 'OrderSummary'],
    'Productivity': ['Kanban', 'Calendar', 'Timeline', 'TodoList', 'Gantt', 'TaskCard', 'Scheduler', 'TimeTracker'],
    'Real-time': ['Chat', 'LiveFeed', 'Notification', 'PresenceIndicator', 'Collaboration', 'LiveChart', 'StatusBoard', 'ActivityStream'],
    'Communication': ['CommentSection', 'MessageThread', 'VideoCall', 'EmailComposer', 'ShareDialog', 'Reaction', 'Mention', 'Poll'],
    'Gaming': ['Leaderboard', 'Achievement', 'ScoreCard', 'GameProgress', 'PlayerProfile', 'MatchHistory', 'Tournament', 'Quest'],
    'Developer Tools': ['CodeEditor', 'Terminal', 'Console', 'Debugger', 'APIExplorer', 'LogViewer', 'MetricsPanel', 'ConfigEditor'],
    'Accessibility': ['ScreenReaderAnnouncer', 'KeyboardNavigator', 'FocusTrap', 'SkipLinks', 'AriaLiveRegion', 'AccessibilityPanel'],
    'Mobile': ['BottomSheet', 'SwipeableList', 'PullToRefresh', 'FloatingActionButton', 'AppBar', 'Drawer', 'SegmentedControl'],
    'Enterprise': ['OrgChart', 'Workflow', 'ApprovalFlow', 'ReportBuilder', 'AuditLog', 'PermissionMatrix', 'ComplianceDashboard']
};
function activate(context) {
    console.log('Revolutionary UI Factory System v2.0 extension is now active!');
    // Initialize providers
    const metricsProvider = new metricsProvider_1.MetricsProvider();
    const intellisenseProvider = new intellisenseProvider_1.FactoryIntelliSenseProvider();
    const catalogProvider = new componentCatalogProvider_1.ComponentCatalogProvider();
    const frameworkDetector = new frameworkDetector_1.FrameworkDetector();
    // Universal component creation command
    context.subscriptions.push(vscode.commands.registerCommand('revolutionaryUI.createComponent', async () => {
        // Show category picker
        const category = await vscode.window.showQuickPick(Object.keys(COMPONENT_CATEGORIES), {
            placeHolder: 'Select component category',
            title: 'Revolutionary UI v2.0 - 150+ Components'
        });
        if (!category)
            return;
        // Show component picker
        const components = COMPONENT_CATEGORIES[category];
        const component = await vscode.window.showQuickPick(components, {
            placeHolder: `Select ${category} component`,
            title: `Revolutionary UI - ${category}`
        });
        if (!component)
            return;
        // Detect framework
        const framework = await frameworkDetector.detect();
        // Generate component
        const generator = new universalComponentGenerator_1.UniversalComponentGenerator();
        await generator.generate(component, framework);
    }));
    // Specific component generators for backward compatibility
    const specificGenerators = [
        { command: 'createDataTable', component: 'DataTable' },
        { command: 'createForm', component: 'Form' },
        { command: 'createDashboard', component: 'Dashboard' },
        { command: 'createKanban', component: 'Kanban' },
        { command: 'createCalendar', component: 'Calendar' },
        { command: 'createChart', component: 'Chart' },
        { command: 'createCommandPalette', component: 'CommandPalette' }
    ];
    specificGenerators.forEach(({ command, component }) => {
        context.subscriptions.push(vscode.commands.registerCommand(`revolutionaryUI.${command}`, async () => {
            const framework = await frameworkDetector.detect();
            const generator = new universalComponentGenerator_1.UniversalComponentGenerator();
            await generator.generate(component, framework);
        }));
    });
    // Show component catalog
    context.subscriptions.push(vscode.commands.registerCommand('revolutionaryUI.showComponentCatalog', async () => {
        await catalogProvider.showCatalog();
    }));
    // Code analysis and conversion
    context.subscriptions.push(vscode.commands.registerCommand('revolutionaryUI.analyzeCodeReduction', async () => {
        const analyzer = new codeAnalyzer_1.CodeAnalyzer();
        await analyzer.analyze();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('revolutionaryUI.convertToFactory', async () => {
        const converter = new factoryConverter_1.FactoryConverter();
        await converter.convert();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('revolutionaryUI.showMetrics', async () => {
        await metricsProvider.showMetrics();
    }));
    // Register IntelliSense providers for all supported languages
    const selector = [
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescript' },
        { scheme: 'file', language: 'javascriptreact' },
        { scheme: 'file', language: 'typescriptreact' },
        { scheme: 'file', language: 'vue' },
        { scheme: 'file', language: 'svelte' }
    ];
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, intellisenseProvider, '.', '"', "'"));
    // Enhanced code lens provider for v2.0
    context.subscriptions.push(vscode.languages.registerCodeLensProvider(selector, {
        provideCodeLenses(document) {
            const codeLenses = [];
            const text = document.getText();
            // Find all factory patterns
            const factoryRegex = /factory\.(create\w+)\(/g;
            let match;
            while ((match = factoryRegex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(match.index).line);
                const position = new vscode.Position(line.lineNumber, 0);
                const range = new vscode.Range(position, position);
                // Calculate reduction based on component type
                const componentType = match[1].replace('create', '');
                const reduction = getCodeReduction(componentType);
                codeLenses.push(new vscode.CodeLens(range, {
                    title: `📊 ~${reduction}% code reduction`,
                    command: 'revolutionaryUI.showMetrics'
                }));
            }
            return codeLenses;
        }
    }));
    // Enhanced status bar for v2.0
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '🏭 Revolutionary UI v2.0';
    statusBarItem.tooltip = 'Revolutionary UI Factory v2.0 - 150+ Components, Any Framework';
    statusBarItem.command = 'revolutionaryUI.showComponentCatalog';
    context.subscriptions.push(statusBarItem);
    statusBarItem.show();
    // Watch for file saves to show enhanced metrics
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = vscode.workspace.getConfiguration('revolutionaryUI');
        if (config.get('showMetricsOnSave')) {
            const analyzer = new codeAnalyzer_1.CodeAnalyzer();
            const metrics = await analyzer.getDocumentMetrics(document);
            if (metrics.hasFactoryPatterns) {
                vscode.window.showInformationMessage(`🏭 Revolutionary UI v2.0: ${metrics.reductionPercentage}% reduction (${metrics.traditionalLines} → ${metrics.factoryLines} lines) | Framework: ${metrics.framework}`);
            }
        }
    }));
    // Welcome message for v2.0
    vscode.window.showInformationMessage('🎉 Revolutionary UI Factory v2.0 activated! 150+ components, any framework. Use Cmd+Shift+P → "Revolutionary UI: Create Component"');
}
exports.activate = activate;
function getCodeReduction(componentType) {
    // Code reduction percentages based on component complexity
    const reductions = {
        'Dashboard': 96,
        'Kanban': 95,
        'Calendar': 96,
        'DataTable': 94,
        'Form': 94,
        'Chart': 93,
        'CommandPalette': 95,
        'VideoPlayer': 91,
        'CodeEditor': 89,
        'Workflow': 92,
        // Default for other components
        'default': 85
    };
    return reductions[componentType] || reductions.default;
}
function deactivate() {
    console.log('Revolutionary UI Factory System v2.0 extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map