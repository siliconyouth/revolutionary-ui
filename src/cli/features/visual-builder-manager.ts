import chalk from 'chalk'
import { WizardConfig } from '../core/configuration-wizard'

export class VisualBuilderManager {
  private config: WizardConfig

  constructor(config: WizardConfig) {
    this.config = config
  }

  async execute(command: string, options: any): Promise<void> {
    console.log(chalk.cyan(`Visual builder ${command} would execute here`))
  }
}