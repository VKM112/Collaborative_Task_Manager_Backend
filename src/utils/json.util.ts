const keyPattern = /([{,])\s*([A-Za-z0-9_@.\-]+)\s*:/g
const valuePattern = /:(\s*)([^,"\{\}\[\]]+)(?=\s*(,|\}|$))/g

function shouldQuoteValue(value: string) {
  const normalized = value.trim()
  if (
    normalized.length === 0 ||
    normalized === 'true' ||
    normalized === 'false' ||
    normalized === 'null' ||
    /^-?\d+(\.\d+)?$/.test(normalized)
  ) {
    return false
  }
  return !normalized.startsWith('"') && !normalized.startsWith('[') && !normalized.startsWith('{')
}

export function tryFixLooseJson(rawBody: string) {
  const trimmed = rawBody.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return null
  }

  let sanitized = trimmed.replace(keyPattern, '$1"$2":')

  sanitized = sanitized.replace(valuePattern, (_match, spacing, value) => {
    const cleaned = value.trim()
    if (!shouldQuoteValue(cleaned)) {
      return `:${spacing}${cleaned}`
    }

    const escaped = cleaned.replace(/"/g, '\\"')
    return `:${spacing}"${escaped}"`
  })

  try {
    JSON.parse(sanitized)
    return sanitized
  } catch {
    return null
  }
}
