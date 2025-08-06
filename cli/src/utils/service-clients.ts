import { PrismaClient } from '@prisma/client'
// @ts-ignore
import { Redis as UpstashRedis } from '@upstash/redis'
// @ts-ignore
import { Vector as UpstashVector } from '@upstash/vector'
// @ts-ignore
import algoliasearch from 'algoliasearch'
// @ts-ignore
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
// @ts-ignore
import dotenv from 'dotenv'

// Load env
dotenv.config({ path: '.env.local' })

// Prisma for Supabase
export const prisma = new PrismaClient()

// Upstash Redis (caching)
// @ts-ignore
// @ts-ignore
let _redis: any
try {
  // @ts-ignore
  const { Redis } = require('@upstash/redis')
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
} catch {
  _redis = null
}
export const redis = _redis

// Upstash Vector for semantic search
// @ts-ignore
// @ts-ignore
let _vector: any
try {
  // @ts-ignore
  const { Vector } = require('@upstash/vector')
  _vector = new Vector({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  })
} catch {
  _vector = null
}
export const vector = _vector

// Algolia for unified search
export const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
)
export const algoliaIndex = algolia.initIndex(process.env.ALGOLIA_APP_ID!)

// R2 storage via AWS SDK (compatible)
export const r2 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY!,
  },
})
