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
exports.DataTableGenerator = void 0;
const vscode = __importStar(require("vscode"));
class DataTableGenerator {
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
        if (!tableName)
            return;
        const columns = await vscode.window.showInputBox({
            prompt: 'Enter column headers (comma-separated)',
            placeHolder: 'Name, Email, Role, Status, Actions'
        });
        if (!columns)
            return;
        const framework = vscode.workspace.getConfiguration('revolutionaryUI').get('framework', 'react');
        // Generate code based on framework
        let code = '';
        if (framework === 'react') {
            code = this.generateReactDataTable(tableName, columns.split(',').map(c => c.trim()));
        }
        else {
            vscode.window.showWarningMessage(`${framework} support coming soon! Using React for now.`);
            code = this.generateReactDataTable(tableName, columns.split(',').map(c => c.trim()));
        }
        // Insert at cursor position
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, code);
        });
        vscode.window.showInformationMessage(`🏭 Created ${tableName} with ~70% code reduction!`);
    }
    generateReactDataTable(name, columns) {
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
exports.DataTableGenerator = DataTableGenerator;
//# sourceMappingURL=dataTableGenerator.js.map