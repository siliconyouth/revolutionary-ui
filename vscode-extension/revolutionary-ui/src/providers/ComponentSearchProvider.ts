import * as vscode from 'vscode';
import { RevolutionaryUIAPI, Component, SearchResult } from '../api/RevolutionaryUIAPI';
import { ComponentCache } from '../services/ComponentCache';

interface QuickPickComponent extends vscode.QuickPickItem {
    component: Component;
}

export class ComponentSearchProvider {
    constructor(
        private api: RevolutionaryUIAPI,
        private cache: ComponentCache
    ) {}

    async searchComponents(): Promise<Component | undefined> {
        const quickPick = vscode.window.createQuickPick<QuickPickComponent>();
        quickPick.placeholder = 'Search for components (e.g., "responsive data table")';
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;

        // Show loading state
        quickPick.busy = true;
        quickPick.show();

        // Load initial components
        const cachedComponents = this.cache.get('recent-components');
        if (cachedComponents) {
            quickPick.items = this.componentsToQuickPickItems(cachedComponents);
            quickPick.busy = false;
        } else {
            // Load popular components
            try {
                const components = await this.api.getComponents({ limit: 20 });
                quickPick.items = this.componentsToQuickPickItems(components);
                this.cache.set('recent-components', components, 300); // Cache for 5 minutes
            } catch (error) {
                quickPick.items = [{
                    label: '$(error) Failed to load components',
                    description: 'Check your internet connection and API settings',
                    component: null as any
                }];
            }
            quickPick.busy = false;
        }

        // Handle search input
        let searchTimeout: NodeJS.Timeout;
        quickPick.onDidChangeValue(async (value) => {
            clearTimeout(searchTimeout);
            
            if (!value || value.length < 2) {
                // Show recent/popular components
                const components = this.cache.get('recent-components') || [];
                quickPick.items = this.componentsToQuickPickItems(components);
                return;
            }

            // Debounce search
            searchTimeout = setTimeout(async () => {
                quickPick.busy = true;
                
                try {
                    // Check cache first
                    const cacheKey = `search-${value}`;
                    const cachedResults = this.cache.get(cacheKey);
                    
                    if (cachedResults) {
                        quickPick.items = this.searchResultsToQuickPickItems(cachedResults);
                    } else {
                        // Perform semantic search
                        const framework = vscode.workspace.getConfiguration('revolutionaryUI').get<string>('defaultFramework');
                        const results = await this.api.searchComponents(value, { framework });
                        
                        quickPick.items = this.searchResultsToQuickPickItems(results);
                        this.cache.set(cacheKey, results, 600); // Cache for 10 minutes
                    }
                } catch (error) {
                    quickPick.items = [{
                        label: '$(error) Search failed',
                        description: 'Please try again',
                        component: null as any
                    }];
                }
                
                quickPick.busy = false;
            }, 300);
        });

        // Handle selection
        return new Promise<Component | undefined>((resolve) => {
            quickPick.onDidAccept(() => {
                const selection = quickPick.selectedItems[0];
                if (selection && selection.component) {
                    resolve(selection.component);
                } else {
                    resolve(undefined);
                }
                quickPick.hide();
            });

            quickPick.onDidHide(() => {
                clearTimeout(searchTimeout);
                quickPick.dispose();
                resolve(undefined);
            });
        });
    }

    private componentsToQuickPickItems(components: Component[]): QuickPickComponent[] {
        return components.map(component => ({
            label: `$(symbol-misc) ${component.name}`,
            description: `${component.framework} · ${component.category}`,
            detail: component.description,
            component
        }));
    }

    private searchResultsToQuickPickItems(results: SearchResult[]): QuickPickComponent[] {
        return results.map(result => ({
            label: `$(symbol-misc) ${result.resource.name} $(star-empty) ${Math.round(result.score * 100)}%`,
            description: `${result.resource.framework} · ${result.resource.category}`,
            detail: result.resource.description,
            component: result.resource
        }));
    }
}