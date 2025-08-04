import * as vscode from 'vscode';
import axios from 'axios';

interface GeneratedComponent {
    name: string;
    code: string;
    framework: string;
    description: string;
}

export class AIComponentGenerator {
    private openAIKey: string = '';

    constructor() {
        this.updateConfiguration();
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('revolutionaryUI.openAIKey')) {
                this.updateConfiguration();
            }
        });
    }

    private updateConfiguration() {
        const config = vscode.workspace.getConfiguration('revolutionaryUI');
        this.openAIKey = config.get<string>('openAIKey') || '';
    }

    async generateComponent(description: string, framework: string): Promise<GeneratedComponent | null> {
        if (!this.openAIKey) {
            const action = await vscode.window.showErrorMessage(
                'OpenAI API key not configured. Please set it in settings to use AI generation.',
                'Open Settings'
            );
            
            if (action === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'revolutionaryUI.openAIKey');
            }
            return null;
        }

        try {
            const prompt = this.createPrompt(description, framework);
            
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt(framework)
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openAIKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const content = response.data.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from AI');
            }

            // Parse the response
            const component = this.parseAIResponse(content, framework, description);
            return component;
        } catch (error: any) {
            if (error.response?.status === 401) {
                vscode.window.showErrorMessage('Invalid OpenAI API key. Please check your settings.');
            } else if (error.response?.status === 429) {
                vscode.window.showErrorMessage('OpenAI rate limit exceeded. Please try again later.');
            } else {
                vscode.window.showErrorMessage(`AI generation failed: ${error.message}`);
            }
            return null;
        }
    }

    private createPrompt(description: string, framework: string): string {
        return `Generate a ${framework} component based on this description: ${description}

Requirements:
- Use modern ${framework} best practices
- Include TypeScript types if applicable
- Make it responsive and accessible
- Use Tailwind CSS for styling
- Export as default or named export
- Include helpful comments

Return only the component code without any markdown formatting or explanations.`;
    }

    private getSystemPrompt(framework: string): string {
        const basePrompt = `You are an expert UI component developer. Generate clean, production-ready components that follow best practices.`;
        
        const frameworkPrompts: Record<string, string> = {
            react: `${basePrompt} Use React 18+ features, functional components with hooks, and TypeScript. Prefer modern patterns like custom hooks for logic separation.`,
            vue: `${basePrompt} Use Vue 3 Composition API with <script setup> syntax and TypeScript. Use reactive refs and computed properties appropriately.`,
            angular: `${basePrompt} Use Angular 14+ with standalone components, signals where appropriate, and TypeScript. Follow Angular style guide.`,
            svelte: `${basePrompt} Use Svelte 4+ with TypeScript. Leverage Svelte's reactivity and minimize bundle size.`,
            vanilla: `${basePrompt} Use modern vanilla JavaScript with ES6+ features. Create reusable, framework-agnostic components.`
        };

        return frameworkPrompts[framework] || basePrompt;
    }

    private parseAIResponse(content: string, framework: string, description: string): GeneratedComponent {
        // Extract component name from the code
        let name = 'GeneratedComponent';
        
        // Try to extract component name based on framework
        const namePatterns: Record<string, RegExp> = {
            react: /(?:export\s+(?:default\s+)?(?:function|const)\s+|const\s+)(\w+)/,
            vue: /name:\s*['"](\w+)['"]/,
            angular: /@Component\s*\(\s*{[^}]*selector:\s*['"]([^'"]+)['"]/,
            svelte: /export\s+(?:let|const)\s+(\w+)/,
            vanilla: /(?:class|function)\s+(\w+)/
        };

        const pattern = namePatterns[framework];
        if (pattern) {
            const match = content.match(pattern);
            if (match && match[1]) {
                name = match[1];
            }
        }

        // Clean up the code (remove any markdown formatting if present)
        let code = content;
        if (content.includes('```')) {
            const codeMatch = content.match(/```(?:\w+)?\n([\s\S]*?)```/);
            if (codeMatch) {
                code = codeMatch[1];
            }
        }

        return {
            name,
            code: code.trim(),
            framework,
            description
        };
    }
}