import { BaseCommand, type CLIContext, createLogger } from '@revolutionary-ui/cli-core';
import { ComponentPublisher } from './publish.js';
import { MarketplaceClient } from './client.js';

export class PublishCommand extends BaseCommand {
  name = 'publish';
  description = 'Publish a component to the marketplace';
  alias = ['pub'];
  
  private client: MarketplaceClient;
  private publisher: ComponentPublisher;
  
  constructor() {
    super();
    
    this.client = new MarketplaceClient();
    this.publisher = new ComponentPublisher(this.client);
    
    this.options = [
      {
        flags: '-p, --path <path>',
        description: 'Component directory path',
        defaultValue: '.',
      },
      {
        flags: '--access <level>',
        description: 'Access level (public or private)',
        defaultValue: 'public',
      },
      {
        flags: '--tag <tag>',
        description: 'Distribution tag',
        defaultValue: 'latest',
      },
      {
        flags: '--dry-run',
        description: 'Perform a dry run without publishing',
      },
      {
        flags: '--otp <code>',
        description: 'One-time password for 2FA',
      },
    ];
  }
  
  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    try {
      // Check if user is authenticated
      if (!this.client['config'].apiKey && !process.env.RUI_MARKETPLACE_TOKEN) {
        logger.error('You must be logged in to publish components.');
        logger.info('Run "rui auth login" to authenticate.');
        return;
      }
      
      if (options.path) {
        // Direct publish with path
        await this.publisher.publish(options.path, {
          access: options.access as 'public' | 'private',
          tag: options.tag,
          dryRun: options.dryRun,
          otp: options.otp,
        });
      } else {
        // Interactive publish
        await this.publisher.interactivePublish();
      }
      
    } catch (error) {
      logger.error('Publishing failed:', error);
    }
  }
}