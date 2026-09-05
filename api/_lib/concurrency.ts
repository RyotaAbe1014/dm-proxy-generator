/**
 * 非同期処理の同時実行数を制限し、入力と同じ順序で結果を返します。
 * workerのエラーは呼び出し元へ伝播させ、失敗時の扱いは利用側に委ねます。
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> => {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("同時実行数は1以上の整数で指定してください。")
  }

  const results = new Array<R>(items.length)
  let nextIndex = 0

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (true) {
        const currentIndex = nextIndex
        nextIndex += 1

        if (currentIndex >= items.length) return

        results[currentIndex] = await worker(items[currentIndex])
      }
    },
  )

  await Promise.all(workers)
  return results
}
