import * as vscode from 'vscode';
import { RevolutionaryUIAPI, Component } from '../api/RevolutionaryUIAPI';
import { ComponentCache } from '../services/ComponentCache';

export class ComponentProvider implements vscode.CompletionItemProvider {
    constructor(
        private api: RevolutionaryUIAPI,
        private cache: ComponentCache
    ) {}

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[]> {
        // Get the word range at the current position
        const wordRange = document.getWordRangeAtPosition(position);
        const word = wordRange ? document.getText(wordRange) : '';

        // Check if we're in a JSX/TSX context
        const lineText = document.lineAt(position).text;
        const beforeCursor = lineText.substring(0, position.character);
        
        // Only provide completions after '<' in JSX context
        if (!beforeCursor.match(/<\s*\w*$/)) {
            return [];
        }

        // Get components from cache or API
        let components: Component[] = [];
        const cacheKey = 'completion-components';
        
        if (this.cache.has(cacheKey)) {
            components = this.cache.get(cacheKey) || [];
        } else {
            try {
                const framework = this.getFrameworkFromDocument(document);
                components = await this.api.getComponents({ 
                    framework,
                    limit: 50 
                });
                this.cache.set(cacheKey, components, 300); // Cache for 5 minutes
            } catch (error) {
                console.error('Failed to fetch components:', error);
                return [];
            }
        }

        // Filter components based on the current word
        const filtered = word 
            ? components.filter(c => c.name.toLowerCase().includes(word.toLowerCase()))
            : components;

        // Convert to completion items
        return filtered.map(component => {
            const item = new vscode.CompletionItem(
                component.name,
                vscode.CompletionItemKind.Snippet
            );

            item.detail = `${component.framework} Component - ${component.category}`;
            item.documentation = new vscode.MarkdownString(
                `**${component.name}**\n\n${component.description}\n\n` +
                `Framework: ${component.framework}\n\n` +
                `Category: ${component.category}\n\n` +
                `Tags: ${component.tags.join(', ')}\n\n` +
                `Downloads: ${component.downloads}`
            );

            // Create a snippet that inserts the component tag
            item.insertText = new vscode.SnippetString(`${component.name}$0></${component.name}>`);
            
            // Add command to insert full component code
            item.command = {
                command: 'revolutionaryUI.insertComponent',
                title: 'Insert Full Component',
                arguments: [component]
            };

            // Sort by popularity
            item.sortText = String(99999 - component.downloads).padStart(5, '0');

            return item;
        });
    }

    private getFrameworkFromDocument(document: vscode.TextDocument): string | undefined {
        const fileName = document.fileName.toLowerCase();
        
        if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
            return 'react';
        } else if (fileName.endsWith('.vue')) {
            return 'vue';
        } else if (fileName.includes('angular') || fileName.endsWith('.component.ts')) {
            return 'angular';
        } else if (fileName.endsWith('.svelte')) {
            return 'svelte';
        }
        
        // Check document content for framework hints
        const content = document.getText();
        if (content.includes('import React') || content.includes('from "react"')) {
            return 'react';
        } else if (content.includes('Vue.') || content.includes('createApp')) {
            return 'vue';
        } else if (content.includes('@angular/') || content.includes('@Component')) {
            return 'angular';
        }
        
        return undefined;
    }
}