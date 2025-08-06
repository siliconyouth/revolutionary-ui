import { createLogger, Spinner, input, select, confirm, readJson, fileExists } from '@revolutionary-ui/cli-core';
import { MarketplaceClient } from './client.js';
import type { ComponentMetadata, PublishOptions } from './types.js';
import { ComponentMetadataSchema } from './types.js';
import { join } from 'path';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { createReadStream } from 'fs';
// import FormData from 'form-data'; // Would be used for multipart uploads
// import archiver from 'archiver'; // Would be used for creating archives

const logger = createLogger();

export class ComponentPublisher {
  private client: MarketplaceClient;

  constructor(client?: MarketplaceClient) {
    this.client = client || new MarketplaceClient();
  }

  async publish(componentPath: string, options: PublishOptions = {}): Promise<void> {
    const spin = new Spinner('Preparing component for publishing...');
    spin.start();

    try {
      // Load and validate component metadata
      const metadata = await this.loadMetadata(componentPath);
      
      // Validate metadata
      spin.update('Validating component metadata...');
      const validated = ComponentMetadataSchema.parse(metadata);

      // Check if component already exists
      spin.update('Checking marketplace...');
      const existing = await this.client.getComponent(validated.id);
      
      if (existing && !options.dryRun) {
        spin.stop();
        
        const shouldUpdate = await confirm(
          `Component ${validated.name} v${existing.version} already exists. Publish as v${validated.version}?`,
          true
        );
        
        if (!shouldUpdate) {
          logger.info('Publishing cancelled.');
          return;
        }
        
        spin.start();
      }

      // Create component archive
      spin.update('Creating component archive...');
      const archivePath = await this.createArchive(componentPath, validated);

      // Upload to marketplace
      if (!options.dryRun) {
        spin.update('Uploading to marketplace...');
        await this.uploadComponent(validated, archivePath, options);
      }

      spin.stop();

      if (options.dryRun) {
        logger.info(chalk.yellow('\n🔍 Dry run - no changes were made'));
        logger.info('\nComponent would be published with:');
        this.displayPublishInfo(validated);
      } else {
        logger.success(`\n✨ Successfully published ${chalk.cyan(validated.name)} v${validated.version}`);
        logger.info(`\n🌐 View at: ${chalk.blue(`https://revolutionary-ui.com/marketplace/${validated.id}`)}`);
      }

      // Cleanup
      await fs.unlink(archivePath).catch(() => {});

    } catch (error) {
      spin.stop();
      logger.error('Publishing failed:', error);
      throw error;
    }
  }

  async interactivePublish(): Promise<void> {
    logger.info(chalk.bold('\n📦 Publish Component to Marketplace\n'));

    // Get component path
    const componentPath = await input(
      'Component directory path:',
      './src/components/my-component'
    );

    if (!await fileExists(componentPath)) {
      logger.error(`Directory not found: ${componentPath}`);
      return;
    }

    // Check for existing metadata
    const metadataPath = join(componentPath, 'component.json');
    let metadata: Partial<ComponentMetadata>;

    if (await fileExists(metadataPath)) {
      metadata = await readJson(metadataPath);
      logger.info('Found existing component.json');
    } else {
      // Create metadata interactively
      metadata = await this.createMetadataInteractively();
      
      // Save metadata
      const shouldSave = await confirm('Save component.json?', true);
      if (shouldSave) {
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        logger.success('Created component.json');
      }
    }

    // Publish options
    const access = await select('Access level:', [
      { name: 'Public', value: 'public' },
      { name: 'Private', value: 'private' },
    ]);

    const tag = await input('Tag (optional):', 'latest');

    const dryRun = await confirm('Perform dry run first?', true);

    // Publish
    await this.publish(componentPath, {
      access: access as 'public' | 'private',
      tag: tag || undefined,
      dryRun,
    });

    if (dryRun) {
      const shouldPublish = await confirm('Proceed with actual publish?', true);
      if (shouldPublish) {
        await this.publish(componentPath, {
          access: access as 'public' | 'private',
          tag: tag || undefined,
          dryRun: false,
        });
      }
    }
  }

  private async loadMetadata(componentPath: string): Promise<ComponentMetadata> {
    const metadataPath = join(componentPath, 'component.json');
    
    if (!await fileExists(metadataPath)) {
      throw new Error(`No component.json found in ${componentPath}`);
    }

    const metadata = await readJson(metadataPath);
    
    // Auto-detect some fields if not provided
    if (!metadata.id) {
      metadata.id = metadata.name.toLowerCase().replace(/\s+/g, '-');
    }

    return metadata;
  }

  private async createMetadataInteractively(): Promise<Partial<ComponentMetadata>> {
    const name = await input('Component name:', 'My Component');
    const description = await input('Description:', 'A revolutionary UI component');
    const version = await input('Version:', '1.0.0');
    
    const authorName = await input('Author name:');
    const authorEmail = await input('Author email (optional):');
    
    const category = await select('Category:', [
      { name: 'Form', value: 'form' },
      { name: 'Table', value: 'table' },
      { name: 'Chart', value: 'chart' },
      { name: 'Dashboard', value: 'dashboard' },
      { name: 'Navigation', value: 'navigation' },
      { name: 'Layout', value: 'layout' },
      { name: 'Feedback', value: 'feedback' },
      { name: 'Data Display', value: 'data-display' },
      { name: 'Data Entry', value: 'data-entry' },
      { name: 'Utility', value: 'utility' },
    ]);

    const frameworks = await select('Primary framework:', [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Angular', value: 'angular' },
      { name: 'Svelte', value: 'svelte' },
      { name: 'Solid', value: 'solid' },
      { name: 'Qwik', value: 'qwik' },
    ]);

    const tags = await input('Tags (comma-separated):', 'ui, component');
    const license = await input('License:', 'MIT');
    
    const isPremium = await confirm('Is this a premium component?', false);
    let price;
    if (isPremium) {
      price = parseFloat(await input('Price (USD):', '9.99'));
    }

    return {
      name,
      description,
      version,
      author: {
        name: authorName,
        email: authorEmail || undefined,
      },
      category: category as any,
      frameworks: [frameworks as any],
      tags: tags.split(',').map(t => t.trim()),
      license,
      premium: isPremium,
      price,
    };
  }

  private async createArchive(componentPath: string, metadata: ComponentMetadata): Promise<string> {
    const archivePath = join(process.env.TMPDIR || '/tmp', `${metadata.id}-${metadata.version}.tar.gz`);
    
    // In production, would use archiver to create tar.gz
    // For now, just create a placeholder file
    await fs.writeFile(archivePath, JSON.stringify(metadata));
    
    return archivePath;
  }

  private async uploadComponent(
    metadata: ComponentMetadata,
    archivePath: string,
    options: PublishOptions
  ): Promise<void> {
    // In production, would use FormData for multipart upload
    const body = {
      metadata,
      access: options.access || 'public',
      tag: options.tag,
      otp: options.otp,
    };

    const response = await fetch(`${this.client['config'].apiUrl}/components/publish`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.client['config'].apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }
  }

  private displayPublishInfo(metadata: ComponentMetadata): void {
    const info = [
      ['Name', metadata.name],
      ['Version', metadata.version],
      ['Author', metadata.author.name],
      ['Category', metadata.category],
      ['Frameworks', metadata.frameworks.join(', ')],
      ['Tags', metadata.tags.join(', ')],
      ['License', metadata.license],
    ];

    if (metadata.premium) {
      info.push(['Type', `Premium ($${metadata.price})`]);
    }

    info.forEach(([key, value]) => {
      logger.info(`  ${chalk.gray(key + ':')} ${value}`);
    });
  }

  async unpublish(componentId: string, version?: string): Promise<void> {
    const spin = new Spinner('Unpublishing component...');
    spin.start();

    try {
      const url = version 
        ? `/components/${componentId}/unpublish/${version}`
        : `/components/${componentId}/unpublish`;

      const response = await fetch(`${this.client['config'].apiUrl}${url}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.client['config'].apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unpublish failed: ${response.statusText}`);
      }

      spin.stop();
      logger.success(`\n✨ Successfully unpublished ${componentId}${version ? ` v${version}` : ''}`);
    } catch (error) {
      spin.stop();
      logger.error('Unpublish failed:', error);
      throw error;
    }
  }
}