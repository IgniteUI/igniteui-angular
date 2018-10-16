import { InjectionToken } from '@angular/core';

/**
 * Defines the posible values of the components' display density.
 */
export const enum DisplayDensity {
    comfortable = 'comfortable',
    cosy = 'cosy',
    compact = 'compact'
}

/**
 * Defines the DisplayDensity DI token.
 */
export const DisplayDensityToken = new InjectionToken<DisplayDensity>('DisplayDensity');

/**
 * Describes the object used to configure the DisplayDensity in Angular DI.
 */
export interface IDisplayDensity {
    displayDensity: DisplayDensity;
}
