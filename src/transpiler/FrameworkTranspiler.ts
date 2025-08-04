import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ComponentAST, TranspilationResult, FrameworkType, ComponentMetadata } from './types';
import { ReactToVueTranspiler } from './transpilers/ReactToVueTranspiler';
import { VueToReactTranspiler } from './transpilers/VueToReactTranspiler';
import { ReactToAngularTranspiler } from './transpilers/ReactToAngularTranspiler';
import { AngularToReactTranspiler } from './transpilers/AngularToReactTranspiler';
import { ReactToSvelteTranspiler } from './transpilers/ReactToSvelteTranspiler';
import { SvelteToReactTranspiler } from './transpilers/SvelteToReactTranspiler';
import { VueToAngularTranspiler } from './transpilers/VueToAngularTranspiler';
import { AngularToVueTranspiler } from './transpilers/AngularToVueTranspiler';
import { VueToSvelteTranspiler } from './transpilers/VueToSvelteTranspiler';
import { SvelteToVueTranspiler } from './transpilers/SvelteToVueTranspiler';

export class FrameworkTranspiler {
  private transpilers: Map<string, any>;
  
  constructor() {
    this.transpilers = new Map();
    this.registerTranspilers();
  }

  private registerTranspilers() {
    // React transpilers
    this.transpilers.set('react-vue', new ReactToVueTranspiler());
    this.transpilers.set('react-angular', new ReactToAngularTranspiler());
    this.transpilers.set('react-svelte', new ReactToSvelteTranspiler());
    
    // Vue transpilers
    this.transpilers.set('vue-react', new VueToReactTranspiler());
    this.transpilers.set('vue-angular', new VueToAngularTranspiler());
    this.transpilers.set('vue-svelte', new VueToSvelteTranspiler());
    
    // Angular transpilers
    this.transpilers.set('angular-react', new AngularToReactTranspiler());
    this.transpilers.set('angular-vue', new AngularToVueTranspiler());
    
    // Svelte transpilers
    this.transpilers.set('svelte-react', new SvelteToReactTranspiler());
    this.transpilers.set('svelte-vue', new SvelteToVueTranspiler());
  }

  async transpile(
    code: string,
    sourceFramework: FrameworkType,
    targetFramework: FrameworkType,
    options: TranspileOptions = {}
  ): Promise<TranspilationResult> {
    try {
      // Validate frameworks
      if (sourceFramework === targetFramework) {
        return {
          success: true,
          code,
          framework: sourceFramework,
          warnings: ['Source and target frameworks are the same']
        };
      }

      // Get appropriate transpiler
      const transpilerKey = `${sourceFramework}-${targetFramework}`;
      const transpiler = this.transpilers.get(transpilerKey);
      
      if (!transpiler) {
        throw new Error(`No transpiler available for ${sourceFramework} to ${targetFramework}`);
      }

      // Extract component metadata
      const metadata = await this.extractComponentMetadata(code, sourceFramework);
      
      // Perform transpilation
      const result = await transpiler.transpile(code, metadata, options);
      
      // Post-process the result
      const postProcessed = await this.postProcess(result, targetFramework, options);
      
      return {
        success: true,
        code: postProcessed.code,
        framework: targetFramework,
        metadata: postProcessed.metadata,
        imports: postProcessed.imports,
        warnings: postProcessed.warnings || [],
        sourceMap: options.generateSourceMap ? postProcessed.sourceMap : undefined
      };
    } catch (error) {
      return {
        success: false,
        code: '',
        framework: targetFramework,
        error: error instanceof Error ? error.message : 'Unknown error',
        warnings: []
      };
    }
  }

  private async extractComponentMetadata(
    code: string,
    framework: FrameworkType
  ): Promise<ComponentMetadata> {
    const metadata: ComponentMetadata = {
      name: 'Component',
      props: {},
      state: {},
      methods: {},
      lifecycle: {},
      dependencies: [],
      styles: '',
      template: ''
    };

    switch (framework) {
      case 'react':
        return this.extractReactMetadata(code);
      case 'vue':
        return this.extractVueMetadata(code);
      case 'angular':
        return this.extractAngularMetadata(code);
      case 'svelte':
        return this.extractSvelteMetadata(code);
      default:
        return metadata;
    }
  }

