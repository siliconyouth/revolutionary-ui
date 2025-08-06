import { prisma, redis, vector, algoliaIndex, r2 } from './service-clients'
import { GetObjectCommand } from '@aws-sdk/client-s3'

// List components via Algolia (with optional vector-based semantic search)
export async function listComponents(options: {
  search?: string
  framework?: string
  category?: string
  stars?: number
  limit?: number
}) {
  const cacheKey = `catalog:${JSON.stringify(options)}`
  // Try cache
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  let hits
  if (options.search) {
    // Text search
    const res = await algoliaIndex.search(options.search, {
      filters: [`framework:${options.framework}`, `category:${options.category}`]
        .filter(Boolean)
        .join(' AND '),
      hitsPerPage: options.limit || 20,
    })
    hits = res.hits
  } else {
    // Fallback to vector search if semantic index is available
    const query = ''
    const vecRes = await vector.search({
      index: 'components',
      query,
      topK: options.limit || 20,
    })
    const ids = vecRes.matches.map(m => m.id)
    hits = await prisma.component.findMany({ where: { id: { in: ids } } })
  }

  // Cache for 1 hour
  await redis.set(cacheKey, JSON.stringify(hits), { ex: 3600 })
  return hits
}

// Get component details (from database)
export async function getComponent(id: string) {
  return prisma.component.findUnique({ where: { id } })
}

// Fetch asset (e.g. code/demo) from R2 storage
export async function fetchResourceAsset(key: string) {
  const bucket = process.env.R2_BUCKET_NAME!
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
  const res = await r2.send(cmd)
  const body = (res as any).Body
  if (!body) throw new Error('Asset not found')
  const chunks: Uint8Array[] = []
  for await (const chunk of body) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}
