import * as vscode from 'vscode';
import { Component } from '../api/RevolutionaryUIAPI';

interface RecentComponent {
    component: Component;
    usedAt: Date;
}

export class RecentComponentsProvider implements vscode.TreeDataProvider<RecentItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RecentItem | undefined | null | void> = new vscode.EventEmitter<RecentItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<RecentItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private recents: RecentComponent[] = [];
    private maxRecents = 20;

    constructor(private context: vscode.ExtensionContext) {
        this.loadRecents();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RecentItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: RecentItem): Promise<RecentItem[]> {
        if (!element) {
            return this.recents.map(recent => new RecentItem(
                recent.component,
                `Used ${this.formatDate(recent.usedAt)}`
            ));
        }
        return [];
    }

    addRecentComponent(component: Component) {
        // Remove if already exists
        this.recents = this.recents.filter(r => r.component.id !== component.id);
        
        // Add to beginning
        this.recents.unshift({
            component,
            usedAt: new Date()
        });

        // Keep only max items
        if (this.recents.length > this.maxRecents) {
            this.recents = this.recents.slice(0, this.maxRecents);
        }

        this.saveRecents();
        this.refresh();
    }

    clearRecents() {
        this.recents = [];
        this.saveRecents();
        this.refresh();
    }

    private loadRecents() {
        const stored = this.context.globalState.get<RecentComponent[]>('recentComponents', []);
        this.recents = stored.map(recent => ({
            ...recent,
            usedAt: new Date(recent.usedAt)
        }));
    }

    private saveRecents() {
        this.context.globalState.update('recentComponents', this.recents);
    }

    private formatDate(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) {
            return 'just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        } else if (days === 1) {
            return 'yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

class RecentItem extends vscode.TreeItem {
    constructor(
        public readonly component: Component,
        public readonly description: string
    ) {
        super(component.name, vscode.TreeItemCollapsibleState.None);

        this.tooltip = component.description;
        this.description = description;
        this.iconPath = new vscode.ThemeIcon('history');
        this.contextValue = 'recent';
        
        this.command = {
            command: 'revolutionaryUI.showPreview',
            title: 'Show Preview',
            arguments: [component]
        };
    }
}