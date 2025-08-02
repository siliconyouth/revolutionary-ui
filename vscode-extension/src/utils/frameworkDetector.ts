import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FrameworkDetector {
    async detect(): Promise<string> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return await this.askUserForFramework();
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        
        // Check package.json for dependencies
        const packageJsonPath = path.join(rootPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                // Check for frameworks in order of popularity
                if (deps['react'] || deps['react-dom']) return 'react';
                if (deps['vue'] || deps['@vue/core']) return 'vue';
                if (deps['@angular/core']) return 'angular';
                if (deps['svelte']) return 'svelte';
                if (deps['solid-js']) return 'solid';
                if (deps['preact']) return 'preact';
                if (deps['alpinejs']) return 'alpine';
                if (deps['lit'] || deps['lit-element']) return 'lit';
                if (deps['@builder.io/qwik']) return 'qwik';
                if (deps['astro']) return 'astro';
            } catch (error) {
                console.error('Error reading package.json:', error);
            }
        }

        // Check for framework-specific files
        if (fs.existsSync(path.join(rootPath, 'angular.json'))) return 'angular';
        if (fs.existsSync(path.join(rootPath, 'vue.config.js'))) return 'vue';
        if (fs.existsSync(path.join(rootPath, 'svelte.config.js'))) return 'svelte';
        if (fs.existsSync(path.join(rootPath, 'astro.config.mjs'))) return 'astro';
        
        // Check for Next.js
        if (fs.existsSync(path.join(rootPath, 'next.config.js')) || 
            fs.existsSync(path.join(rootPath, 'next.config.mjs'))) {
            return 'react';
        }

        // Check configuration setting
        const config = vscode.workspace.getConfiguration('revolutionaryUI');
        const configuredFramework = config.get<string>('framework');
        if (configuredFramework && configuredFramework !== 'auto-detect') {
            return configuredFramework;
        }

        // Ask user if we can't detect
        return await this.askUserForFramework();
    }

    private async askUserForFramework(): Promise<string> {
        const frameworks = [
            { label: '⚛️ React', value: 'react', description: 'React 17+ with hooks' },
            { label: '💚 Vue', value: 'vue', description: 'Vue 3 with Composition API' },
            { label: '🅰️ Angular', value: 'angular', description: 'Angular 12+' },
            { label: '🔥 Svelte', value: 'svelte', description: 'Svelte 3+' },
            { label: '⚡ Solid', value: 'solid', description: 'SolidJS' },
            { label: '🦾 Preact', value: 'preact', description: 'Lightweight React alternative' },
            { label: '🏔️ Alpine.js', value: 'alpine', description: 'Minimal framework' },
            { label: '🔥 Lit', value: 'lit', description: 'Web Components' },
            { label: '⚡ Qwik', value: 'qwik', description: 'Resumable framework' },
            { label: '🚀 Astro', value: 'astro', description: 'Static site generator' },
            { label: '🛠️ Custom', value: 'custom', description: 'Bring your own framework' }
        ];

        const selected = await vscode.window.showQuickPick(frameworks, {
            placeHolder: 'Select your framework',
            title: 'Revolutionary UI v2.0 - Framework Selection'
        });

        return selected?.value || 'react';
    }
}