import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { InspirationAnalysis, WebsiteAnalysis } from '../WebsiteInspirationAnalyzer';

export class InspirationReportGenerator {
  private reportDir: string;
  
  constructor() {
    this.reportDir = join(process.cwd(), 'inspiration-reports');
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }
  
  async generateReport(analysis: InspirationAnalysis): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(this.reportDir, `inspiration-report-${timestamp}.md`);
    
    const report = this.buildReport(analysis);
    writeFileSync(reportPath, report);
    
    console.log(chalk.green(`\n📄 Report saved to: ${reportPath}\n`));
    
    // Also generate HTML version
    const htmlReport = this.buildHTMLReport(analysis);
    const htmlPath = join(this.reportDir, `inspiration-report-${timestamp}.html`);
    writeFileSync(htmlPath, htmlReport);
    
    console.log(chalk.green(`🌐 HTML report saved to: ${htmlPath}\n`));
    
    return reportPath;
  }
  
  private buildReport(analysis: InspirationAnalysis): string {
    let report = `# Website Inspiration Analysis Report\n\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Executive Summary
    report += `## Executive Summary\n\n`;
    report += `Analyzed ${analysis.websites.length} websites for design inspiration.\n\n`;
    
    // Common Patterns
    report += `## Common Patterns Identified\n\n`;
    
    if (analysis.commonPatterns.frameworks.length > 0) {
      report += `### Frameworks\n`;
      analysis.commonPatterns.frameworks.forEach(framework => {
        report += `- ${framework}\n`;
      });
      report += `\n`;
    }
    
    if (analysis.commonPatterns.uiLibraries.length > 0) {
      report += `### UI Libraries\n`;
      analysis.commonPatterns.uiLibraries.forEach(lib => {
        report += `- ${lib}\n`;
      });
      report += `\n`;
    }
    
    if (analysis.commonPatterns.designPatterns.length > 0) {
      report += `### Design Patterns\n`;
      analysis.commonPatterns.designPatterns.forEach(pattern => {
        report += `- ${pattern}\n`;
      });
      report += `\n`;
    }
    
    if (analysis.commonPatterns.colorSchemes.length > 0) {
      report += `### Color Schemes\n`;
      analysis.commonPatterns.colorSchemes.forEach(color => {
        report += `- ${color}\n`;
      });
      report += `\n`;
    }
    
    // Recommendations
    if (analysis.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      analysis.recommendations.forEach((rec, i) => {
        report += `${i + 1}. ${rec}\n`;
      });
      report += `\n`;
    }
    
    // Individual Website Analysis
    report += `## Individual Website Analysis\n\n`;
    
    analysis.websites.forEach((website, index) => {
      report += `### ${index + 1}. ${website.url || website.keyword}\n\n`;
      
      // User Preferences
      report += `#### What You Liked\n`;
      report += `- **Elements**: ${website.userPreferences.likedElements.join(', ')}\n`;
      report += `- **Components to Imitate**: ${website.userPreferences.componentsToImitate.join(', ')}\n`;
      report += `- **General Appeal**: ${website.userPreferences.generalAppeal}\n\n`;
      
      // Screenshots
      if (website.screenshots) {
        report += `#### Screenshots\n`;
        if (website.screenshots.desktop) {
          report += `- Desktop: [View](${website.screenshots.desktop})\n`;
        }
        if (website.screenshots.mobile) {
          report += `- Mobile: [View](${website.screenshots.mobile})\n`;
        }
        if (website.screenshots.fullPage) {
          report += `- Full Page: [View](${website.screenshots.fullPage})\n`;
        }
        if (website.screenshots.components && website.screenshots.components.length > 0) {
          report += `- Components:\n`;
          website.screenshots.components.forEach(comp => {
            report += `  - ${comp.name}: [View](${comp.path})\n`;
          });
        }
        report += `\n`;
      }
      
      // Visual Analysis
      if (website.visualAnalysis) {
        report += `#### Visual Design Analysis\n`;
        report += `- **Layout**: ${website.visualAnalysis.layout.type} (${website.visualAnalysis.layout.grid})\n`;
        report += `- **Primary Colors**: ${website.visualAnalysis.colorScheme.primary.join(', ')}\n`;
        report += `- **Fonts**: ${website.visualAnalysis.typography.fonts.join(', ')}\n`;
        report += `- **Components Found**: ${website.visualAnalysis.components.map(c => c.name).join(', ')}\n\n`;
      }
      
      // Code Analysis
      if (website.codeAnalysis) {
        report += `#### Technical Stack\n`;
        report += `- **JavaScript Framework**: ${website.codeAnalysis.javascript.framework}\n`;
        report += `- **CSS Methodology**: ${website.codeAnalysis.css.methodology}\n`;
        report += `- **HTML Structure**: ${website.codeAnalysis.html.structure}\n\n`;
      }
      
      // Extracted Components
      if (website.extractedComponents && website.extractedComponents.length > 0) {
        report += `#### Extracted & Generated Components\n`;
        website.extractedComponents.forEach(comp => {
          report += `\n##### ${comp.name}\n`;
          
          if (comp.mergedData) {
            report += `- **Extraction Method**: Full (Playwright + Firecrawl)\n`;
            report += `- **Framework Detected**: ${comp.mergedData.metadata.framework}\n`;
            report += `- **UI Library**: ${comp.mergedData.metadata.uiLibrary || 'None detected'}\n`;
            report += `- **Accessibility Score**: ${comp.mergedData.metadata.accessibility.score}/100\n`;
            report += `- **Design Patterns**: ${comp.mergedData.metadata.patterns.join(', ')}\n`;
            report += `- **Animations**: ${comp.mergedData.animations.length} animations\n`;
            report += `- **Interactions**: ${comp.mergedData.interactions.length} interactive elements\n`;
          }
          
          if (comp.generatedComponent) {
            report += `- **Generated Framework**: ${comp.generatedComponent.framework}\n`;
            report += `- **Files Created**: ${Object.keys(comp.generatedComponent.files).filter(k => comp.generatedComponent!.files[k as keyof typeof comp.generatedComponent.files]).length} files\n`;
            report += `- **Component Structure**:\n`;
            report += `  - Props: ${comp.generatedComponent.structure.props.length}\n`;
            report += `  - State Variables: ${comp.generatedComponent.structure.state.length}\n`;
            report += `  - Event Handlers: ${comp.generatedComponent.structure.methods.length}\n`;
          }
        });
        report += `\n`;
      }
      
      // Design System
      if (website.designSystem) {
        report += `#### Design System Analysis\n`;
        report += `- **Primary Colors**: ${website.designSystem.colors.primary.slice(0, 3).join(', ')}\n`;
        report += `- **Font Families**: ${website.designSystem.typography.fontFamilies.join(', ')}\n`;
        report += `- **Spacing Scale**: ${website.designSystem.spacing.scale.length} values\n`;
        report += `- **Animations**: ${Object.keys(website.designSystem.animations.keyframes).length} keyframes\n`;
        report += `- **Breakpoints**: ${Object.keys(website.designSystem.breakpoints).join(', ')}\n\n`;
      }
      
      // Design Patterns
      if (website.designPatterns.length > 0) {
        report += `#### Design Patterns\n`;
        website.designPatterns.forEach(pattern => {
          report += `- **${pattern.pattern}**: ${pattern.usage}\n`;
        });
        report += `\n`;
      }
      
      report += `---\n\n`;
    });
    
    return report;
  }
  
  private buildHTMLReport(analysis: InspirationAnalysis): string {
    const colorDisplay = (colors: string[]) => {
      return colors.map(color => 
        `<span style="display: inline-block; width: 20px; height: 20px; background: ${color}; border: 1px solid #ccc; margin-right: 5px;"></span>`
      ).join('');
    };
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Inspiration Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1, h2, h3, h4 {
      color: #2c3e50;
    }
    .website-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .screenshots {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 10px 0;
    }
    .screenshot {
      max-width: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .color-scheme {
      display: flex;
      gap: 5px;
      margin: 10px 0;
    }
    .component-card {
      background: #f9f9f9;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin: 10px 0;
    }
    .tag {
      display: inline-block;
      background: #e0e0e0;
      padding: 4px 8px;
      border-radius: 4px;
      margin-right: 5px;
      font-size: 14px;
    }
    .recommendation {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 10px 0;
    }
    pre {
      background: #f4f4f4;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>Website Inspiration Analysis Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <section>
    <h2>Executive Summary</h2>
    <p>Analyzed ${analysis.websites.length} websites for design inspiration.</p>
  </section>
  
  ${analysis.recommendations.length > 0 ? `
  <section>
    <h2>Recommendations</h2>
    ${analysis.recommendations.map(rec => `
      <div class="recommendation">${rec}</div>
    `).join('')}
  </section>
  ` : ''}
  
  <section>
    <h2>Common Patterns</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
      ${analysis.commonPatterns.frameworks.length > 0 ? `
      <div>
        <h3>Frameworks</h3>
        ${analysis.commonPatterns.frameworks.map(f => `<span class="tag">${f}</span>`).join('')}
      </div>
      ` : ''}
      
      ${analysis.commonPatterns.uiLibraries.length > 0 ? `
      <div>
        <h3>UI Libraries</h3>
        ${analysis.commonPatterns.uiLibraries.map(lib => `<span class="tag">${lib}</span>`).join('')}
      </div>
      ` : ''}
      
      ${analysis.commonPatterns.designPatterns.length > 0 ? `
      <div>
        <h3>Design Patterns</h3>
        ${analysis.commonPatterns.designPatterns.map(p => `<span class="tag">${p}</span>`).join('')}
      </div>
      ` : ''}
    </div>
  </section>
  
  <section>
    <h2>Website Analysis</h2>
    ${analysis.websites.map((website, index) => `
      <div class="website-card">
        <h3>${index + 1}. ${website.url || website.keyword}</h3>
        
        <h4>Your Preferences</h4>
        <p><strong>Liked Elements:</strong> ${website.userPreferences.likedElements.join(', ')}</p>
        <p><strong>Components to Imitate:</strong> ${website.userPreferences.componentsToImitate.join(', ')}</p>
        <p><strong>General Appeal:</strong> ${website.userPreferences.generalAppeal}</p>
        
        ${website.screenshots ? `
        <h4>Screenshots</h4>
        <div class="screenshots">
          ${website.screenshots.desktop ? `<img src="${website.screenshots.desktop}" alt="Desktop" class="screenshot" />` : ''}
          ${website.screenshots.mobile ? `<img src="${website.screenshots.mobile}" alt="Mobile" class="screenshot" />` : ''}
        </div>
        ` : ''}
        
        ${website.visualAnalysis ? `
        <h4>Visual Design</h4>
        <p><strong>Layout:</strong> ${website.visualAnalysis.layout.type} (${website.visualAnalysis.layout.grid})</p>
        <p><strong>Color Scheme:</strong></p>
        <div class="color-scheme">${colorDisplay(website.visualAnalysis.colorScheme.primary)}</div>
        <p><strong>Typography:</strong> ${website.visualAnalysis.typography.fonts.join(', ')}</p>
        ` : ''}
        
        ${website.extractedComponents && website.extractedComponents.length > 0 ? `
        <h4>Extracted & Generated Components</h4>
        ${website.extractedComponents.map(comp => `
          <div class="component-card">
            <h5>${comp.name}</h5>
            ${comp.mergedData ? `
              <p>
                <strong>Extraction:</strong> Full Analysis | 
                <strong>Framework:</strong> ${comp.mergedData.metadata.framework} |
                <strong>UI Library:</strong> ${comp.mergedData.metadata.uiLibrary || 'None'}
              </p>
              <p>
                <strong>Accessibility:</strong> ${comp.mergedData.metadata.accessibility.score}/100 |
                <strong>Animations:</strong> ${comp.mergedData.animations.length} |
                <strong>Interactions:</strong> ${comp.mergedData.interactions.length}
              </p>
              <p><strong>Patterns:</strong> ${comp.mergedData.metadata.patterns.join(', ')}</p>
            ` : ''}
            ${comp.generatedComponent ? `
              <p style="margin-top: 10px; color: #4caf50;">
                ✅ Generated ${comp.generatedComponent.framework} component with ${Object.keys(comp.generatedComponent.files).filter(k => comp.generatedComponent!.files[k as keyof typeof comp.generatedComponent.files]).length} files
              </p>
            ` : ''}
          </div>
        `).join('')}
        ` : ''}
        
        ${website.designSystem ? `
        <h4>Design System</h4>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <p><strong>Colors:</strong></p>
          <div class="color-scheme">
            ${colorDisplay([...website.designSystem.colors.primary.slice(0, 5), ...website.designSystem.colors.secondary.slice(0, 3)])}
          </div>
          <p><strong>Typography:</strong> ${website.designSystem.typography.fontFamilies.slice(0, 3).join(', ')}</p>
          <p><strong>Spacing:</strong> ${website.designSystem.spacing.scale.length} values | <strong>Breakpoints:</strong> ${Object.keys(website.designSystem.breakpoints).length}</p>
        </div>
        ` : ''}
        
        ${website.codeAnalysis ? `
        <h4>Technical Details</h4>
        <p><strong>Framework:</strong> ${website.codeAnalysis.javascript.framework}</p>
        <p><strong>CSS:</strong> ${website.codeAnalysis.css.methodology}</p>
        ` : ''}
      </div>
    `).join('')}
  </section>
</body>
</html>`;
    
    return html;
  }
  
  private getAccessibilityScore(accessibility: any): number {
    let score = 0;
    if (accessibility.ariaLabels) score++;
    if (accessibility.semanticHTML) score++;
    if (accessibility.keyboardNav) score++;
    if (accessibility.colorContrast) score++;
    return score;
  }
}