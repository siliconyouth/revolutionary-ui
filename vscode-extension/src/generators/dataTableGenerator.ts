import * as vscode from 'vscode';

export class DataTableGenerator {
    async generate() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        // Get table configuration from user
        const tableName = await vscode.window.showInputBox({
            prompt: 'Enter table name (e.g., UserTable)',
            placeHolder: 'UserTable'
        });

        if (!tableName) return;

        const columns = await vscode.window.showInputBox({
            prompt: 'Enter column headers (comma-separated)',
            placeHolder: 'Name, Email, Role, Status, Actions'
        });

        if (!columns) return;

        const framework = vscode.workspace.getConfiguration('revolutionaryUI').get('framework', 'react');
        
        // Generate code based on framework
        let code = '';
        
        if (framework === 'react') {
            code = this.generateReactDataTable(tableName, columns.split(',').map(c => c.trim()));
        } else {
            vscode.window.showWarningMessage(`${framework} support coming soon! Using React for now.`);
            code = this.generateReactDataTable(tableName, columns.split(',').map(c => c.trim()));
        }

        // Insert at cursor position
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, code);
        });

        vscode.window.showInformationMessage(
            `🏭 Created ${tableName} with ~70% code reduction!`
        );
    }

    private generateReactDataTable(name: string, columns: string[]): string {
        const columnDefs = columns.map(col => {
            const key = col.toLowerCase().replace(/\s+/g, '');
            return `        { header: '${col}', accessorKey: '${key}' }`;
        }).join(',\n');

        return `// Revolutionary UI Factory - Data Table
// ~70% code reduction compared to traditional implementation

import { ReactFactory } from '@vladimirdukelic/revolutionary-ui-factory/react';

const factory = new ReactFactory();

export const ${name} = factory.createDataTable({
    columns: [
${columnDefs}
    ],
    features: {
        sorting: true,
        filtering: true,
        pagination: true,
        selection: true,
        export: true
    },
    styling: {
        striped: true,
        hover: true,
        bordered: false
    }
});

// Usage:
// <${name} data={yourData} />
`;
    }
}