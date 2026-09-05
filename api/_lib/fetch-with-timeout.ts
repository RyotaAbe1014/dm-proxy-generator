const DEFAULT_TIMEOUT_MS = 8_000

/**
 * 外部HTTPリクエストにタイムアウトを設定します。
 * 呼び出し元が指定したAbortSignalにも追従し、完了時にはタイマーを解放します。
 */
export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    throw new RangeError("タイムアウト時間は0以上の数値で指定してください。")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const abortFromCaller = () => controller.abort()

  if (init.signal?.aborted) {
    controller.abort()
  } else {
    init.signal?.addEventListener("abort", abortFromCaller, { once: true })
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
    init.signal?.removeEventListener("abort", abortFromCaller)
  }
}
