/** Normalizes free-typed color text to a 6-digit uppercase hex string, or null if invalid. */
export function normalizeHexColor(raw: string): string | null {
    let value = raw.trim();
    if (!value) return null;
    if (!value.startsWith('#')) value = '#' + value;

    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
        value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }

    return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : null;
}
