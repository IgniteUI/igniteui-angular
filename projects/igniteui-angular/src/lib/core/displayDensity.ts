import { InjectionToken, Input } from '@angular/core';

/**
 * Defines the posible values of the components' display density.
 */
export const enum DisplayDensity {
    comfortable = 'comfortable',
    cosy = 'cosy',
    compact = 'compact'
}

/**
 * Describes the object used to configure the DisplayDensity in Angular DI.
 */
export interface IDisplayDensity {
    displayDensity: DisplayDensity;
}

/**
 * Defines the DisplayDensity DI token.
 */
export const DisplayDensityToken = new InjectionToken<IDisplayDensity>('DisplayDensity');

/**
 * Base class containing all logic required for implementing DisplayDensity.
 */
export class DisplayDensityBase {
    protected _displayDensity: DisplayDensity | string;

    /**
     * Returns the theme of the component.
     * The default theme is `comfortable`.
     * Available options are `comfortable`, `cosy`, `compact`.
     * ```typescript
     * let componentTheme = this.component.displayDensity;
     * ```
     */
    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    /**
     * Sets the theme of the component.
     */
    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
    }

    /**
     *@hidden
     */
    protected isCosy(): boolean {
        return this._displayDensity === DisplayDensity.cosy ||
            (!this._displayDensity && this.displayDensityOptions && this.displayDensityOptions.displayDensity === DisplayDensity.cosy);
    }

    /**
     *@hidden
     */
    protected isComfortable(): boolean {
        return this._displayDensity === DisplayDensity.comfortable ||
            (!this._displayDensity && (!this.displayDensityOptions ||
             this.displayDensityOptions.displayDensity === DisplayDensity.comfortable));
    }

    /**
     *@hidden
     */
    protected isCompact(): boolean {
        return this._displayDensity === DisplayDensity.compact ||
            (!this._displayDensity && this.displayDensityOptions && this.displayDensityOptions.displayDensity === DisplayDensity.compact);
    }

    constructor(protected displayDensityOptions: IDisplayDensity) {}
}
