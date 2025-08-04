import * as vscode from 'vscode';
import { ComponentProvider } from './providers/ComponentProvider';
import { ComponentSearchProvider } from './providers/ComponentSearchProvider';
import { ComponentPreviewPanel } from './panels/ComponentPreviewPanel';
import { RevolutionaryUIAPI } from './api/RevolutionaryUIAPI';
import { AIComponentGenerator } from './services/AIComponentGenerator';
import { ComponentCache } from './services/ComponentCache';
import { ComponentExplorerProvider } from './providers/ComponentExplorerProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { RecentComponentsProvider } from './providers/RecentComponentsProvider';

let api: RevolutionaryUIAPI;
let cache: ComponentCache;
let aiGenerator: AIComponentGenerator;

export function activate(context: vscode.ExtensionContext) {
    console.log('Revolutionary UI extension is now active!');

    // Initialize services
    api = new RevolutionaryUIAPI(context);
    cache = new ComponentCache();
    aiGenerator = new AIComponentGenerator();

    // Register tree data providers
    const componentExplorer = new ComponentExplorerProvider(api, cache);
    const favoritesProvider = new FavoritesProvider(context);
    const recentProvider = new RecentComponentsProvider(context);

    vscode.window.registerTreeDataProvider('revolutionaryUI.componentExplorer', componentExplorer);
    vscode.window.registerTreeDataProvider('revolutionaryUI.favorites', favoritesProvider);
    vscode.window.registerTreeDataProvider('revolutionaryUI.recent', recentProvider);

    // Register commands
    const commands = [
        // Search components command
        vscode.commands.registerCommand('revolutionaryUI.searchComponents', async () => {
            const searchProvider = new ComponentSearchProvider(api, cache);
            const component = await searchProvider.searchComponents();
            
            if (component) {
                await insertComponent(component);
                recentProvider.addRecentComponent(component);
            }
        }),

        // Browse components command
        vscode.commands.registerCommand('revolutionaryUI.browseComponents', async () => {
            const panel = ComponentPreviewPanel.createOrShow(context.extensionUri);
            const components = await api.getComponents();
            panel.showComponentLibrary(components);
        }),

        // Insert component command
        vscode.commands.registerCommand('revolutionaryUI.insertComponent', async (component?: any) => {
            if (!component) {
                // Show quick pick if no component provided
                const searchProvider = new ComponentSearchProvider(api, cache);
                component = await searchProvider.searchComponents();
            }
            
            if (component) {
                await insertComponent(component);
                recentProvider.addRecentComponent(component);
            }
        }),

        // Generate component with AI
        vscode.commands.registerCommand('revolutionaryUI.generateComponent', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            // Get selected text or prompt for description
            let description = editor.document.getText(editor.selection);
            if (!description) {
                description = await vscode.window.showInputBox({
                    placeHolder: 'Describe the component you want to generate...',
                    prompt: 'Enter a natural language description of the component'
                }) || '';
            }

            if (!description) {
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating component with AI...',
                cancellable: false
            }, async () => {
                try {
                    const framework = vscode.workspace.getConfiguration('revolutionaryUI').get<string>('defaultFramework') || 'react';
                    const component = await aiGenerator.generateComponent(description, framework);
                    
                    if (component) {
                        await insertComponent(component);
                    }
                } catch (error: any) {
                    vscode.window.showErrorMessage(`Failed to generate component: ${error.message}`);
                }
            });
        }),

        // Show component preview
        vscode.commands.registerCommand('revolutionaryUI.showPreview', async (component: any) => {
            const panel = ComponentPreviewPanel.createOrShow(context.extensionUri);
            panel.showComponent(component);
        }),

        // Open settings
        vscode.commands.registerCommand('revolutionaryUI.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'revolutionaryUI');
        }),

        // Refresh components
        vscode.commands.registerCommand('revolutionaryUI.refreshComponents', () => {
            cache.clear();
            componentExplorer.refresh();
            vscode.window.showInformationMessage('Component library refreshed');
        }),

        // Add to favorites
        vscode.commands.registerCommand('revolutionaryUI.addToFavorites', (component: any) => {
            favoritesProvider.addFavorite(component);
            vscode.window.showInformationMessage(`Added ${component.name} to favorites`);
        }),

        // Remove from favorites
        vscode.commands.registerCommand('revolutionaryUI.removeFromFavorites', (component: any) => {
            favoritesProvider.removeFavorite(component.id);
            vscode.window.showInformationMessage(`Removed ${component.name} from favorites`);
        })
    ];

    context.subscriptions.push(...commands);

    // Register completion provider for component snippets
    const componentProvider = new ComponentProvider(api, cache);
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'vue', 'html'],
        componentProvider,
        '<' // Trigger on '<' character
    );
    
    context.subscriptions.push(completionProvider);

    // Handle configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('revolutionaryUI')) {
            api.updateConfiguration();
            cache.clear();
        }
    });
}

async function insertComponent(component: any) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const insertMode = vscode.workspace.getConfiguration('revolutionaryUI').get<string>('insertMode') || 'inline';
    
    try {
        // Fetch component code
        const componentCode = await api.getComponentCode(component.id);
        
        switch (insertMode) {
            case 'inline':
                // Insert at current cursor position
                await editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, componentCode);
                });
                break;
                
            case 'newFile':
                // Create new file with component
                const newDoc = await vscode.workspace.openTextDocument({
                    content: componentCode,
                    language: getLanguageId(component.framework)
                });
                await vscode.window.showTextDocument(newDoc);
                break;
                
            case 'clipboard':
                // Copy to clipboard
                await vscode.env.clipboard.writeText(componentCode);
                vscode.window.showInformationMessage('Component copied to clipboard');
                break;
        }
        
        vscode.window.showInformationMessage(`Inserted component: ${component.name}`);
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to insert component: ${error.message}`);
    }
}

function getLanguageId(framework: string): string {
    switch (framework) {
        case 'react':
            return 'typescriptreact';
        case 'vue':
            return 'vue';
        case 'angular':
            return 'typescript';
        case 'svelte':
            return 'svelte';
        default:
            return 'javascript';
    }
}

export function deactivate() {
    ComponentPreviewPanel.currentPanel?.dispose();
}