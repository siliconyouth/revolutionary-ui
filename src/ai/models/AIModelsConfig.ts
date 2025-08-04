export interface AIModelDetails {
  id: string;
  name: string;
  description: string;
  context: number;
  capabilities: {
    coding: boolean;
    vision: boolean;
    functionCalling: boolean;
    streaming: boolean;
    json: boolean;
  };
  strengths: string[];
  bestFor: string[];
  pricing?: {
    input: number;  // per 1M tokens
    output: number; // per 1M tokens
  };
  releaseDate?: string;
  deprecated?: boolean;
}

export interface AIProviderDetails {
  id: string;
  name: string;
  description: string;
  website: string;
  models: AIModelDetails[];
  features: string[];
  requiresApiKey: boolean;
  supportsOAuth?: boolean;
  baseUrl?: string;
  headers?: Record<string, string>;
}

export const AI_MODELS_CONFIG: AIProviderDetails[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Pioneer in AI language models with GPT series, excellent for general purpose and coding',
    website: 'https://openai.com',
    features: ['Function calling', 'JSON mode', 'Vision', 'Code interpreter', 'DALL-E integration'],
    requiresApiKey: true,
    baseUrl: 'https://api.openai.com/v1',
    models: [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo (128k)',
        description: 'Latest GPT-4 with 128k context, trained on data up to Dec 2023',
        context: 128000,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Excellent code generation and debugging',
          'Strong reasoning and analysis',
          'Handles complex multi-step tasks',
          'Great at following detailed instructions'
        ],
        bestFor: [
          'Complex coding tasks',
          'Architecture design',
          'Code reviews',
          'Technical documentation',
          'API design'
        ],
        pricing: { input: 10, output: 30 },
        releaseDate: '2024-01'
      },
      {
        id: 'gpt-4-vision-preview',
        name: 'GPT-4 Vision',
        description: 'GPT-4 with vision capabilities for analyzing images, screenshots, and designs',
        context: 128000,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Analyze UI/UX designs',
          'Extract text from images',
          'Understand diagrams and charts',
          'Review visual layouts'
        ],
        bestFor: [
          'UI/UX analysis',
          'Screenshot to code conversion',
          'Design system extraction',
          'Visual debugging',
          'Accessibility reviews'
        ],
        pricing: { input: 10, output: 30 }
      },
      {
        id: 'gpt-4',
        name: 'GPT-4 (8k)',
        description: 'Original GPT-4 model with 8k context',
        context: 8192,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Highly reliable',
          'Excellent reasoning',
          'Strong coding abilities'
        ],
        bestFor: [
          'Critical tasks requiring accuracy',
          'Complex problem solving',
          'Code generation'
        ],
        pricing: { input: 30, output: 60 }
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 (32k)',
        description: 'Extended context GPT-4 for larger documents',
        context: 32768,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Large codebase analysis',
          'Extended conversations',
          'Document processing'
        ],
        bestFor: [
          'Analyzing entire codebases',
          'Long technical documents',
          'Multi-file refactoring'
        ],
        pricing: { input: 60, output: 120 }
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo (16k)',
        description: 'Fast and cost-effective model for simpler tasks',
        context: 16385,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Very fast response times',
          'Cost-effective',
          'Good for simple tasks'
        ],
        bestFor: [
          'Simple code generation',
          'Quick explanations',
          'Boilerplate code',
          'Testing and prototyping'
        ],
        pricing: { input: 0.5, output: 1.5 }
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Creator of Claude, known for safety, accuracy, and excellent coding abilities',
    website: 'https://anthropic.com',
    features: ['Constitutional AI', 'Long context', 'Code analysis', 'Vision', 'XML tags'],
    requiresApiKey: true,
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most capable Claude model, excels at complex reasoning and coding',
        context: 200000,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Exceptional at code understanding',
          'Strong architectural reasoning',
          'Excellent documentation writing',
          'Careful and thorough analysis'
        ],
        bestFor: [
          'Complex refactoring',
          'Architecture reviews',
          'Security analysis',
          'Technical writing',
          'Code optimization'
        ],
        pricing: { input: 15, output: 75 },
        releaseDate: '2024-02'
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Latest and most advanced Claude model with improved coding and vision',
        context: 200000,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Best-in-class coding abilities',
          'Superior vision understanding',
          'Excellent at following complex instructions',
          'Strong reasoning and analysis'
        ],
        bestFor: [
          'Full-stack development',
          'UI/UX implementation',
          'Complex debugging',
          'Code review and optimization',
          'Visual to code conversion'
        ],
        pricing: { input: 3, output: 15 },
        releaseDate: '2024-10'
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance and cost for most tasks',
        context: 200000,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Good balance of capability and speed',
          'Strong coding skills',
          'Reliable outputs'
        ],
        bestFor: [
          'General coding tasks',
          'Code reviews',
          'Documentation',
          'API development'
        ],
        pricing: { input: 3, output: 15 },
        releaseDate: '2024-02'
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fast and affordable for simpler tasks',
        context: 200000,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Very fast responses',
          'Cost-effective',
          'Good for simple tasks'
        ],
        bestFor: [
          'Quick code snippets',
          'Simple explanations',
          'Bulk processing',
          'Testing'
        ],
        pricing: { input: 0.25, output: 1.25 },
        releaseDate: '2024-03'
      }
    ]
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Google\'s Gemini models with strong multimodal capabilities',
    website: 'https://ai.google.dev',
    features: ['Multimodal', 'Long context', 'Code execution', 'Search integration'],
    requiresApiKey: true,
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Advanced model with 1M token context window',
        context: 1048576,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Massive context window',
          'Strong multimodal understanding',
          'Excellent at analyzing large codebases',
          'Good at following complex patterns'
        ],
        bestFor: [
          'Entire codebase analysis',
          'Large document processing',
          'Video/image analysis',
          'Cross-file refactoring'
        ],
        pricing: { input: 3.5, output: 10.5 },
        releaseDate: '2024-02'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast multimodal model optimized for speed',
        context: 1048576,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Very fast processing',
          'Cost-effective',
          'Good multimodal capabilities'
        ],
        bestFor: [
          'Quick code generation',
          'Rapid prototyping',
          'Bulk image processing',
          'Real-time applications'
        ],
        pricing: { input: 0.35, output: 0.53 },
        releaseDate: '2024-05'
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Balanced model for general tasks',
        context: 30720,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Good general performance',
          'Reliable outputs',
          'Strong reasoning'
        ],
        bestFor: [
          'General coding tasks',
          'API development',
          'Documentation'
        ],
        pricing: { input: 0.5, output: 1.5 }
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Multimodal version with image understanding',
        context: 12288,
        capabilities: {
          coding: true,
          vision: true,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Image analysis',
          'UI/UX understanding',
          'Diagram interpretation'
        ],
        bestFor: [
          'UI analysis',
          'Design to code',
          'Visual debugging'
        ],
        pricing: { input: 0.5, output: 1.5 }
      }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'European AI company with efficient open and closed models',
    website: 'https://mistral.ai',
    features: ['Function calling', 'JSON mode', 'Fine-tuning', 'Open weights models'],
    requiresApiKey: true,
    baseUrl: 'https://api.mistral.ai/v1',
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        description: 'Most capable Mistral model with strong coding abilities',
        context: 32000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Strong reasoning',
          'Good code generation',
          'Multilingual support',
          'Cost-effective'
        ],
        bestFor: [
          'Code generation',
          'Technical analysis',
          'Multi-language projects',
          'API development'
        ],
        pricing: { input: 4, output: 12 }
      },
      {
        id: 'codestral-latest',
        name: 'Codestral',
        description: 'Specialized model for code generation and completion',
        context: 32000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Optimized for code',
          'Supports 80+ languages',
          'Fast code completion',
          'Fill-in-the-middle'
        ],
        bestFor: [
          'Code completion',
          'IDE integration',
          'Code generation',
          'Multi-language support'
        ],
        pricing: { input: 1, output: 3 }
      },
      {
        id: 'mistral-medium-latest',
        name: 'Mistral Medium',
        description: 'Balanced model for general tasks',
        context: 32000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Good performance',
          'Reasonable cost',
          'Reliable outputs'
        ],
        bestFor: [
          'General coding',
          'Documentation',
          'Code review'
        ],
        pricing: { input: 2.7, output: 8.1 },
        deprecated: true
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small',
        description: 'Efficient model for simple tasks',
        context: 32000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Fast responses',
          'Low cost',
          'Good for simple tasks'
        ],
        bestFor: [
          'Simple code generation',
          'Quick explanations',
          'Bulk processing'
        ],
        pricing: { input: 1, output: 3 }
      }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with LPU technology',
    website: 'https://groq.com',
    features: ['Fastest inference', 'Low latency', 'High throughput'],
    requiresApiKey: true,
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B',
        description: 'Meta\'s latest Llama model with strong capabilities',
        context: 131072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Extremely fast inference',
          'Good coding abilities',
          'Long context',
          'Open model'
        ],
        bestFor: [
          'Real-time applications',
          'Interactive coding',
          'Rapid prototyping',
          'High-volume processing'
        ],
        pricing: { input: 0.59, output: 0.79 }
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        description: 'Smaller, faster Llama model',
        context: 131072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Ultra-fast responses',
          'Good for simple tasks',
          'Very low latency'
        ],
        bestFor: [
          'Code completion',
          'Quick fixes',
          'Simple generation',
          'Edge deployment'
        ],
        pricing: { input: 0.05, output: 0.08 }
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'MoE model with strong performance',
        context: 32768,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Fast inference',
          'Good reasoning',
          'Efficient architecture'
        ],
        bestFor: [
          'Code generation',
          'Technical tasks',
          'API responses'
        ],
        pricing: { input: 0.24, output: 0.24 }
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        description: 'Google\'s open model optimized for speed',
        context: 8192,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Very fast',
          'Good instruction following',
          'Efficient'
        ],
        bestFor: [
          'Quick tasks',
          'Simple coding',
          'Explanations'
        ],
        pricing: { input: 0.20, output: 0.20 }
      }
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Enterprise-focused AI with strong RAG capabilities',
    website: 'https://cohere.com',
    features: ['RAG optimization', 'Multilingual', 'Fine-tuning', 'Embeddings'],
    requiresApiKey: true,
    baseUrl: 'https://api.cohere.ai/v1',
    models: [
      {
        id: 'command-r-plus',
        name: 'Command R+',
        description: 'Advanced model optimized for RAG and tool use',
        context: 128000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Excellent RAG performance',
          'Strong tool use',
          'Good reasoning',
          'Multilingual'
        ],
        bestFor: [
          'Documentation search',
          'Code explanation',
          'Technical Q&A',
          'Knowledge retrieval'
        ],
        pricing: { input: 3, output: 15 }
      },
      {
        id: 'command-r',
        name: 'Command R',
        description: 'Efficient model for RAG and generation',
        context: 128000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Good RAG performance',
          'Cost-effective',
          'Fast responses'
        ],
        bestFor: [
          'Code search',
          'Documentation',
          'Simple generation'
        ],
        pricing: { input: 0.5, output: 1.5 }
      }
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'AI with built-in web search for up-to-date information',
    website: 'https://perplexity.ai',
    features: ['Web search', 'Citations', 'Real-time data', 'Source verification'],
    requiresApiKey: true,
    baseUrl: 'https://api.perplexity.ai',
    models: [
      {
        id: 'llama-3.1-sonar-large-128k-online',
        name: 'Sonar Large (Online)',
        description: 'Model with real-time web search capabilities',
        context: 127072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Real-time information',
          'Source citations',
          'Up-to-date knowledge',
          'Fact verification'
        ],
        bestFor: [
          'Latest framework docs',
          'Current best practices',
          'Package updates',
          'Technology research'
        ],
        pricing: { input: 1, output: 1 }
      },
      {
        id: 'llama-3.1-sonar-small-128k-online',
        name: 'Sonar Small (Online)',
        description: 'Faster model with web search',
        context: 127072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Fast with search',
          'Cost-effective',
          'Good for quick lookups'
        ],
        bestFor: [
          'Quick searches',
          'Simple queries',
          'Documentation lookup'
        ],
        pricing: { input: 0.2, output: 0.2 }
      }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run open-source models locally for privacy and control',
    website: 'https://ollama.ai',
    features: ['Local execution', 'Privacy', 'No API costs', 'Customizable'],
    requiresApiKey: false,
    baseUrl: 'http://localhost:11434/api',
    models: [
      {
        id: 'codellama:70b',
        name: 'Code Llama 70B',
        description: 'Meta\'s specialized coding model',
        context: 100000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Specialized for code',
          'Runs locally',
          'No API costs',
          'Privacy'
        ],
        bestFor: [
          'Offline coding',
          'Sensitive projects',
          'Code completion',
          'Local development'
        ]
      },
      {
        id: 'deepseek-coder:33b',
        name: 'DeepSeek Coder 33B',
        description: 'Strong open-source coding model',
        context: 16384,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Excellent at code',
          'Multiple languages',
          'Good reasoning'
        ],
        bestFor: [
          'Code generation',
          'Debugging',
          'Refactoring',
          'Local IDE integration'
        ]
      },
      {
        id: 'llama3.1:70b',
        name: 'Llama 3.1 70B (Local)',
        description: 'Latest Llama model running locally',
        context: 131072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'State-of-the-art open model',
          'Long context',
          'No restrictions'
        ],
        bestFor: [
          'General coding',
          'Local processing',
          'Custom fine-tuning'
        ]
      },
      {
        id: 'qwen2.5-coder:32b',
        name: 'Qwen 2.5 Coder 32B',
        description: 'Alibaba\'s coding-focused model',
        context: 32768,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Strong at coding',
          'Good reasoning',
          'Efficient'
        ],
        bestFor: [
          'Code generation',
          'Technical tasks',
          'Multi-language support'
        ]
      }
    ]
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Platform for running open-source models at scale',
    website: 'https://together.ai',
    features: ['Open models', 'Fine-tuning', 'Inference optimization', 'Custom deployments'],
    requiresApiKey: true,
    baseUrl: 'https://api.together.xyz/v1',
    models: [
      {
        id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        name: 'Llama 3.1 70B Turbo',
        description: 'Optimized Llama for fast inference',
        context: 131072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Fast inference',
          'Long context',
          'Good coding abilities'
        ],
        bestFor: [
          'Code generation',
          'Technical writing',
          'Large context tasks'
        ],
        pricing: { input: 0.88, output: 0.88 }
      },
      {
        id: 'codellama/CodeLlama-70b-Python-hf',
        name: 'CodeLlama 70B Python',
        description: 'Specialized for Python development',
        context: 100000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Python expertise',
          'Code completion',
          'Debugging'
        ],
        bestFor: [
          'Python development',
          'Data science',
          'Backend development'
        ],
        pricing: { input: 0.9, output: 0.9 }
      },
      {
        id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        name: 'Qwen 2.5 Coder 32B',
        description: 'Latest coding model from Alibaba',
        context: 32768,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Excellent at coding',
          'Multi-language support',
          'Good performance'
        ],
        bestFor: [
          'Full-stack development',
          'Code review',
          'Technical documentation'
        ],
        pricing: { input: 0.5, output: 0.5 }
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Chinese AI company with strong coding models',
    website: 'https://deepseek.com',
    features: ['Specialized coding', 'Competitive pricing', 'Long context'],
    requiresApiKey: true,
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder V2',
        description: 'Advanced coding model with strong capabilities',
        context: 128000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Excellent at coding',
          'Supports 338 languages',
          'Repository-level understanding',
          'Fill-in-the-middle'
        ],
        bestFor: [
          'Complex coding tasks',
          'Multi-file projects',
          'Code completion',
          'Technical problem solving'
        ],
        pricing: { input: 0.14, output: 0.28 }
      },
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat V2',
        description: 'General purpose model with coding abilities',
        context: 128000,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Good general capabilities',
          'Strong reasoning',
          'Cost-effective'
        ],
        bestFor: [
          'Code explanation',
          'Technical discussion',
          'Documentation'
        ],
        pricing: { input: 0.14, output: 0.28 }
      }
    ]
  },
  {
    id: 'xai',
    name: 'xAI',
    description: 'Elon Musk\'s AI company with Grok models',
    website: 'https://x.ai',
    features: ['Real-time information', 'X integration', 'Uncensored responses'],
    requiresApiKey: true,
    baseUrl: 'https://api.x.ai/v1',
    models: [
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        description: 'Advanced model with real-time knowledge',
        context: 131072,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: true,
          streaming: true,
          json: true
        },
        strengths: [
          'Real-time information',
          'Good reasoning',
          'Uncensored'
        ],
        bestFor: [
          'Current events coding',
          'Technical research',
          'Trending technologies'
        ],
        pricing: { input: 5, output: 15 }
      }
    ]
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run open-source models in the cloud',
    website: 'https://replicate.com',
    features: ['Model versioning', 'Custom deployments', 'Wide model selection', 'Pay-per-use'],
    requiresApiKey: true,
    baseUrl: 'https://api.replicate.com/v1',
    models: [
      {
        id: 'meta/llama-3-70b-instruct',
        name: 'Llama 3 70B Instruct',
        description: 'Meta\'s latest instruction-tuned model',
        context: 8192,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Strong general capabilities',
          'Good instruction following',
          'Open source'
        ],
        bestFor: [
          'General coding tasks',
          'Text generation',
          'Question answering'
        ],
        pricing: { input: 0.65, output: 2.75 }
      },
      {
        id: 'mistralai/mixtral-8x7b-instruct-v0.1',
        name: 'Mixtral 8x7B Instruct',
        description: 'MoE model with strong performance',
        context: 32768,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: true,
          json: false
        },
        strengths: [
          'Efficient MoE architecture',
          'Good reasoning',
          'Long context'
        ],
        bestFor: [
          'Code generation',
          'Technical writing',
          'Complex tasks'
        ],
        pricing: { input: 0.6, output: 2.5 }
      }
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open model hub with thousands of models',
    website: 'https://huggingface.co',
    features: ['Huge model selection', 'Community models', 'Inference API', 'Serverless'],
    requiresApiKey: true,
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: [
      {
        id: 'bigcode/starcoder2-15b-instruct-v0.1',
        name: 'StarCoder2 15B',
        description: 'Code-focused model trained on The Stack v2',
        context: 16384,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: false,
          json: false
        },
        strengths: [
          'Trained on 600+ programming languages',
          'Strong code completion',
          'Good at code explanation'
        ],
        bestFor: [
          'Code generation',
          'Code completion',
          'Multi-language support'
        ],
        pricing: { input: 0.5, output: 0.5 }
      },
      {
        id: 'microsoft/phi-2',
        name: 'Phi-2',
        description: 'Small but capable model from Microsoft',
        context: 2048,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: false,
          json: false
        },
        strengths: [
          'Very efficient',
          'Good reasoning for size',
          'Fast inference'
        ],
        bestFor: [
          'Quick tasks',
          'Edge deployment',
          'Resource-constrained environments'
        ],
        pricing: { input: 0.1, output: 0.1 }
      },
      {
        id: 'tiiuae/falcon-180B-chat',
        name: 'Falcon 180B Chat',
        description: 'Large open model with strong capabilities',
        context: 2048,
        capabilities: {
          coding: true,
          vision: false,
          functionCalling: false,
          streaming: false,
          json: false
        },
        strengths: [
          'Large scale',
          'Multilingual',
          'Good general knowledge'
        ],
        bestFor: [
          'General tasks',
          'Multilingual applications',
          'Chat applications'
        ],
        pricing: { input: 2, output: 2 }
      }
    ]
  }
];