  private extractReactMetadata(code: string): ComponentMetadata {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const metadata: ComponentMetadata = {
      name: 'Component',
      props: {},
      state: {},
      methods: {},
      lifecycle: {},
      dependencies: [],
      styles: '',
      template: ''
    };

    traverse(ast, {
      // Extract imports
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers.map(spec => {
          if (t.isImportDefaultSpecifier(spec)) {
            return { name: spec.local.name, type: 'default' };
          } else if (t.isImportSpecifier(spec)) {
            return { 
              name: spec.local.name, 
              type: 'named',
              imported: (spec.imported as t.Identifier).name 
            };
          }
          return null;
        }).filter(Boolean);

        metadata.dependencies.push({
          source,
          specifiers: specifiers as any
        });
      },

      // Extract component name and props
      FunctionDeclaration(path) {
        if (path.node.id) {
          metadata.name = path.node.id.name;
        }
        
        // Extract props from parameters
        const params = path.node.params;
        if (params.length > 0 && t.isObjectPattern(params[0])) {
          params[0].properties.forEach(prop => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              metadata.props[prop.key.name] = {
                type: 'any',
                required: false
              };
            }
          });
        }
      },

      // Extract hooks and state
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const hookName = path.node.callee.name;
          
          // useState
          if (hookName === 'useState') {
            const parent = path.findParent(p => p.isVariableDeclarator());
            if (parent && t.isArrayPattern((parent.node as any).id)) {
              const elements = (parent.node as any).id.elements;
              if (elements[0] && t.isIdentifier(elements[0])) {
                const stateName = elements[0].name;
                const initialValue = path.node.arguments[0];
                metadata.state[stateName] = {
                  type: 'any',
                  initial: initialValue ? generate(initialValue).code : 'undefined'
                };
              }
            }
          }
          
