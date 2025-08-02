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
exports.FactoryIntelliSenseProvider = void 0;
const vscode = __importStar(require("vscode"));
class FactoryIntelliSenseProvider {
    provideCompletionItems(document, position, token, context) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        // Check if we're in a factory context
        if (!this.isInFactoryContext(document, position)) {
            return [];
        }
        const completions = [];
        // Factory method completions
        if (linePrefix.endsWith('factory.')) {
            completions.push(this.createMethodCompletion('createDataTable', 'Create a data table component with sorting, filtering, and pagination'), this.createMethodCompletion('createForm', 'Create a form component with validation and submission handling'), this.createMethodCompletion('createDashboard', 'Create a dashboard layout (coming soon)'), this.createMethodCompletion('createChart', 'Create a chart component (coming soon)'));
        }
        // Column configuration completions
        if (this.isInColumnContext(document, position)) {
            completions.push(this.createPropertyCompletion('header', 'Column header text'), this.createPropertyCompletion('accessorKey', 'Key to access data for this column'), this.createPropertyCompletion('sortable', 'Enable sorting for this column'), this.createPropertyCompletion('filterable', 'Enable filtering for this column'), this.createPropertyCompletion('width', 'Column width (e.g., "150px", "20%")'), this.createPropertyCompletion('cell', 'Custom cell renderer function'));
        }
        // Form field completions
        if (this.isInFieldContext(document, position)) {
            completions.push(this.createPropertyCompletion('name', 'Field name (required)'), this.createPropertyCompletion('label', 'Field label text'), this.createPropertyCompletion('type', 'Input type (text, email, password, etc.)'), this.createPropertyCompletion('placeholder', 'Placeholder text'), this.createPropertyCompletion('validation', 'Zod validation schema'), this.createPropertyCompletion('required', 'Mark field as required'), this.createPropertyCompletion('defaultValue', 'Default field value'));
        }
        // Feature flag completions
        if (this.isInFeatureContext(document, position)) {
            completions.push(this.createPropertyCompletion('sorting', 'Enable column sorting'), this.createPropertyCompletion('filtering', 'Enable data filtering'), this.createPropertyCompletion('pagination', 'Enable pagination'), this.createPropertyCompletion('selection', 'Enable row selection'), this.createPropertyCompletion('export', 'Enable data export'), this.createPropertyCompletion('search', 'Enable global search'));
        }
        return completions;
    }
    isInFactoryContext(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 1000), offset);
        return before.includes('ReactFactory') ||
            before.includes('@vladimirdukelic/revolutionary-ui-factory') ||
            before.includes('factory.');
    }
    isInColumnContext(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 200), offset);
        return before.includes('columns:') && before.includes('createDataTable');
    }
    isInFieldContext(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 200), offset);
        return before.includes('fields:') && before.includes('createForm');
    }
    isInFeatureContext(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 200), offset);
        return before.includes('features:');
    }
    createMethodCompletion(method, description) {
        const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
        item.detail = description;
        item.documentation = new vscode.MarkdownString(`Creates a ${method.replace('create', '').toLowerCase()} component with Revolutionary UI Factory.`);
        // Add snippet
        if (method === 'createDataTable') {
            item.insertText = new vscode.SnippetString(`createDataTable({
    columns: [
        { header: '\${1:Name}', accessorKey: '\${2:name}' },
        { header: '\${3:Status}', accessorKey: '\${4:status}' }
    ],
    features: {
        sorting: true,
        filtering: true,
        pagination: true
    }
})`);
        }
        else if (method === 'createForm') {
            item.insertText = new vscode.SnippetString(`createForm({
    fields: [
        {
            name: '\${1:email}',
            label: '\${2:Email}',
            type: '\${3:email}',
            validation: z.string().email()
        }
    ],
    onSubmit: async (data) => {
        \${4:// Handle submission}
    }
})`);
        }
        return item;
    }
    createPropertyCompletion(property, description) {
        const item = new vscode.CompletionItem(property, vscode.CompletionItemKind.Property);
        item.detail = description;
        // Add appropriate snippet based on property type
        if (typeof description === 'string' && description.includes('Enable')) {
            item.insertText = new vscode.SnippetString(`${property}: \${1:true}`);
        }
        else {
            item.insertText = new vscode.SnippetString(`${property}: '\${1:}'`);
        }
        return item;
    }
}
exports.FactoryIntelliSenseProvider = FactoryIntelliSenseProvider;
//# sourceMappingURL=intellisenseProvider.js.map