// Helper function to get all vision-capable models
export function getVisionModels(): Array<{ provider: string; model: AIModelDetails }> {
  const visionModels: Array<{ provider: string; model: AIModelDetails }> = [];
  
  AI_MODELS_CONFIG.forEach(provider => {
    provider.models.forEach(model => {
      if (model.capabilities.vision) {
        visionModels.push({ provider: provider.name, model });
      }
    });
  });
  
  return visionModels;
}

// Helper function to get all coding-optimized models
export function getCodingModels(): Array<{ provider: string; model: AIModelDetails }> {
  const codingModels: Array<{ provider: string; model: AIModelDetails }> = [];
  
  AI_MODELS_CONFIG.forEach(provider => {
    provider.models.forEach(model => {
      if (model.capabilities.coding && 
          (model.name.toLowerCase().includes('code') || 
           model.bestFor.some(use => use.toLowerCase().includes('cod')))) {
        codingModels.push({ provider: provider.name, model });
      }
    });
  });
  
  return codingModels;
}

// Helper function to get models by context size
export function getModelsByContextSize(minContext: number = 100000): Array<{ provider: string; model: AIModelDetails }> {
  const largeContextModels: Array<{ provider: string; model: AIModelDetails }> = [];
  
  AI_MODELS_CONFIG.forEach(provider => {
    provider.models.forEach(model => {
      if (model.context >= minContext) {
        largeContextModels.push({ provider: provider.name, model });
      }
    });
  });
  
  return largeContextModels.sort((a, b) => b.model.context - a.model.context);
}

// Helper function to get budget-friendly models
export function getBudgetModels(maxInputPrice: number = 1): Array<{ provider: string; model: AIModelDetails }> {
  const budgetModels: Array<{ provider: string; model: AIModelDetails }> = [];
  
  AI_MODELS_CONFIG.forEach(provider => {
    provider.models.forEach(model => {
      if (model.pricing && model.pricing.input <= maxInputPrice) {
        budgetModels.push({ provider: provider.name, model });
      }
    });
  });
  
  return budgetModels.sort((a, b) => (a.model.pricing?.input || 0) - (b.model.pricing?.input || 0));
}

// Export provider-specific configs for easy access
export const OPENAI_MODELS = AI_MODELS_CONFIG.find(p => p.id === 'openai')?.models || [];
export const ANTHROPIC_MODELS = AI_MODELS_CONFIG.find(p => p.id === 'anthropic')?.models || [];
export const GOOGLE_MODELS = AI_MODELS_CONFIG.find(p => p.id === 'google')?.models || [];
export const LOCAL_MODELS = AI_MODELS_CONFIG.find(p => p.id === 'ollama')?.models || [];