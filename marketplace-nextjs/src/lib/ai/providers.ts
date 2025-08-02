export const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', context: 128000 },
      { id: 'gpt-4', name: 'GPT-4', context: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: 16385 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', context: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', context: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', context: 200000 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'google',
    name: 'Google AI',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', context: 30720 },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', context: 12288 }
    ],
    requiresApiKey: true,
    supportsOAuth: true
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: 32768 },
      { id: 'llama2-70b-4096', name: 'LLaMA2 70B', context: 4096 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', context: 32000 },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', context: 32000 },
      { id: 'mistral-small-latest', name: 'Mistral Small', context: 32000 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    models: [],
    requiresApiKey: true,
    supportsOAuth: false
  }
]