-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "version" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "framework" TEXT[],
    "styling" TEXT[],
    "responsive" BOOLEAN NOT NULL DEFAULT true,
    "accessibility" BOOLEAN NOT NULL DEFAULT true,
    "thumbnail" TEXT,
    "preview" TEXT,
    "componentData" JSONB NOT NULL,
    "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "license" TEXT NOT NULL DEFAULT 'MIT',
    "documentation" TEXT,
    "demoUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "MarketplaceComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ComponentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changelog" TEXT NOT NULL,
    "componentData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "ComponentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentPurchase" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ComponentPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentFavorite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ComponentFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentDownload" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ComponentDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MarketplaceComponent_category_idx" ON "MarketplaceComponent"("category");

-- CreateIndex
CREATE INDEX "MarketplaceComponent_authorId_idx" ON "MarketplaceComponent"("authorId");

-- CreateIndex
CREATE INDEX "MarketplaceComponent_published_rating_downloads_idx" ON "MarketplaceComponent"("published", "rating", "downloads");

-- CreateIndex
CREATE INDEX "ComponentReview_componentId_idx" ON "ComponentReview"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentReview_userId_componentId_key" ON "ComponentReview"("userId", "componentId");

-- CreateIndex
CREATE INDEX "ComponentVersion_componentId_idx" ON "ComponentVersion"("componentId");

-- CreateIndex
CREATE INDEX "ComponentPurchase_userId_idx" ON "ComponentPurchase"("userId");

-- CreateIndex
CREATE INDEX "ComponentPurchase_componentId_idx" ON "ComponentPurchase"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentPurchase_userId_componentId_key" ON "ComponentPurchase"("userId", "componentId");

-- CreateIndex
CREATE INDEX "ComponentFavorite_userId_idx" ON "ComponentFavorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentFavorite_userId_componentId_key" ON "ComponentFavorite"("userId", "componentId");

-- CreateIndex
CREATE INDEX "ComponentDownload_componentId_idx" ON "ComponentDownload"("componentId");

-- CreateIndex
CREATE INDEX "ComponentDownload_createdAt_idx" ON "ComponentDownload"("createdAt");

-- AddForeignKey
ALTER TABLE "MarketplaceComponent" ADD CONSTRAINT "MarketplaceComponent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentReview" ADD CONSTRAINT "ComponentReview_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "MarketplaceComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentReview" ADD CONSTRAINT "ComponentReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentVersion" ADD CONSTRAINT "ComponentVersion_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "MarketplaceComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentPurchase" ADD CONSTRAINT "ComponentPurchase_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "MarketplaceComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentPurchase" ADD CONSTRAINT "ComponentPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentFavorite" ADD CONSTRAINT "ComponentFavorite_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "MarketplaceComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentFavorite" ADD CONSTRAINT "ComponentFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentDownload" ADD CONSTRAINT "ComponentDownload_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "MarketplaceComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentDownload" ADD CONSTRAINT "ComponentDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;