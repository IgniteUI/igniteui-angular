import { NAVIGATION_KEYS } from 'igniteui-angular/core';

/**
 * Horizontal navigation keys for grid columns
 * @hidden
 * @internal
 */
export const HORIZONTAL_NAV_KEYS = new Set(['arrowleft', 'left', 'arrowright', 'right', 'home', 'end']);

/**
 * Keys for expanding rows (tree-grid, hierarchical-grid, master-detail)
 * @hidden
 * @internal
 */
export const ROW_EXPAND_KEYS = new Set('right down arrowright arrowdown'.split(' '));

/**
 * Keys for collapsing rows (tree-grid, hierarchical-grid, master-detail)
 * @hidden
 * @internal
 */
export const ROW_COLLAPSE_KEYS = new Set('left up arrowleft arrowup'.split(' '));

/**
 * Keys for adding rows in editable grids
 * @hidden
 * @internal
 */
export const ROW_ADD_KEYS = new Set(['+', 'add', '≠', '±', '=']);

/**
 * All supported navigation and action keys for grid cells
 * @hidden
 * @internal
 */
export const SUPPORTED_KEYS = new Set([...Array.from(NAVIGATION_KEYS),
    ...Array.from(ROW_ADD_KEYS), 'enter', 'f2', 'escape', 'esc', 'pagedown', 'pageup']);

/**
 * Navigation keys for grid headers
 * @hidden
 * @internal
 */
export const HEADER_KEYS = new Set([...Array.from(NAVIGATION_KEYS), 'escape', 'esc', 'l',
    /** This symbol corresponds to the Alt + L combination under MAC. */
    '¬']);
