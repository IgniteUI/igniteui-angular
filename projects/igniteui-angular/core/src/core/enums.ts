/**
 * @hidden @internal
 *
 * Enumeration representing the possible predefined size options of the grid.
 * - Small: This is the smallest size with 32px row height. Left and Right paddings are 12px. Minimal column width is 56px.
 * - Medium: This is the middle size with 40px row height. Left and Right paddings are 16px. Minimal column width is 64px.
 * - Large:  this is the default Grid size with the lowest intense and row height equal to 50px. Left and Right paddings are 24px. Minimal column width is 80px.
 */
export const Size = {
    Small: '1',
    Medium: '2',
    Large: '3'
} as const;
export type Size = (typeof Size)[keyof typeof Size];
