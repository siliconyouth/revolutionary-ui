import inquirer from 'inquirer';
import chalk from 'chalk';

export interface PromptChoice {
  name: string;
  value: any;
  description?: string;
  disabled?: boolean | string;
}

export async function confirm(
  message: string,
  defaultValue: boolean = true
): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    },
  ]);
  return confirmed;
}

export async function input(
  message: string,
  defaultValue?: string,
  validate?: (input: string) => boolean | string | Promise<boolean | string>
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue,
      validate,
    },
  ]);
  return value;
}

export async function password(
  message: string,
  mask: string = '*'
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'password',
      name: 'value',
      message,
      mask,
    },
  ]);
  return value;
}

export async function select<T = string>(
  message: string,
  choices: PromptChoice[],
  defaultValue?: T
): Promise<T> {
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message,
      choices: choices.map((choice) => ({
        ...choice,
        name: choice.description
          ? `${choice.name} ${chalk.dim(`- ${choice.description}`)}`
          : choice.name,
      })),
      default: defaultValue,
    },
  ]);
  return selected;
}

export async function multiselect<T = string[]>(
  message: string,
  choices: PromptChoice[],
  defaultValues?: T
): Promise<T> {
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message,
      choices: choices.map((choice) => ({
        ...choice,
        name: choice.description
          ? `${choice.name} ${chalk.dim(`- ${choice.description}`)}`
          : choice.name,
        checked: defaultValues && Array.isArray(defaultValues)
          ? defaultValues.includes(choice.value)
          : false,
      })),
    },
  ]);
  return selected;
}

export async function search<T = string>(
  message: string,
  choices: PromptChoice[],
  defaultValue?: T
): Promise<T> {
  const { selected } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'selected',
      message,
      source: async (_answers: any, input: string) => {
        if (!input) return choices;
        
        const filtered = choices.filter((choice) =>
          choice.name.toLowerCase().includes(input.toLowerCase()) ||
          (choice.description && choice.description.toLowerCase().includes(input.toLowerCase()))
        );
        
        return filtered.map((choice) => ({
          ...choice,
          name: choice.description
            ? `${choice.name} ${chalk.dim(`- ${choice.description}`)}`
            : choice.name,
        }));
      },
      default: defaultValue,
    },
  ]);
  return selected;
}

export async function editor(
  message: string,
  defaultValue?: string
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'value',
      message,
      default: defaultValue,
    },
  ]);
  return value;
}

// Utility function to create a separator
export function separator(label?: string): inquirer.Separator {
  return new inquirer.Separator(label);
}

// Export the raw prompt function for custom prompts
export const prompt = inquirer.prompt.bind(inquirer);