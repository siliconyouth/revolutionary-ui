export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  isPublished: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type CreateKnowledgeBaseArticleDto = Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateKnowledgeBaseArticleDto = Partial<CreateKnowledgeBaseArticleDto>;
