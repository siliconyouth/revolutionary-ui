
export interface ParallelOptions {
  concurrency?: number;
  stopOnError?: boolean;
  timeout?: number;
}

export interface ParallelResult<T> {
  results: T[];
  errors: Array<{ index: number; error: Error }>;
  duration: number;
}

/**
 * Execute multiple async operations in parallel with controlled concurrency
 */
export async function parallel<T, R>(
  items: T[],
  operation: (item: T, index: number) => Promise<R>,
  options: ParallelOptions = {}
): Promise<ParallelResult<R>> {
  const {
    concurrency = 5,
    stopOnError = false,
    timeout = 30000,
  } = options;

  const startTime = Date.now();
  const results: R[] = [];
  const errors: Array<{ index: number; error: Error }> = [];
  
  // Create a queue of work
  const queue = items.map((item, index) => ({ item, index }));
  const inProgress = new Set<Promise<void>>();
  
  while (queue.length > 0 || inProgress.size > 0) {
    // Start new operations up to concurrency limit
    while (queue.length > 0 && inProgress.size < concurrency) {
      const work = queue.shift()!;
      
      const promise = (async () => {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timeout')), timeout);
          });
          
          const result = await Promise.race([
            operation(work.item, work.index),
            timeoutPromise,
          ]);
          
          results[work.index] = result;
        } catch (error: any) {
          errors.push({ index: work.index, error });
          
          if (stopOnError) {
            // Clear the queue to stop processing
            queue.length = 0;
          }
        }
      })();
      
      inProgress.add(promise);
      
      // Remove from in-progress when done
      promise.finally(() => {
        inProgress.delete(promise);
      });
    }
    
    // Wait for at least one to complete
    if (inProgress.size > 0) {
      await Promise.race(inProgress);
    }
  }
  
  const duration = Date.now() - startTime;
  
  return {
    results,
    errors,
    duration,
  };
}

/**
 * Execute multiple async operations in batches
 */
export async function batch<T, R>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await operation(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Map over items in parallel with concurrency control
 */
export async function pMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const result = await parallel(items, mapper, { concurrency });
  
  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    throw new Error(
      `Parallel execution failed at index ${firstError.index}: ${firstError.error.message}`
    );
  }
  
  return result.results;
}

/**
 * Filter items in parallel
 */
export async function pFilter<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  concurrency = 5
): Promise<T[]> {
  const results = await pMap(
    items,
    async (item, index) => ({ item, keep: await predicate(item, index) }),
    concurrency
  );
  
  return results
    .filter(r => r.keep)
    .map(r => r.item);
}

/**
 * Find first item that matches predicate (stops after finding)
 */
export async function pFind<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  concurrency = 5
): Promise<T | undefined> {
  let found: T | undefined;
  
  await parallel(
    items,
    async (item, index) => {
      if (found) return; // Already found
      
      if (await predicate(item, index)) {
        found = item;
        throw new Error('Found'); // Stop processing
      }
    },
    { concurrency, stopOnError: true }
  );
  
  return found;
}

/**
 * Settle all promises and return results/errors
 */
export async function pSettle<T>(
  promises: Array<() => Promise<T>>
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: any }>> {
  const results = await Promise.allSettled(promises.map(p => p()));
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { status: 'fulfilled', value: result.value };
    } else {
      return { status: 'rejected', reason: result.reason };
    }
  });
}

/**
 * Retry an operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        if (onRetry) {
          onRetry(error, attempt + 1);
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Execute operations with a timeout
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeout: number,
  timeoutError = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutError)), timeout);
  });
  
  return Promise.race([operation, timeoutPromise]);
}