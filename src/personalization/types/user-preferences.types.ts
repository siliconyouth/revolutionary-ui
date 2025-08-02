export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateUserPreferencesDto = Partial<Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
