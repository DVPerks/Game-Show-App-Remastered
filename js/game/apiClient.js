/** Perform a JSON request with a timeout and optional round-cancellation signal. */
export async function requestJson(url, {
  fetchImpl = globalThis.fetch,
  signal,
  timeoutMs = 5000,
} = {}) {
  if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');

  const controller = new AbortController();
  const cancelRequest = () => controller.abort();
  signal?.addEventListener('abort', cancelRequest, { once: true });
  const timeout = setTimeout(cancelRequest, timeoutMs);

  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`API request failed (HTTP ${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelRequest);
  }
}
