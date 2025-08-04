import { ComponentMetadata, ComponentCategory, ComponentType } from '../models/Component';
import { EnhancedAIManager } from '../../ai/EnhancedAIManager';
import chalk from 'chalk';

export interface AnalysisResult {
  category: ComponentCategory;
  type: ComponentType;
  tags: string[];
  keywords: string[];
  useCases: string[];
  designPatterns: string[];
  bestPractices: string[];
  similarComponents: string[];
}

export class ComponentAnalyzer {
  private aiManager: EnhancedAIManager;
  
  constructor() {
    this.aiManager = new EnhancedAIManager({
      provider: 'openai',
      model: 'gpt-4'
    });
  }
  
  async analyzeComponent(
    componentCode: string,
    componentName: string,
    metadata?: {
      framework?: string;
      styling?: string;
      sourceUrl?: string;
      patterns?: string[];
    }
  ): Promise<AnalysisResult> {
    console.log(chalk.cyan(`🔍 Analyzing component: ${componentName}`));
    
    // Use AI to analyze the component deeply
    const aiAnalysis = await this.performAIAnalysis(componentCode, componentName, metadata);
    
    // Combine with rule-based analysis
    const ruleBasedAnalysis = this.performRuleBasedAnalysis(componentCode, componentName, metadata);
    
    // Merge results
    return this.mergeAnalyses(aiAnalysis, ruleBasedAnalysis);
  }
  
