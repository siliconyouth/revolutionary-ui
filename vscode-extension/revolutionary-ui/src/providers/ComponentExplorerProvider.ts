import * as vscode from 'vscode';
import { RevolutionaryUIAPI, Component } from '../api/RevolutionaryUIAPI';
import { ComponentCache } from '../services/ComponentCache';

export class ComponentExplorerProvider implements vscode.TreeDataProvider<ComponentItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ComponentItem | undefined | null | void> = new vscode.EventEmitter<ComponentItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ComponentItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private categories: Map<string, Component[]> = new Map();

    constructor(
        private api: RevolutionaryUIAPI,
        private cache: ComponentCache
    ) {
        this.loadComponents();
    }

    refresh(): void {
        this.loadComponents();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ComponentItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ComponentItem): Promise<ComponentItem[]> {
        if (!element) {
            // Return categories
            const items: ComponentItem[] = [];
            for (const [category, components] of this.categories) {
                items.push(new ComponentItem(
                    category,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'category',
                    undefined,
                    `${components.length} components`
                ));
            }
            return items;
        } else if (element.type === 'category') {
            // Return components in category
            const components = this.categories.get(element.label) || [];
            return components.map(component => new ComponentItem(
                component.name,
                vscode.TreeItemCollapsibleState.None,
                'component',
                component,
                `${component.framework} · ${component.downloads} downloads`
            ));
        }
        return [];
    }

    private async loadComponents() {
        try {
            // Check cache first
            const cachedComponents = this.cache.get<Component[]>('all-components');
            if (cachedComponents) {
                this.organizeByCategory(cachedComponents);
                return;
            }

            // Fetch from API
            const components = await this.api.getComponents({ limit: 100 });
            this.cache.set('all-components', components, 1800); // Cache for 30 minutes
            this.organizeByCategory(components);
        } catch (error) {
            console.error('Failed to load components:', error);
        }
    }

    private organizeByCategory(components: Component[]) {
        this.categories.clear();
        
        for (const component of components) {
            const category = component.category || 'Uncategorized';
            if (!this.categories.has(category)) {
                this.categories.set(category, []);
            }
            this.categories.get(category)!.push(component);
        }

        // Sort categories
        this.categories = new Map([...this.categories.entries()].sort());
    }
}

class ComponentItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'category' | 'component',
        public readonly component?: Component,
        public readonly description?: string
    ) {
        super(label, collapsibleState);

        this.tooltip = this.component?.description || this.label;
        this.description = description;

        if (type === 'component') {
            this.iconPath = new vscode.ThemeIcon('symbol-misc');
            this.contextValue = 'component';
            this.command = {
                command: 'revolutionaryUI.showPreview',
                title: 'Show Preview',
                arguments: [component]
            };
        } else {
            this.iconPath = new vscode.ThemeIcon('folder');
            this.contextValue = 'category';
        }
    }
}