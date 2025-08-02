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
exports.FactoryConverter = void 0;
const vscode = __importStar(require("vscode"));
class FactoryConverter {
    async convert() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Please select the component code you want to convert');
            return;
        }
        const selectedText = editor.document.getText(selection);
        // Analyze the selected code
        const componentType = this.detectComponentType(selectedText);
        if (!componentType) {
            vscode.window.showWarningMessage('Could not detect component type. Manual conversion may be needed.');
            return;
        }
        // Generate factory code
        const factoryCode = await this.generateFactoryCode(selectedText, componentType);
        if (factoryCode) {
            // Replace selection with factory code
            editor.edit(editBuilder => {
                editBuilder.replace(selection, factoryCode);
            });
            vscode.window.showInformationMessage(`🏭 Successfully converted to factory pattern! Estimated ${this.estimateReduction(componentType)}% code reduction.`);
        }
    }
    detectComponentType(code) {
        // Detect data table patterns
        const tablePatterns = [
            /table/i,
            /thead|tbody|tr|td|th/i,
            /columns|rows|data/i,
            /DataGrid|Table|Grid/i
        ];
        for (const pattern of tablePatterns) {
            if (pattern.test(code)) {
                return 'dataTable';
            }
        }
        // Detect form patterns
        const formPatterns = [
            /form/i,
            /input|textarea|select/i,
            /submit|onChange|onSubmit/i,
            /field|label|validation/i
        ];
        for (const pattern of formPatterns) {
            if (pattern.test(code)) {
                return 'form';
            }
        }
        return null;
    }
    async generateFactoryCode(code, type) {
        if (type === 'dataTable') {
            return this.convertToDataTable(code);
        }
        else if (type === 'form') {
            return this.convertToForm(code);
        }
        return null;
    }
    convertToDataTable(code) {
        // Extract column information
        const columns = this.extractTableColumns(code);
        const componentName = this.extractComponentName(code) || 'DataTable';
        const columnDefs = columns.map(col => `        { header: '${col.header}', accessorKey: '${col.accessor}' }`).join(',\n');
        return `// Revolutionary UI Factory - Converted from traditional implementation
// Estimated ~70% code reduction

import { ReactFactory } from '@vladimirdukelic/revolutionary-ui-factory/react';

const factory = new ReactFactory();

export const ${componentName} = factory.createDataTable({
    columns: [
${columnDefs}
    ],
    features: {
        sorting: true,
        filtering: true,
        pagination: true,
        selection: true
    }
});`;
    }
    convertToForm(code) {
        // Extract form fields
        const fields = this.extractFormFields(code);
        const componentName = this.extractComponentName(code) || 'Form';
        const fieldDefs = fields.map(field => `        {
            name: '${field.name}',
            label: '${field.label}',
            type: '${field.type}',
            placeholder: '${field.placeholder || `Enter ${field.name}`}'
        }`).join(',\n');
        return `// Revolutionary UI Factory - Converted from traditional implementation
// Estimated ~80% code reduction

import { z } from 'zod';
import { ReactFactory } from '@vladimirdukelic/revolutionary-ui-factory/react';

const factory = new ReactFactory();

export const ${componentName} = factory.createForm({
    fields: [
${fieldDefs}
    ],
    onSubmit: async (data) => {
        console.log('Form submitted:', data);
        // Add your submit logic here
    }
});`;
    }
    extractTableColumns(code) {
        const columns = [];
        // Try to find column definitions
        const columnRegex = /(?:header|title|label):\s*['"`]([^'"`]+)['"`]/g;
        let match;
        while ((match = columnRegex.exec(code)) !== null) {
            const header = match[1];
            const accessor = header.toLowerCase().replace(/\s+/g, '');
            columns.push({ header, accessor });
        }
        // Fallback: look for th elements
        if (columns.length === 0) {
            const thRegex = /<th[^>]*>([^<]+)<\/th>/g;
            while ((match = thRegex.exec(code)) !== null) {
                const header = match[1].trim();
                const accessor = header.toLowerCase().replace(/\s+/g, '');
                columns.push({ header, accessor });
            }
        }
        // Default columns if none found
        if (columns.length === 0) {
            columns.push({ header: 'Name', accessor: 'name' }, { header: 'Status', accessor: 'status' }, { header: 'Actions', accessor: 'actions' });
        }
        return columns;
    }
    extractFormFields(code) {
        const fields = [];
        // Try to find input elements
        const inputRegex = /<input[^>]*name=['"`]([^'"`]+)['"`][^>]*>/g;
        let match;
        while ((match = inputRegex.exec(code)) !== null) {
            const name = match[1];
            const typeMatch = match[0].match(/type=['"`]([^'"`]+)['"`]/);
            const type = typeMatch ? typeMatch[1] : 'text';
            const label = this.capitalize(name.replace(/[_-]/g, ' '));
            fields.push({ name, label, type });
        }
        // Default fields if none found
        if (fields.length === 0) {
            fields.push({ name: 'name', label: 'Name', type: 'text' }, { name: 'email', label: 'Email', type: 'email' });
        }
        return fields;
    }
    extractComponentName(code) {
        // Try to find component name
        const patterns = [
            /(?:const|let|var|function|class)\s+(\w+)/,
            /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/
        ];
        for (const pattern of patterns) {
            const match = code.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }
    estimateReduction(type) {
        const reductions = {
            dataTable: 70,
            form: 80
        };
        return reductions[type] || 60;
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
exports.FactoryConverter = FactoryConverter;
//# sourceMappingURL=factoryConverter.js.map