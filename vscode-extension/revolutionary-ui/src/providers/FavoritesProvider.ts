import * as vscode from 'vscode';
import { Component } from '../api/RevolutionaryUIAPI';

interface FavoriteComponent {
    id: string;
    component: Component;
    addedAt: Date;
}

export class FavoritesProvider implements vscode.TreeDataProvider<FavoriteItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FavoriteItem | undefined | null | void> = new vscode.EventEmitter<FavoriteItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FavoriteItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private favorites: FavoriteComponent[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadFavorites();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FavoriteItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FavoriteItem): Promise<FavoriteItem[]> {
        if (!element) {
            return this.favorites.map(fav => new FavoriteItem(
                fav.component,
                `Added ${this.formatDate(fav.addedAt)}`
            ));
        }
        return [];
    }

    addFavorite(component: Component) {
        const exists = this.favorites.some(fav => fav.id === component.id);
        if (!exists) {
            this.favorites.unshift({
                id: component.id,
                component,
                addedAt: new Date()
            });
            this.saveFavorites();
            this.refresh();
        }
    }

    removeFavorite(componentId: string) {
        this.favorites = this.favorites.filter(fav => fav.id !== componentId);
        this.saveFavorites();
        this.refresh();
    }

    isFavorite(componentId: string): boolean {
        return this.favorites.some(fav => fav.id === componentId);
    }

    private loadFavorites() {
        const stored = this.context.globalState.get<FavoriteComponent[]>('favorites', []);
        this.favorites = stored.map(fav => ({
            ...fav,
            addedAt: new Date(fav.addedAt)
        }));
    }

    private saveFavorites() {
        this.context.globalState.update('favorites', this.favorites);
    }

    private formatDate(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return 'today';
        } else if (days === 1) {
            return 'yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

class FavoriteItem extends vscode.TreeItem {
    constructor(
        public readonly component: Component,
        public readonly description: string
    ) {
        super(component.name, vscode.TreeItemCollapsibleState.None);

        this.tooltip = component.description;
        this.description = description;
        this.iconPath = new vscode.ThemeIcon('star-full');
        this.contextValue = 'favorite';
        
        this.command = {
            command: 'revolutionaryUI.showPreview',
            title: 'Show Preview',
            arguments: [component]
        };
    }
}