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
exports.FrameworkDetector = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FrameworkDetector {
    async detect() {
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
                if (deps['react'] || deps['react-dom'])
                    return 'react';
                if (deps['vue'] || deps['@vue/core'])
                    return 'vue';
                if (deps['@angular/core'])
                    return 'angular';
                if (deps['svelte'])
                    return 'svelte';
                if (deps['solid-js'])
                    return 'solid';
                if (deps['preact'])
                    return 'preact';
                if (deps['alpinejs'])
                    return 'alpine';
                if (deps['lit'] || deps['lit-element'])
                    return 'lit';
                if (deps['@builder.io/qwik'])
                    return 'qwik';
                if (deps['astro'])
                    return 'astro';
            }
            catch (error) {
                console.error('Error reading package.json:', error);
            }
        }
        // Check for framework-specific files
        if (fs.existsSync(path.join(rootPath, 'angular.json')))
            return 'angular';
        if (fs.existsSync(path.join(rootPath, 'vue.config.js')))
            return 'vue';
        if (fs.existsSync(path.join(rootPath, 'svelte.config.js')))
            return 'svelte';
        if (fs.existsSync(path.join(rootPath, 'astro.config.mjs')))
            return 'astro';
        // Check for Next.js
        if (fs.existsSync(path.join(rootPath, 'next.config.js')) ||
            fs.existsSync(path.join(rootPath, 'next.config.mjs'))) {
            return 'react';
        }
        // Check configuration setting
        const config = vscode.workspace.getConfiguration('revolutionaryUI');
        const configuredFramework = config.get('framework');
        if (configuredFramework && configuredFramework !== 'auto-detect') {
            return configuredFramework;
        }
        // Ask user if we can't detect
        return await this.askUserForFramework();
    }
    async askUserForFramework() {
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
exports.FrameworkDetector = FrameworkDetector;
//# sourceMappingURL=frameworkDetector.js.map