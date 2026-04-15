export interface AIModel {
  id: string;
  name: string;
  description: string;
  badge?: string;
  contextWindow?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  shortName: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  models: AIModel[];
  freeTierNote: string;
  tagline: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'groq-llama',
    name: 'Meta Llama',
    shortName: 'Llama',
    color: '#FF6B35',
    gradientFrom: '#FF6B35',
    gradientTo: '#FF9500',
    icon: '🦙',
    freeTierNote: 'Powered by Groq — free tier',
    tagline: "Meta's open-source powerhouse",
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        description: 'Most capable — great for complex tasks',
        badge: 'Best',
        contextWindow: '128K',
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        description: 'Ultra-fast responses',
        badge: 'Fast',
        contextWindow: '128K',
      },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    shortName: 'Mixtral',
    color: '#8B5CF6',
    gradientFrom: '#8B5CF6',
    gradientTo: '#6366F1',
    icon: '🌀',
    freeTierNote: 'Mistral API — free tier',
    tagline: 'European open-weight AI pioneer',
    models: [
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small 4',
        description: 'Fast, efficient — best for free tier',
        badge: 'Free',
        contextWindow: '128K',
      },
      {
        id: 'open-mistral-nemo',
        name: 'Mistral Nemo 12B',
        description: 'Multilingual, great reasoning',
        badge: 'Smart',
        contextWindow: '128K',
      },
    ],
  },
];

export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export function getApiBackend(providerId: string): 'groq' | 'mistral' {
  if (providerId.startsWith('groq')) return 'groq';
  if (providerId === 'mistral') return 'mistral';
  return 'groq';
}

export const SYSTEM_PROMPTS: { id: string; label: string; icon: string; prompt: string }[] = [
  {
    id: 'default',
    label: 'Helpful Assistant',
    icon: '🤖',
    prompt: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer clearly and concisely.',
  },
  {
    id: 'coder',
    label: 'Code Expert',
    icon: '💻',
    prompt:
      'You are an expert software engineer. Provide clean, well-commented code with explanations. Prefer modern best practices.',
  },
  {
    id: 'writer',
    label: 'Creative Writer',
    icon: '✍️',
    prompt:
      'You are a creative writer with a rich vocabulary. Write engagingly, with vivid imagery and natural flow.',
  },
  {
    id: 'tutor',
    label: 'Patient Tutor',
    icon: '📚',
    prompt:
      'You are a patient and encouraging tutor. Break down complex concepts into simple steps. Use analogies when helpful.',
  },
];
