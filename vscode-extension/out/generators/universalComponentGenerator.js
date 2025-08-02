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
exports.UniversalComponentGenerator = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class UniversalComponentGenerator {
    async generate(componentType, framework) {
        // Show input box for component name
        const componentName = await vscode.window.showInputBox({
            prompt: `Enter name for your ${componentType}`,
            placeHolder: `My${componentType}`,
            value: `My${componentType}`,
            validateInput: (value) => {
                if (!value)
                    return 'Component name is required';
                if (!/^[A-Z]/.test(value))
                    return 'Component name must start with uppercase letter';
                return null;
            }
        });
        if (!componentName)
            return;
        // Get the current workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        // Generate the component code based on type and framework
        const componentCode = this.generateComponentCode(componentType, componentName, framework);
        // Create the file
        const fileName = `${componentName}.${this.getFileExtension(framework)}`;
        const filePath = vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, 'src', 'components', fileName));
        try {
            await vscode.workspace.fs.writeFile(filePath, Buffer.from(componentCode));
            // Open the file
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
            // Show success message with metrics
            const reduction = this.getReductionPercentage(componentType);
            vscode.window.showInformationMessage(`🎉 ${componentType} created with ${reduction}% code reduction! Traditional: ~${this.getTraditionalLines(componentType)} lines → Factory: ~${this.getFactoryLines(componentType)} lines`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create component: ${error}`);
        }
    }
    generateComponentCode(componentType, componentName, framework) {
        // Framework-specific imports
        const imports = this.getFrameworkImports(framework);
        // Component-specific configuration
        const config = this.getComponentConfig(componentType);
        // Generate the code based on framework
        switch (framework) {
            case 'react':
                return this.generateReactComponent(componentType, componentName, config);
            case 'vue':
                return this.generateVueComponent(componentType, componentName, config);
            case 'angular':
                return this.generateAngularComponent(componentType, componentName, config);
            case 'svelte':
                return this.generateSvelteComponent(componentType, componentName, config);
            default:
                return this.generateReactComponent(componentType, componentName, config);
        }
    }
    generateReactComponent(componentType, componentName, config) {
        const componentMap = {
            'Dashboard': `import React from 'react';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('react');

export const ${componentName} = () => {
    const dashboard = ui.createDashboard({
        widgets: [
            { id: 'stats', type: 'stats', config: { 
                value: 1234, label: 'Total Users', trend: 'up', change: 12.5 
            }},
            { id: 'chart', type: 'chart', config: { 
                type: 'line', data: [], height: '300px' 
            }},
            { id: 'table', type: 'dataTable', config: { 
                data: [], columns: [] 
            }},
            { id: 'activity', type: 'timeline', config: { 
                items: [] 
            }}
        ],
        layout: 'grid',
        refreshInterval: 30000
    });

    return dashboard;
};`,
            'Kanban': `import React from 'react';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('react');

export const ${componentName} = () => {
    const kanban = ui.createKanban({
        columns: [
            { id: 'todo', title: 'To Do', items: [] },
            { id: 'progress', title: 'In Progress', items: [] },
            { id: 'review', title: 'Review', items: [] },
            { id: 'done', title: 'Done', items: [] }
        ],
        onDragEnd: (result) => console.log('Drag ended:', result),
        cardRenderer: (item) => <div>{item.title}</div>
    });

    return kanban;
};`,
            'Calendar': `import React from 'react';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('react');

export const ${componentName} = () => {
    const calendar = ui.createCalendar({
        events: [],
        view: 'month',
        onDateClick: (date) => console.log('Date clicked:', date),
        onEventClick: (event) => console.log('Event clicked:', event),
        features: {
            drag: true,
            resize: true,
            weekends: true
        }
    });

    return calendar;
};`,
            'DataTable': `import React from 'react';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('react');

export const ${componentName} = () => {
    const table = ui.createDataTable({
        columns: [
            { id: 'id', header: 'ID', accessorKey: 'id' },
            { id: 'name', header: 'Name', accessorKey: 'name' },
            { id: 'status', header: 'Status', accessorKey: 'status' }
        ],
        data: [],
        sortable: true,
        searchable: true,
        pagination: true,
        selectable: true
    });

    return table;
};`,
            'Form': `import React from 'react';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';
import { z } from 'zod';

const ui = setup('react');

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    message: z.string().min(10, 'Message must be at least 10 characters')
});

export const ${componentName} = () => {
    const form = ui.createForm({
        schema,
        fields: [
            { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter your name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
            { name: 'message', label: 'Message', type: 'textarea', rows: 4 }
        ],
        onSubmit: async (data) => {
            console.log('Form submitted:', data);
        }
    });

    return form;
};`,
            // Default template for other components
            'default': `import React from 'react';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('react');

export const ${componentName} = () => {
    const component = ui.create${componentType}({
        // Configuration for ${componentType}
        // Refer to documentation for available options
    });

    return component;
};`
        };
        return componentMap[componentType] || componentMap.default;
    }
    generateVueComponent(componentType, componentName, config) {
        return `<template>
  <div>
    <component :is="component" v-bind="componentProps" />
  </div>
</template>

<script setup>
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('vue');

const component = ui.create${componentType}({
  // Configuration for ${componentType}
});

const componentProps = {
  // Props for the component
};
</script>`;
    }
    generateAngularComponent(componentType, componentName, config) {
        return `import { Component, OnInit } from '@angular/core';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = setup('angular');

@Component({
  selector: 'app-${componentName.toLowerCase()}',
  template: \`
    <div [innerHTML]="componentHtml"></div>
  \`
})
export class ${componentName}Component implements OnInit {
  componentHtml: string = '';

  ngOnInit() {
    const component = ui.create${componentType}({
      // Configuration for ${componentType}
    });
    
    this.componentHtml = component.render();
  }
}`;
    }
    generateSvelteComponent(componentType, componentName, config) {
        return `<script>
  import { setup } from '@vladimirdukelic/revolutionary-ui-factory';
  
  const ui = setup('svelte');
  
  const component = ui.create${componentType}({
    // Configuration for ${componentType}
  });
</script>

{@html component}`;
    }
    getFrameworkImports(framework) {
        const imports = {
            'react': "import React from 'react';",
            'vue': "",
            'angular': "import { Component } from '@angular/core';",
            'svelte': ""
        };
        return imports[framework] || imports.react;
    }
    getFileExtension(framework) {
        const extensions = {
            'react': 'tsx',
            'vue': 'vue',
            'angular': 'ts',
            'svelte': 'svelte'
        };
        return extensions[framework] || 'tsx';
    }
    getComponentConfig(componentType) {
        // Return component-specific configuration
        return {};
    }
    getReductionPercentage(componentType) {
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
            'Workflow': 92
        };
        return reductions[componentType] || 85;
    }
    getTraditionalLines(componentType) {
        const lines = {
            'Dashboard': 1000,
            'Kanban': 600,
            'Calendar': 800,
            'DataTable': 500,
            'Form': 400,
            'Chart': 450,
            'CommandPalette': 500,
            'VideoPlayer': 700,
            'CodeEditor': 900,
            'Workflow': 750
        };
        return lines[componentType] || 400;
    }
    getFactoryLines(componentType) {
        const traditional = this.getTraditionalLines(componentType);
        const reduction = this.getReductionPercentage(componentType);
        return Math.round(traditional * (1 - reduction / 100));
    }
}
exports.UniversalComponentGenerator = UniversalComponentGenerator;
//# sourceMappingURL=universalComponentGenerator.js.map