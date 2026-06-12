import { Queue } from "bullmq"
import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

// Синглтон для Redis соединения в Next.js
const globalForRedis = globalThis as unknown as {
  redisConnection: IORedis | undefined
  transcriptionQueue: Queue | undefined
}

export const connection =
  globalForRedis.redisConnection ||
  new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  })

if (process.env.NODE_ENV !== "production") globalForRedis.redisConnection = connection

export const transcriptionQueue =
  globalForRedis.transcriptionQueue ||
  new Queue("transcription-queue", {
    connection: connection as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForRedis.transcriptionQueue = transcriptionQueue
