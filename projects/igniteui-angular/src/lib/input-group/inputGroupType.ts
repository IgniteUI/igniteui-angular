import { InjectionToken } from '@angular/core';
import { mkenum } from '../core/utils';

const IgxInputGroupEnum = /*@__PURE__*/mkenum({
    Line: 'line',
    Box: 'box',
    Border: 'border',
    Search: 'search'
});

/**
 * Defines the InputGroupType DI token.
 */
 // Should this go trough Interface https://angular.io/api/core/InjectionToken
 export const IGX_INPUT_GROUP_TYPE = /*@__PURE__*/new InjectionToken<IgxInputGroupType>('InputGroupType');

 /**
  * Determines the InputGroupType.
  */
 export type IgxInputGroupType = (typeof IgxInputGroupEnum)[keyof typeof IgxInputGroupEnum];
