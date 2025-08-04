/**
 * Dataset Loader for UI Generation Fine-tuning
 * Loads and manages training datasets for LLM fine-tuning
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';
import { createReadStream } from 'fs';
import readline from 'readline';

export interface TrainingExample {
  prompt: string;
  completion: string;
  metadata?: {
    componentType?: string;
    framework?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    tags?: string[];
  };
}

export interface Dataset {
  name: string;
  description: string;
  examples: TrainingExample[];
  stats: {
    totalExamples: number;
    componentTypes: Record<string, number>;
    averagePromptLength: number;
    averageCompletionLength: number;
  };
}

export interface DatasetSource {
  type: 'local' | 'github' | 'huggingface' | 'url';
  path: string;
  format: 'jsonl' | 'json' | 'csv';
}

export class DatasetLoader {
  private datasets: Map<string, Dataset> = new Map();

  /**
   * Load dataset from various sources
   */
  async loadDataset(name: string, source: DatasetSource): Promise<Dataset> {
    console.log(`Loading dataset: ${name} from ${source.type}...`);
    
    let examples: TrainingExample[] = [];
    
    switch (source.type) {
      case 'local':
        examples = await this.loadLocalDataset(source.path, source.format);
        break;
      case 'github':
        examples = await this.loadGithubDataset(source.path);
        break;
      case 'huggingface':
        examples = await this.loadHuggingFaceDataset(source.path);
        break;
      case 'url':
        examples = await this.loadUrlDataset(source.path, source.format);
        break;
    }

    const dataset = this.createDataset(name, examples);
    this.datasets.set(name, dataset);
    
    return dataset;
  }

  /**
   * Load dataset from local file
   */
  private async loadLocalDataset(filePath: string, format: string): Promise<TrainingExample[]> {
    const examples: TrainingExample[] = [];
    
    if (format === 'jsonl') {
      const fileStream = createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      for await (const line of rl) {
        if (line.trim()) {
          try {
            const example = JSON.parse(line);
            examples.push(example);
          } catch (error) {
            console.warn(`Failed to parse line: ${line}`);
          }
        }
      }
    } else if (format === 'json') {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      examples.push(...(Array.isArray(data) ? data : data.examples || []));
    }
    
    return examples;
  }

  /**
   * Load dataset from GitHub repository
   */
  private async loadGithubDataset(repoPath: string): Promise<TrainingExample[]> {
    // Format: owner/repo/path/to/file
    const [owner, repo, ...pathParts] = repoPath.split('/');
    const filePath = pathParts.join('/');
    
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
    return this.loadUrlDataset(url, 'jsonl');
  }

  /**
   * Load dataset from HuggingFace
   */
  private async loadHuggingFaceDataset(datasetPath: string): Promise<TrainingExample[]> {
    // This would integrate with HuggingFace datasets API
    // For now, return placeholder
    console.log(`Loading from HuggingFace: ${datasetPath}`);
    return [];
  }

  /**
   * Load dataset from URL
   */
  private async loadUrlDataset(url: string, format: string): Promise<TrainingExample[]> {
    const response = await fetch(url);
    const text = await response.text();
    
    const examples: TrainingExample[] = [];
    
    if (format === 'jsonl') {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            examples.push(JSON.parse(line));
          } catch (error) {
            console.warn(`Failed to parse line from URL`);
          }
        }
      }
    } else if (format === 'json') {
      const data = JSON.parse(text);
      examples.push(...(Array.isArray(data) ? data : data.examples || []));
    }
    
    return examples;
  }

  /**
   * Create dataset with statistics
   */
  private createDataset(name: string, examples: TrainingExample[]): Dataset {
    const componentTypes: Record<string, number> = {};
    let totalPromptLength = 0;
    let totalCompletionLength = 0;

    for (const example of examples) {
      // Extract component type from metadata or prompt
      const componentType = example.metadata?.componentType || this.detectComponentType(example.prompt);
      componentTypes[componentType] = (componentTypes[componentType] || 0) + 1;
      
      totalPromptLength += example.prompt.length;
      totalCompletionLength += example.completion.length;
    }

    return {
      name,
      description: `UI component generation dataset with ${examples.length} examples`,
      examples,
      stats: {
        totalExamples: examples.length,
        componentTypes,
        averagePromptLength: Math.round(totalPromptLength / examples.length),
        averageCompletionLength: Math.round(totalCompletionLength / examples.length)
      }
    };
  }

  /**
   * Detect component type from prompt
   */
  private detectComponentType(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('dashboard')) return 'dashboard';
    if (lowercasePrompt.includes('form')) return 'form';
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid')) return 'table';
    if (lowercasePrompt.includes('card')) return 'card';
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog')) return 'modal';
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu')) return 'navigation';
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph')) return 'chart';
    if (lowercasePrompt.includes('pricing')) return 'pricing';
    if (lowercasePrompt.includes('testimonial')) return 'testimonial';
    if (lowercasePrompt.includes('notification')) return 'notification';
    
    return 'component';
  }

  /**
   * Get dataset by name
   */
  getDataset(name: string): Dataset | undefined {
    return this.datasets.get(name);
  }

  /**
   * Get all loaded datasets
   */
  getAllDatasets(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  /**
   * Export dataset in various formats
   */
  async exportDataset(name: string, outputPath: string, format: 'jsonl' | 'json' | 'csv'): Promise<void> {
    const dataset = this.datasets.get(name);
    if (!dataset) {
      throw new Error(`Dataset ${name} not found`);
    }

    if (format === 'jsonl') {
      const lines = dataset.examples.map(example => JSON.stringify(example));
      await fs.writeFile(outputPath, lines.join('\n'));
    } else if (format === 'json') {
      await fs.writeFile(outputPath, JSON.stringify(dataset, null, 2));
    } else if (format === 'csv') {
      // CSV export would go here
      throw new Error('CSV export not implemented yet');
    }
  }

  /**
   * Merge multiple datasets
   */
  mergeDatasets(names: string[], newName: string): Dataset {
    const allExamples: TrainingExample[] = [];
    
    for (const name of names) {
      const dataset = this.datasets.get(name);
      if (dataset) {
        allExamples.push(...dataset.examples);
      }
    }
    
    const mergedDataset = this.createDataset(newName, allExamples);
    this.datasets.set(newName, mergedDataset);
    
    return mergedDataset;
  }

  /**
   * Filter dataset by criteria
   */
  filterDataset(
    name: string,
    criteria: {
      componentTypes?: string[];
      minPromptLength?: number;
      maxPromptLength?: number;
      tags?: string[];
    },
    newName: string
  ): Dataset {
    const dataset = this.datasets.get(name);
    if (!dataset) {
      throw new Error(`Dataset ${name} not found`);
    }

    const filteredExamples = dataset.examples.filter(example => {
      if (criteria.componentTypes && example.metadata?.componentType) {
        if (!criteria.componentTypes.includes(example.metadata.componentType)) {
          return false;
        }
      }
      
      if (criteria.minPromptLength && example.prompt.length < criteria.minPromptLength) {
        return false;
      }
      
      if (criteria.maxPromptLength && example.prompt.length > criteria.maxPromptLength) {
        return false;
      }
      
      if (criteria.tags && example.metadata?.tags) {
        const hasAllTags = criteria.tags.every(tag => 
          example.metadata!.tags!.includes(tag)
        );
        if (!hasAllTags) return false;
      }
      
      return true;
    });

    const filteredDataset = this.createDataset(newName, filteredExamples);
    this.datasets.set(newName, filteredDataset);
    
    return filteredDataset;
  }

  /**
   * Get dataset statistics
   */
  getDatasetStats(name: string): Dataset['stats'] | null {
    const dataset = this.datasets.get(name);
    return dataset ? dataset.stats : null;
  }
}

// Export singleton instance
export const datasetLoader = new DatasetLoader();

// Predefined dataset sources
export const UI_DATASETS = {
  REVOLUTIONARY_UI: {
    type: 'local' as const,
    path: path.join(process.cwd(), 'datasets/ui-generation-fine-tuning.jsonl'),
    format: 'jsonl' as const
  },
  SHADCN_COMPONENTS: {
    type: 'github' as const,
    path: 'shadcn-ui/ui/datasets/components.jsonl',
    format: 'jsonl' as const
  },
  TAILWIND_TEMPLATES: {
    type: 'url' as const,
    path: 'https://example.com/tailwind-ui-dataset.jsonl',
    format: 'jsonl' as const
  }
};