import { InjectionToken } from '@angular/core';

export const IgxInputGroupEnum = {
    Line: 'line',
    Box: 'box',
    Border: 'border',
    Search: 'search'
} as const;

/**
 * Defines the InputGroupType DI token.
 */
// Should this go trough Interface https://angular.io/api/core/InjectionToken
export const IGX_INPUT_GROUP_TYPE = /*@__PURE__*/new InjectionToken<IgxInputGroupType>('InputGroupType');

/**
 * Determines the InputGroupType.
 */
export type IgxInputGroupType = (typeof IgxInputGroupEnum)[keyof typeof IgxInputGroupEnum];
