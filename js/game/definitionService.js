import { requestJson } from './apiClient.js';

const WORD_CLASSES = Object.freeze({ n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', u: 'definition' });

/** Datamuse definitions are prefixed with a part-of-speech code and tab. */
export function formatDefinition(rawDefinition, answer) {
  if (typeof rawDefinition !== 'string') return null;
  const [maybePart, ...definitionParts] = rawDefinition.split('\t');
  const hasPart = definitionParts.length > 0;
  const part = hasPart ? WORD_CLASSES[maybePart] : null;
  const body = (hasPart ? definitionParts.join('\t') : maybePart).trim();
  if (!body) return null;
  // Do not accidentally reveal the answer through a self-referential definition.
  const escape = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`\\b${escape}\\b`, 'i').test(body)) return null;
  return part ? `${part[0].toUpperCase()}${part.slice(1)}: ${body}` : body;
}

/** Return a safe hint, or null when the service has none (or is unavailable). */
export async function fetchDefinition(word, {
  fetchImpl = globalThis.fetch,
  signal,
  timeoutMs = 5000,
} = {}) {
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`;
  try {
    const payload = await requestJson(url, { fetchImpl, signal, timeoutMs });
    if (!Array.isArray(payload)) return null;
    const exactMatch = payload.find((item) => typeof item?.word === 'string'
      && item.word.toLowerCase() === word.toLowerCase());
    if (!Array.isArray(exactMatch?.defs)) return null;
    for (const definition of exactMatch.defs) {
      const formatted = formatDefinition(definition, word);
      if (formatted) return formatted;
    }
    return null;
  } catch (error) {
    if (signal?.aborted) throw error;
    return null; // Missing hints never prevent gameplay.
  }
}
