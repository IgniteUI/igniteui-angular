/**
 * Use the function to get a random UUID string when secure context is not guaranteed making crypto.randomUUID unavailable.
 * @returns A random UUID string.
 */
export function getUUID(): `${string}-${string}-${string}-${string}-${string}` {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Secure fallback using crypto.getRandomValues()
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant (RFC 4122)
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 1

    const a = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${a.slice(0, 8)}-${a.slice(8, 12)}-${a.slice(12, 16)}-${a.slice(16, 20)}-${a.slice(20)}`;
}