  private async performAIAnalysis(
    componentCode: string,
    componentName: string,
    metadata?: any
  ): Promise<Partial<AnalysisResult>> {
    const prompt = `Analyze this ${metadata?.framework || 'web'} component and provide detailed categorization:

Component Name: ${componentName}
${metadata?.sourceUrl ? `Source: ${metadata.sourceUrl}` : ''}
${metadata?.patterns ? `Detected Patterns: ${metadata.patterns.join(', ')}` : ''}

Code:
\`\`\`${metadata?.framework || 'javascript'}
${componentCode.substring(0, 2000)}${componentCode.length > 2000 ? '...' : ''}
\`\`\`

Please analyze and provide:
1. Component Category (choose from: navigation, layout, forms, data-display, feedback, overlay, content, marketing, e-commerce, media, charts, animation, utility)
2. Specific Component Type (e.g., navbar, hero, card, modal, etc.)
3. Relevant Tags (features, characteristics, technologies)
4. Keywords for search
5. Common Use Cases
6. Design Patterns implemented
7. Best Practices followed
8. Similar well-known components

Format your response as JSON.`;
    
    try {
      const response = await this.aiManager.generateResponse(prompt, {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.3
      });
      
      // Parse AI response
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[1]);
        
        return {
          category: this.mapToComponentCategory(analysis.category),
          type: this.mapToComponentType(analysis.type),
          tags: analysis.tags || [],
          keywords: analysis.keywords || [],
          useCases: analysis.useCases || [],
          designPatterns: analysis.designPatterns || [],
          bestPractices: analysis.bestPractices || [],
          similarComponents: analysis.similarComponents || []
        };
      }
    } catch (error) {
      console.warn(chalk.yellow('AI analysis failed, falling back to rule-based'));
    }
    
    return {};
  }
  
  private performRuleBasedAnalysis(
    componentCode: string,
    componentName: string,
    metadata?: any
  ): Partial<AnalysisResult> {
    const analysis: Partial<AnalysisResult> = {
      tags: [],
      keywords: [],
      designPatterns: [],
      bestPractices: []
    };
    
    const lowerCode = componentCode.toLowerCase();
    const lowerName = componentName.toLowerCase();
    
    // Detect category and type from name and code
    const { category, type } = this.detectCategoryAndType(lowerName, lowerCode);
    analysis.category = category;
    analysis.type = type;
    
    // Extract tags based on features
    if (lowerCode.includes('usestate') || lowerCode.includes('ref(')) {
      analysis.tags!.push('stateful');
    }
    if (lowerCode.includes('animation') || lowerCode.includes('transition')) {
      analysis.tags!.push('animated');
    }
    if (lowerCode.includes('onclick') || lowerCode.includes('@click')) {
      analysis.tags!.push('interactive');
    }
    if (lowerCode.includes('aria-') || lowerCode.includes('role=')) {
      analysis.tags!.push('accessible');
    }
    if (lowerCode.includes('@media') || lowerCode.includes('breakpoint')) {
      analysis.tags!.push('responsive');
    }
    if (lowerCode.includes('dark:') || lowerCode.includes('theme')) {
      analysis.tags!.push('themeable');
    }
    
    // Detect design patterns
    if (lowerCode.includes('provider') || lowerCode.includes('context')) {
      analysis.designPatterns!.push('Provider Pattern');
    }
    if (lowerCode.includes('children') || lowerCode.includes('slot')) {
      analysis.designPatterns!.push('Composition Pattern');
    }
    if (lowerCode.includes('use') && metadata?.framework === 'react') {
      analysis.designPatterns!.push('Custom Hooks');
    }
    if (lowerCode.includes('memo') || lowerCode.includes('pure')) {
      analysis.designPatterns!.push('Memoization');
    }
    
    // Detect best practices
    if (componentCode.includes('PropTypes') || componentCode.includes('interface') || componentCode.includes('type')) {
      analysis.bestPractices!.push('Type Safety');
    }
    if (lowerCode.includes('test') || lowerCode.includes('spec')) {
      analysis.bestPractices!.push('Test Coverage');
    }
    if (lowerCode.includes('error') && lowerCode.includes('boundary')) {
      analysis.bestPractices!.push('Error Handling');
    }
    
    // Extract keywords
    const words = componentName.split(/(?=[A-Z])/).map(w => w.toLowerCase());
    analysis.keywords = [...new Set([...words, metadata?.framework || 'component'])];
    
    return analysis;
  }
  
  private detectCategoryAndType(name: string, code: string): { 
    category: ComponentCategory; 
    type: ComponentType 
  } {
    // Navigation
    if (name.includes('nav') || name.includes('menu') || code.includes('navigation')) {
      if (name.includes('side') || code.includes('sidebar')) {
        return { category: ComponentCategory.Navigation, type: ComponentType.Sidebar };
      }
      if (name.includes('bread') || code.includes('breadcrumb')) {
        return { category: ComponentCategory.Navigation, type: ComponentType.Breadcrumb };
      }
      if (name.includes('tab') || code.includes('tabs')) {
        return { category: ComponentCategory.Navigation, type: ComponentType.Tabs };
      }
      return { category: ComponentCategory.Navigation, type: ComponentType.Navbar };
    }
    
    // Layout
    if (name.includes('hero') || code.includes('hero')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Hero };
    }
    if (name.includes('footer') || code.includes('footer')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Footer };
    }
    if (name.includes('grid') || name.includes('layout')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Grid };
    }
    if (name.includes('container') || name.includes('wrapper')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Container };
    }
    
    // Forms
    if (name.includes('form') || name.includes('input') || code.includes('<form')) {
      if (name.includes('select') || code.includes('<select')) {
        return { category: ComponentCategory.Forms, type: ComponentType.Select };
      }
      if (name.includes('check') || code.includes('checkbox')) {
        return { category: ComponentCategory.Forms, type: ComponentType.Checkbox };
      }
      if (name.includes('radio')) {
        return { category: ComponentCategory.Forms, type: ComponentType.Radio };
      }
      if (name.includes('switch') || name.includes('toggle')) {
        return { category: ComponentCategory.Forms, type: ComponentType.Switch };
      }
      if (name.includes('date') || name.includes('picker')) {
        return { category: ComponentCategory.Forms, type: ComponentType.DatePicker };
      }
      return { category: ComponentCategory.Forms, type: ComponentType.Input };
    }
    
    // Data Display
    if (name.includes('card') || code.includes('card')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.Card };
    }
    if (name.includes('table') || code.includes('<table')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.Table };
    }
    if (name.includes('list') || code.includes('<ul') || code.includes('<ol')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.List };
    }
    if (name.includes('badge') || name.includes('chip')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.Badge };
    }
    if (name.includes('tag') || name.includes('label')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.Tag };
    }
    
    // Feedback
    if (name.includes('modal') || name.includes('dialog') || code.includes('modal')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Modal };
    }
    if (name.includes('alert') || name.includes('notification')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Alert };
    }
    if (name.includes('toast') || name.includes('snack')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Toast };
    }
    if (name.includes('progress') || name.includes('loading')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Progress };
    }
    if (name.includes('spinner') || name.includes('loader')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Spinner };
    }
    
    // Content
    if (name.includes('accordion') || name.includes('collapse')) {
      return { category: ComponentCategory.Content, type: ComponentType.Accordion };
    }
    if (name.includes('carousel') || name.includes('slider')) {
      return { category: ComponentCategory.Content, type: ComponentType.Carousel };
    }
    if (name.includes('gallery') || code.includes('gallery')) {
      return { category: ComponentCategory.Content, type: ComponentType.Gallery };
    }
    
    // Basic elements
    if (name.includes('button') || name.includes('btn') || code.includes('<button')) {
      return { category: ComponentCategory.Utility, type: ComponentType.Button };
    }
    if (name.includes('icon') || code.includes('icon')) {
      return { category: ComponentCategory.Utility, type: ComponentType.Icon };
    }
    if (name.includes('avatar') || code.includes('avatar')) {
      return { category: ComponentCategory.Utility, type: ComponentType.Avatar };
    }
    
    // Default
    return { category: ComponentCategory.Utility, type: ComponentType.Custom };
  }
  
  private mapToComponentCategory(category: string): ComponentCategory {
    const categoryMap: Record<string, ComponentCategory> = {
      'navigation': ComponentCategory.Navigation,
      'layout': ComponentCategory.Layout,
      'forms': ComponentCategory.Forms,
      'data-display': ComponentCategory.DataDisplay,
      'feedback': ComponentCategory.Feedback,
      'overlay': ComponentCategory.Overlay,
      'content': ComponentCategory.Content,
      'marketing': ComponentCategory.Marketing,
      'e-commerce': ComponentCategory.ECommerce,
      'media': ComponentCategory.Media,
      'charts': ComponentCategory.Charts,
      'animation': ComponentCategory.Animation,
      'utility': ComponentCategory.Utility
    };
    
    return categoryMap[category.toLowerCase()] || ComponentCategory.Utility;
  }
  
  private mapToComponentType(type: string): ComponentType {
    const typeMap: Record<string, ComponentType> = {
      'navbar': ComponentType.Navbar,
      'sidebar': ComponentType.Sidebar,
      'breadcrumb': ComponentType.Breadcrumb,
      'tabs': ComponentType.Tabs,
      'pagination': ComponentType.Pagination,
      'grid': ComponentType.Grid,
      'container': ComponentType.Container,
      'section': ComponentType.Section,
      'hero': ComponentType.Hero,
      'footer': ComponentType.Footer,
      'input': ComponentType.Input,
      'select': ComponentType.Select,
      'checkbox': ComponentType.Checkbox,
      'radio': ComponentType.Radio,
      'switch': ComponentType.Switch,
      'slider': ComponentType.Slider,
      'datepicker': ComponentType.DatePicker,
      'fileupload': ComponentType.FileUpload,
      'table': ComponentType.Table,
      'list': ComponentType.List,
      'card': ComponentType.Card,
      'badge': ComponentType.Badge,
      'tag': ComponentType.Tag,
      'timeline': ComponentType.Timeline,
      'calendar': ComponentType.Calendar,
      'alert': ComponentType.Alert,
      'toast': ComponentType.Toast,
      'modal': ComponentType.Modal,
      'popover': ComponentType.Popover,
      'tooltip': ComponentType.Tooltip,
      'progress': ComponentType.Progress,
      'spinner': ComponentType.Spinner,
      'skeleton': ComponentType.Skeleton,
      'accordion': ComponentType.Accordion,
      'carousel': ComponentType.Carousel,
      'gallery': ComponentType.Gallery,
      'video': ComponentType.Video,
      'audio': ComponentType.Audio,
      'button': ComponentType.Button,
      'icon': ComponentType.Icon,
      'avatar': ComponentType.Avatar,
      'divider': ComponentType.Divider
    };
    
    return typeMap[type.toLowerCase()] || ComponentType.Custom;
  }
  
  private mergeAnalyses(
    aiAnalysis: Partial<AnalysisResult>,
    ruleBasedAnalysis: Partial<AnalysisResult>
  ): AnalysisResult {
    return {
      category: aiAnalysis.category || ruleBasedAnalysis.category || ComponentCategory.Utility,
      type: aiAnalysis.type || ruleBasedAnalysis.type || ComponentType.Custom,
      tags: [...new Set([...(aiAnalysis.tags || []), ...(ruleBasedAnalysis.tags || [])])],
      keywords: [...new Set([...(aiAnalysis.keywords || []), ...(ruleBasedAnalysis.keywords || [])])],
      useCases: aiAnalysis.useCases || [],
      designPatterns: [...new Set([...(aiAnalysis.designPatterns || []), ...(ruleBasedAnalysis.designPatterns || [])])],
      bestPractices: [...new Set([...(aiAnalysis.bestPractices || []), ...(ruleBasedAnalysis.bestPractices || [])])],
      similarComponents: aiAnalysis.similarComponents || []
    };
  }
  
  async findSimilarComponents(
    component: ComponentMetadata,
    allComponents: ComponentMetadata[]
  ): Promise<string[]> {
    const similar: Array<{ id: string; score: number }> = [];
    
    for (const other of allComponents) {
      if (other.id === component.id) continue;
      
      let score = 0;
      
      // Same category = high similarity
      if (other.category === component.category) score += 30;
      
      // Same type = very high similarity
      if (other.type === component.type) score += 40;
      
      // Shared tags
      const sharedTags = component.tags.filter(tag => other.tags.includes(tag));
      score += sharedTags.length * 5;
      
      // Same framework
      const sameFramework = component.frameworks.some(f1 => 
        other.frameworks.some(f2 => f1.name === f2.name)
      );
      if (sameFramework) score += 10;
      
      // Similar keywords
      const sharedKeywords = component.keywords.filter(kw => other.keywords.includes(kw));
      score += sharedKeywords.length * 2;
      
      if (score > 30) {
        similar.push({ id: other.id, score });
      }
    }
    
    // Sort by score and return top 5
    return similar
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.id);
  }
}