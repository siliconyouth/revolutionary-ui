import * as vscode from 'vscode';

export class FormGenerator {
    async generate() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        // Get form configuration
        const formName = await vscode.window.showInputBox({
            prompt: 'Enter form name (e.g., UserRegistrationForm)',
            placeHolder: 'UserRegistrationForm'
        });

        if (!formName) return;

        const fields = await vscode.window.showInputBox({
            prompt: 'Enter field names (comma-separated)',
            placeHolder: 'name, email, password, role'
        });

        if (!fields) return;

        const includeValidation = await vscode.window.showQuickPick(
            ['Yes', 'No'],
            { placeHolder: 'Include validation?' }
        );

        const framework = vscode.workspace.getConfiguration('revolutionaryUI').get('framework', 'react');
        
        // Generate code
        let code = '';
        
        if (framework === 'react') {
            code = this.generateReactForm(
                formName, 
                fields.split(',').map(f => f.trim()),
                includeValidation === 'Yes'
            );
        } else {
            vscode.window.showWarningMessage(`${framework} support coming soon! Using React for now.`);
            code = this.generateReactForm(
                formName, 
                fields.split(',').map(f => f.trim()),
                includeValidation === 'Yes'
            );
        }

        // Insert at cursor position
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, code);
        });

        vscode.window.showInformationMessage(
            `🏭 Created ${formName} with ~80% code reduction!`
        );
    }

    private generateReactForm(name: string, fields: string[], includeValidation: boolean): string {
        const fieldDefs = fields.map(field => {
            const type = this.inferFieldType(field);
            const validation = includeValidation ? this.getValidation(field, type) : '';
            
            return `        {
            name: '${field}',
            label: '${this.capitalize(field)}',
            type: '${type}',
            placeholder: 'Enter ${field}'${validation ? ',\n' + validation : ''}
        }`;
        }).join(',\n');

        const schemaImport = includeValidation ? "import { z } from 'zod';\n" : '';

        return `// Revolutionary UI Factory - Form
// ~80% code reduction compared to traditional implementation

${schemaImport}import { ReactFactory } from '@vladimirdukelic/revolutionary-ui-factory/react';

const factory = new ReactFactory();

export const ${name} = factory.createForm({
    fields: [
${fieldDefs}
    ],
    onSubmit: async (data) => {
        console.log('Form submitted:', data);
        // Handle form submission
    },
    options: {
        layout: 'vertical',
        submitText: 'Submit',
        resetButton: true,
        showValidation: true
    }
});

// Usage:
// <${name} />
`;
    }

    private inferFieldType(field: string): string {
        const lower = field.toLowerCase();
        if (lower.includes('email')) return 'email';
        if (lower.includes('password')) return 'password';
        if (lower.includes('phone') || lower.includes('tel')) return 'tel';
        if (lower.includes('date')) return 'date';
        if (lower.includes('age') || lower.includes('number')) return 'number';
        if (lower.includes('description') || lower.includes('message')) return 'textarea';
        return 'text';
    }

    private getValidation(field: string, type: string): string {
        const validations: string[] = [];
        
        if (field.toLowerCase().includes('email')) {
            validations.push("z.string().email('Invalid email address')");
        } else if (type === 'password') {
            validations.push("z.string().min(8, 'Password must be at least 8 characters')");
        } else if (type === 'number') {
            validations.push("z.number().positive('Must be a positive number')");
        } else {
            validations.push("z.string().min(1, 'Required field')");
        }

        return validations.length > 0 ? `            validation: ${validations[0]}` : '';
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}