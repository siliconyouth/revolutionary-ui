import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ComponentMetadata, TranspilerOptions } from '../types';
import { BaseTranspiler } from './BaseTranspiler';

export class ReactToAngularTranspiler extends BaseTranspiler {
  async transpile(
    code: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions = {}
  ): Promise<any> {
    // Transform React component to Angular
    const angularComponent = this.transformToAngularComponent(metadata, options);
    const template = this.transformJSXToAngularTemplate(metadata.template);
    const styles = this.extractAndTransformStyles(metadata.styles);

    return {
      code: angularComponent,
      template,
      styles,
      metadata,
      warnings: this.warnings
    };
  }

  private transformToAngularComponent(
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): string {
    const imports: string[] = [];
    const classProperties: string[] = [];
    const classMethods: string[] = [];
    const inputs: string[] = [];
    const outputs: string[] = [];

    // Add Angular core imports
    const angularImports = ['Component'];
    if (Object.keys(metadata.props).length > 0) {
      angularImports.push('Input');
    }
    if (metadata.emits && metadata.emits.length > 0) {
      angularImports.push('Output', 'EventEmitter');
    }
    if (metadata.lifecycle.mounted || metadata.lifecycle.unmounted) {
      angularImports.push('OnInit', 'OnDestroy');
    }
    imports.push(`import { ${angularImports.join(', ')} } from '@angular/core'`);

    // Add other imports
    metadata.dependencies.forEach(dep => {
      if (!dep.source.includes('react')) {
        const specs = dep.specifiers.map(spec => {
          if (spec.type === 'default') return spec.name;
          if (spec.type === 'named') return `{ ${spec.name} }`;
          return '';
        }).filter(Boolean).join(', ');
        
        imports.push(`import ${specs} from '${dep.source}'`);
      }
    });

    // Transform props to @Input()
    Object.entries(metadata.props).forEach(([name, prop]) => {
      inputs.push(`@Input() ${name}: ${this.mapTypeToTypeScript(prop.type)}`);
    });

    // Transform emits to @Output()
    if (metadata.emits) {
      metadata.emits.forEach(eventName => {
        const outputName = eventName.replace(/^on/, '').toLowerCase();
        outputs.push(`@Output() ${outputName} = new EventEmitter<any>()`);
      });
    }

    // Transform state to class properties
    Object.entries(metadata.state).forEach(([name, state]) => {
      classProperties.push(`${name}: ${this.mapTypeToTypeScript(state.type)} = ${state.initial}`);
    });

    // Transform methods to class methods
    Object.entries(metadata.methods).forEach(([name, method]) => {
      const params = method.params.map(p => `${p}: any`).join(', ');
      classMethods.push(`${name}(${params})${method.body}`);
    });

    // Add lifecycle methods
    const interfaces: string[] = [];
    if (metadata.lifecycle.mounted) {
      interfaces.push('OnInit');
      classMethods.push(`ngOnInit() ${metadata.lifecycle.mounted}`);
    }
    if (metadata.lifecycle.unmounted) {
      interfaces.push('OnDestroy');
      classMethods.push(`ngOnDestroy() ${metadata.lifecycle.unmounted}`);
    }

    // Generate the component class
    const componentName = metadata.name;
    const selector = this.convertCamelToKebab(componentName);
    const implementsClause = interfaces.length > 0 ? ` implements ${interfaces.join(', ')}` : '';

    return `${imports.join('\n')}

@Component({
  selector: '${selector}',
  templateUrl: './${selector}.component.html',
  styleUrls: ['./${selector}.component.css']
})
export class ${componentName}Component${implementsClause} {
  ${inputs.join('\n  ')}
  ${outputs.join('\n  ')}
  
  ${classProperties.join('\n  ')}
  
  constructor() {}
  
  ${classMethods.join('\n\n  ')}
}`;
  }

  private transformJSXToAngularTemplate(jsx: string): string {
    if (!jsx) return '<div></div>';

    let template = jsx;

    // Transform className to class
    template = template.replace(/className=/g, 'class=');

    // Transform event handlers
    template = template.replace(/onClick=\{(\w+)\}/g, '(click)="$1()"');
    template = template.replace(/onChange=\{(\w+)\}/g, '(change)="$1($event)"');
    template = template.replace(/onSubmit=\{(\w+)\}/g, '(submit)="$1($event)"');
    template = template.replace(/onInput=\{(\w+)\}/g, '(input)="$1($event)"');

    // Transform conditional rendering
    // {condition && <Component />} -> <Component *ngIf="condition" />
    template = template.replace(/\{(\w+)\s*&&\s*<(\w+)([^>]*)\/>\}/g, '<$2 *ngIf="$1"$3/>');
    template = template.replace(/\{(\w+)\s*&&\s*<(\w+)([^>]*)>(.*?)<\/\2>\}/g, '<$2 *ngIf="$1"$3>$4</$2>');

    // Transform ternary operators to ng-container with ngIf/else
    template = template.replace(
      /\{(\w+)\s*\?\s*<(\w+)([^>]*)\/>\s*:\s*<(\w+)([^>]*)\/>\}/g,
      '<ng-container *ngIf="$1; else else$1"><$2$3/></ng-container><ng-template #else$1><$4$5/></ng-template>'
    );

    // Transform list rendering
    // {items.map(item => <Component key={item.id} />)} -> <Component *ngFor="let item of items" />
    template = template.replace(
      /\{(\w+)\.map\((\w+)\s*=>\s*<(\w+)([^>]*)\s+key=\{[^}]+\}([^>]*)>(.*?)<\/\3>\)\}/g,
      '<$3 *ngFor="let $2 of $1"$4$5>$6</$3>'
    );

    // Transform prop bindings
    // prop={value} -> [prop]="value"
    template = template.replace(/\s(\w+)=\{([^}]+)\}/g, ' [$1]="$2"');

    // Transform style bindings
    // style={{color: 'red'}} -> [ngStyle]="{color: 'red'}"
    template = template.replace(/style=\{\{([^}]+)\}\}/g, '[ngStyle]="{$1}"');

    // Transform interpolations
    // {value} -> {{ value }}
    template = template.replace(/\{([^}]+)\}/g, '{{ $1 }}');

    // Handle two-way binding for inputs
    // value={value} onChange={handler} -> [(ngModel)]="value"
    template = template.replace(
      /\[value\]="(\w+)"\s*\(change\)="[^"]+"/g,
      '[(ngModel)]="$1"'
    );

    return template;
  }

  private extractAndTransformStyles(styles: string): string {
    if (!styles) return '';

    // Transform any CSS-in-JS to regular CSS
    let css = styles;

    // Remove template literals
    css = css.replace(/`/g, '');

    // Transform nested selectors (if using styled-components style)
    css = css.replace(/&\s*{/g, ':host {');

    return css;
  }

  private mapTypeToTypeScript(type: string): string {
    const typeMap: Record<string, string> = {
      'String': 'string',
      'Number': 'number',
      'Boolean': 'boolean',
      'Array': 'any[]',
      'Object': 'any',
      'Function': '(...args: any[]) => any',
      'any': 'any'
    };

    return typeMap[type] || 'any';
  }
}