          // useEffect
          if (hookName === 'useEffect') {
            const deps = path.node.arguments[1];
            const depsArray = deps && t.isArrayExpression(deps) 
              ? deps.elements.map(el => el && t.isIdentifier(el) ? el.name : '')
              : [];
            
            if (depsArray.length === 0) {
              metadata.lifecycle.mounted = generate(path.node.arguments[0]).code;
            }
          }
        }
      },

      // Extract JSX template
      JSXElement(path) {
        if (!metadata.template) {
          metadata.template = generate(path.node).code;
        }
      }
    });

    return metadata;
  }

  private extractVueMetadata(code: string): ComponentMetadata {
    // Parse Vue SFC or options API
    const metadata: ComponentMetadata = {
      name: 'Component',
      props: {},
      state: {},
      methods: {},
      lifecycle: {},
      dependencies: [],
      styles: '',
      template: ''
    };

    // Extract template section
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      metadata.template = templateMatch[1].trim();
    }

    // Extract script section
    const scriptMatch = code.match(/<script.*?>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];
      
      // Parse composition API or options API
      if (scriptContent.includes('defineComponent') || scriptContent.includes('export default')) {
        // Parse the script content
        try {
          const ast = parse(scriptContent, {
            sourceType: 'module',
            plugins: ['typescript']
          });

          traverse(ast, {
            ObjectProperty(path) {
              const key = path.node.key;
              if (t.isIdentifier(key)) {
                switch (key.name) {
                  case 'props':
                    // Extract props definition
                    if (t.isObjectExpression(path.node.value)) {
                      path.node.value.properties.forEach(prop => {
                        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                          metadata.props[prop.key.name] = {
                            type: 'any',
                            required: false
                          };
                        }
                      });
                    }
                    break;
                  case 'data':
                    // Extract data properties
                    if (t.isFunctionExpression(path.node.value) || t.isArrowFunctionExpression(path.node.value)) {
                      const returnStatement = path.node.value.body;
                      if (t.isBlockStatement(returnStatement)) {
                        const returnStmt = returnStatement.body.find(stmt => t.isReturnStatement(stmt)) as t.ReturnStatement;
                        if (returnStmt && t.isObjectExpression(returnStmt.argument)) {
                          returnStmt.argument.properties.forEach(prop => {
                            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                              metadata.state[prop.key.name] = {
                                type: 'any',
                                initial: generate(prop.value).code
                              };
                            }
                          });
                        }
                      }
                    }
                    break;
                  case 'methods':
                    // Extract methods
                    if (t.isObjectExpression(path.node.value)) {
                      path.node.value.properties.forEach(prop => {
                        if (t.isObjectMethod(prop) && t.isIdentifier(prop.key)) {
                          metadata.methods[prop.key.name] = {
                            params: prop.params.map(p => t.isIdentifier(p) ? p.name : 'param'),
                            body: generate(prop.body).code
                          };
                        }
                      });
                    }
                    break;
                }
              }
            }
          });
        } catch (error) {
          console.error('Error parsing Vue script:', error);
        }
      }
    }

    // Extract style section
    const styleMatch = code.match(/<style.*?>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      metadata.styles = styleMatch[1].trim();
    }

    return metadata;
  }

  private extractAngularMetadata(code: string): ComponentMetadata {
    const metadata: ComponentMetadata = {
      name: 'Component',
      props: {},
      state: {},
      methods: {},
      lifecycle: {},
      dependencies: [],
      styles: '',
      template: ''
    };

    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'decorators-legacy']
      });

      traverse(ast, {
        // Extract component decorator
        Decorator(path) {
          if (t.isCallExpression(path.node.expression) && 
              t.isIdentifier(path.node.expression.callee) &&
              path.node.expression.callee.name === 'Component') {
            
            const args = path.node.expression.arguments;
            if (args.length > 0 && t.isObjectExpression(args[0])) {
              args[0].properties.forEach(prop => {
                if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                  if (prop.key.name === 'template' && t.isStringLiteral(prop.value)) {
                    metadata.template = prop.value.value;
                  } else if (prop.key.name === 'styles' && t.isArrayExpression(prop.value)) {
                    metadata.styles = prop.value.elements
                      .filter(el => t.isStringLiteral(el))
                      .map(el => (el as t.StringLiteral).value)
                      .join('\n');
                  }
                }
              });
            }
          }
        },

        // Extract class properties and methods
        ClassDeclaration(path) {
          metadata.name = path.node.id?.name || 'Component';

          path.node.body.body.forEach(member => {
            // Extract @Input() properties
            if (t.isClassProperty(member) && member.decorators) {
              const inputDecorator = member.decorators.find(dec => 
                t.isCallExpression(dec.expression) &&
                t.isIdentifier(dec.expression.callee) &&
                dec.expression.callee.name === 'Input'
              );

              if (inputDecorator && t.isIdentifier(member.key)) {
                metadata.props[member.key.name] = {
                  type: 'any',
                  required: false
                };
              }
            }

            // Extract class properties as state
            if (t.isClassProperty(member) && t.isIdentifier(member.key) && !member.decorators) {
              metadata.state[member.key.name] = {
                type: 'any',
                initial: member.value ? generate(member.value).code : 'undefined'
              };
            }

            // Extract methods
            if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
              const methodName = member.key.name;
              
              // Check for lifecycle methods
              if (['ngOnInit', 'ngOnDestroy', 'ngOnChanges'].includes(methodName)) {
                metadata.lifecycle[methodName] = generate(member.body).code;
              } else {
                metadata.methods[methodName] = {
                  params: member.params.map(p => t.isIdentifier(p) ? p.name : 'param'),
                  body: generate(member.body).code
                };
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error parsing Angular component:', error);
    }

    return metadata;
  }

  private extractSvelteMetadata(code: string): ComponentMetadata {
    const metadata: ComponentMetadata = {
      name: 'Component',
      props: {},
      state: {},
      methods: {},
      lifecycle: {},
      dependencies: [],
      styles: '',
      template: ''
    };

    // Extract script section
    const scriptMatch = code.match(/<script.*?>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];
      
      try {
        const ast = parse(scriptContent, {
          sourceType: 'module',
          plugins: ['typescript']
        });

        traverse(ast, {
          // Extract exports (props)
          ExportNamedDeclaration(path) {
            if (path.node.declaration && t.isVariableDeclaration(path.node.declaration)) {
              path.node.declaration.declarations.forEach(decl => {
                if (t.isIdentifier(decl.id)) {
                  metadata.props[decl.id.name] = {
                    type: 'any',
                    required: false
                  };
                }
              });
            }
          },

          // Extract reactive declarations ($:)
          LabeledStatement(path) {
            if (t.isIdentifier(path.node.label) && path.node.label.name === '$') {
              // This is a reactive statement
              metadata.state['reactive'] = {
                type: 'reactive',
                initial: generate(path.node.body).code
              };
            }
          },

          // Extract regular variables as state
          VariableDeclaration(path) {
            if (!path.findParent(p => p.isExportNamedDeclaration())) {
              path.node.declarations.forEach(decl => {
                if (t.isIdentifier(decl.id)) {
                  metadata.state[decl.id.name] = {
                    type: 'any',
                    initial: decl.init ? generate(decl.init).code : 'undefined'
                  };
                }
              });
            }
          },

          // Extract functions as methods
          FunctionDeclaration(path) {
            if (path.node.id) {
              metadata.methods[path.node.id.name] = {
                params: path.node.params.map(p => t.isIdentifier(p) ? p.name : 'param'),
                body: generate(path.node.body).code
              };
            }
          }
        });
      } catch (error) {
        console.error('Error parsing Svelte script:', error);
      }
    }

    // Extract template (everything outside script and style tags)
    const templateContent = code
      .replace(/<script.*?>[\s\S]*?<\/script>/g, '')
      .replace(/<style.*?>[\s\S]*?<\/style>/g, '')
      .trim();
    
    metadata.template = templateContent;

    // Extract styles
    const styleMatch = code.match(/<style.*?>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      metadata.styles = styleMatch[1].trim();
    }

    return metadata;
  }

  private async postProcess(
    result: any,
    targetFramework: FrameworkType,
    options: TranspileOptions
  ): Promise<any> {
    let processedCode = result.code;

    // Format code if requested
    if (options.format) {
      processedCode = await this.formatCode(processedCode, targetFramework);
    }

    // Add framework-specific boilerplate if needed
    if (options.addBoilerplate) {
      processedCode = this.addBoilerplate(processedCode, targetFramework, result.metadata);
    }

    // Optimize imports
    if (options.optimizeImports) {
      processedCode = this.optimizeImports(processedCode, targetFramework);
    }

    return {
      ...result,
      code: processedCode
    };
  }

  private async formatCode(code: string, framework: FrameworkType): Promise<string> {
    // Use prettier or framework-specific formatter
    try {
      const prettier = await import('prettier');
      const parser = framework === 'vue' ? 'vue' : 
                     framework === 'angular' ? 'typescript' : 
                     'babel-ts';
      
      return prettier.format(code, {
        parser,
        semi: true,
        singleQuote: true,
        tabWidth: 2
      });
    } catch {
      return code;
    }
  }

  private addBoilerplate(code: string, framework: FrameworkType, metadata: any): string {
    switch (framework) {
      case 'vue':
        if (!code.includes('<template>')) {
          return `<template>\n  ${metadata.template || '<div></div>'}\n</template>\n\n<script>\n${code}\n</script>`;
        }
        break;
      case 'angular':
        if (!code.includes('@Component')) {
          return `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-component',\n  template: \`${metadata.template || ''}\`\n})\n${code}`;
        }
        break;
    }
    return code;
  }

  private optimizeImports(code: string, framework: FrameworkType): string {
    // Remove duplicate imports and organize them
    const importRegex = /import\s+(?:{[^}]+}|[\w\s,]+)\s+from\s+['"][^'"]+['"];?/g;
    const imports = code.match(importRegex) || [];
    const uniqueImports = [...new Set(imports)];
    
    let cleanedCode = code.replace(importRegex, '');
    return uniqueImports.join('\n') + '\n\n' + cleanedCode.trim();
  }
}

interface TranspileOptions {
  format?: boolean;
  addBoilerplate?: boolean;
  optimizeImports?: boolean;
  generateSourceMap?: boolean;
  preserveComments?: boolean;
  typescript?: boolean;
  componentName?: string;
}