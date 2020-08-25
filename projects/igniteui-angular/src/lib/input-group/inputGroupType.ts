import { InjectionToken } from '@angular/core';

enum IgxInputGroupEnum {
    line,
    box,
    border,
    search,
}

/**
 * Defines the InputGroupType DI token.
 */
 // Should this go trough Interface https://angular.io/api/core/InjectionToken
 export const InputGroupToken = new InjectionToken<IgxInputGroupType>('InputGroupType');

 /**
  * Determines the InputGroupType.
  */
 export type IgxInputGroupType = keyof typeof IgxInputGroupEnum;
