import { AIMemory, CreateAIMemoryDto, UpdateAIMemoryDto } from '../types/ai-memory.types';

export class AIMemoryService {
  async get(userId: string, key: string): Promise<AIMemory | null> {
    console.log(`Getting AI memory for user ${userId} with key ${key}`);
    return null;
  }

  async set(dto: CreateAIMemoryDto): Promise<AIMemory> {
    console.log('Setting AI memory:', dto);
    throw new Error('Method not implemented.');
  }

  async update(userId: string, key: string, dto: UpdateAIMemoryDto): Promise<AIMemory> {
    console.log(`Updating AI memory for user ${userId} with key ${key}:`, dto);
    throw new Error('Method not implemented.');
  }

  async delete(userId: string, key: string): Promise<void> {
    console.log(`Deleting AI memory for user ${userId} with key ${key}`);
    throw new Error('Method not implemented.');
  }
}
