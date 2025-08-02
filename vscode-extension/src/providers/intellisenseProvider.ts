import * as vscode from 'vscode';

export class FactoryIntelliSenseProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        
        // Check if we're in a factory context
        if (!this.isInFactoryContext(document, position)) {
            return [];
        }

        const completions: vscode.CompletionItem[] = [];

        // Factory method completions
        if (linePrefix.endsWith('factory.')) {
            completions.push(
                this.createMethodCompletion('createDataTable', 'Create a data table component with sorting, filtering, and pagination'),
                this.createMethodCompletion('createForm', 'Create a form component with validation and submission handling'),
                this.createMethodCompletion('createDashboard', 'Create a dashboard layout (coming soon)'),
                this.createMethodCompletion('createChart', 'Create a chart component (coming soon)')
            );
        }

        // Column configuration completions
        if (this.isInColumnContext(document, position)) {
            completions.push(
                this.createPropertyCompletion('header', 'Column header text'),
                this.createPropertyCompletion('accessorKey', 'Key to access data for this column'),
                this.createPropertyCompletion('sortable', 'Enable sorting for this column'),
                this.createPropertyCompletion('filterable', 'Enable filtering for this column'),
                this.createPropertyCompletion('width', 'Column width (e.g., "150px", "20%")'),
                this.createPropertyCompletion('cell', 'Custom cell renderer function')
            );
        }

        // Form field completions
        if (this.isInFieldContext(document, position)) {
            completions.push(
                this.createPropertyCompletion('name', 'Field name (required)'),
                this.createPropertyCompletion('label', 'Field label text'),
                this.createPropertyCompletion('type', 'Input type (text, email, password, etc.)'),
                this.createPropertyCompletion('placeholder', 'Placeholder text'),
                this.createPropertyCompletion('validation', 'Zod validation schema'),
                this.createPropertyCompletion('required', 'Mark field as required'),
                this.createPropertyCompletion('defaultValue', 'Default field value')
            );
        }

        // Feature flag completions
        if (this.isInFeatureContext(document, position)) {
            completions.push(
                this.createPropertyCompletion('sorting', 'Enable column sorting'),
                this.createPropertyCompletion('filtering', 'Enable data filtering'),
                this.createPropertyCompletion('pagination', 'Enable pagination'),
                this.createPropertyCompletion('selection', 'Enable row selection'),
                this.createPropertyCompletion('export', 'Enable data export'),
                this.createPropertyCompletion('search', 'Enable global search')
            );
        }

        return completions;
    }

    private isInFactoryContext(document: vscode.TextDocument, position: vscode.Position): boolean {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 1000), offset);
        
        return before.includes('ReactFactory') || 
               before.includes('@vladimirdukelic/revolutionary-ui-factory') ||
               before.includes('factory.');
    }

    private isInColumnContext(document: vscode.TextDocument, position: vscode.Position): boolean {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 200), offset);
        
        return before.includes('columns:') && before.includes('createDataTable');
    }

    private isInFieldContext(document: vscode.TextDocument, position: vscode.Position): boolean {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 200), offset);
        
        return before.includes('fields:') && before.includes('createForm');
    }

    private isInFeatureContext(document: vscode.TextDocument, position: vscode.Position): boolean {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const before = text.substring(Math.max(0, offset - 200), offset);
        
        return before.includes('features:');
    }

    private createMethodCompletion(method: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
        item.detail = description;
        item.documentation = new vscode.MarkdownString(`Creates a ${method.replace('create', '').toLowerCase()} component with Revolutionary UI Factory.`);
        
        // Add snippet
        if (method === 'createDataTable') {
            item.insertText = new vscode.SnippetString(
                `createDataTable({
    columns: [
        { header: '\${1:Name}', accessorKey: '\${2:name}' },
        { header: '\${3:Status}', accessorKey: '\${4:status}' }
    ],
    features: {
        sorting: true,
        filtering: true,
        pagination: true
    }
})`
            );
        } else if (method === 'createForm') {
            item.insertText = new vscode.SnippetString(
                `createForm({
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
})`
            );
        }
        
        return item;
    }

    private createPropertyCompletion(property: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(property, vscode.CompletionItemKind.Property);
        item.detail = description;
        
        // Add appropriate snippet based on property type
        if (typeof description === 'string' && description.includes('Enable')) {
            item.insertText = new vscode.SnippetString(`${property}: \${1:true}`);
        } else {
            item.insertText = new vscode.SnippetString(`${property}: '\${1:}'`);
        }
        
        return item;
    }
}