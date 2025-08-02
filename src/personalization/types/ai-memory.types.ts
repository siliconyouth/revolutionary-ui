export interface AIMemory {
  id: string;
  userId: string;
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export type CreateAIMemoryDto = Omit<AIMemory, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAIMemoryDto = Partial<Omit<AIMemory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
