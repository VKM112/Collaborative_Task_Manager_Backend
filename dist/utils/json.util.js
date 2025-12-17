"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryFixLooseJson = tryFixLooseJson;
const keyPattern = /([{,])\s*([A-Za-z0-9_@.\-]+)\s*:/g;
const valuePattern = /:(\s*)([^,"\{\}\[\]]+)(?=\s*(,|\}|$))/g;
function shouldQuoteValue(value) {
    const normalized = value.trim();
    if (normalized.length === 0 ||
        normalized === 'true' ||
        normalized === 'false' ||
        normalized === 'null' ||
        /^-?\d+(\.\d+)?$/.test(normalized)) {
        return false;
    }
    return !normalized.startsWith('"') && !normalized.startsWith('[') && !normalized.startsWith('{');
}
function tryFixLooseJson(rawBody) {
    const trimmed = rawBody.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        return null;
    }
    let sanitized = trimmed.replace(keyPattern, '$1"$2":');
    sanitized = sanitized.replace(valuePattern, (_match, spacing, value) => {
        const cleaned = value.trim();
        if (!shouldQuoteValue(cleaned)) {
            return `:${spacing}${cleaned}`;
        }
        const escaped = cleaned.replace(/"/g, '\\"');
        return `:${spacing}"${escaped}"`;
    });
    try {
        JSON.parse(sanitized);
        return sanitized;
    }
    catch {
        return null;
    }
}
