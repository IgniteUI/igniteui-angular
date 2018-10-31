import { InjectionToken, Input, Output, EventEmitter, DoCheck } from '@angular/core';


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

export interface IDensityChangedEventArgs {
    oldDensity: DisplayDensity | string | IDisplayDensity;
    newDensity: DisplayDensity | string | IDisplayDensity;
}

/**
 * Defines the DisplayDensity DI token.
 */
export const DisplayDensityToken = new InjectionToken<IDisplayDensity>('DisplayDensity');

/**
 * Base class containing all logic required for implementing DisplayDensity.
 */
export class DisplayDensityBase implements DoCheck {
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
        const currentDisplayDensity = this._displayDensity;
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
        if (currentDisplayDensity !== this._displayDensity) {
            const densityChangedArgs: IDensityChangedEventArgs = {
                oldDensity: currentDisplayDensity,
                newDensity: this._displayDensity
            };
            this.onDensityChanged.emit(densityChangedArgs);
        }
    }

    @Output()
    public onDensityChanged = new EventEmitter<IDensityChangedEventArgs>();
    protected oldDisplayDensityOptions: IDisplayDensity = { displayDensity: DisplayDensity.comfortable };

    /**
     *@hidden
     */
    public isCosy(): boolean {
        return this._displayDensity === DisplayDensity.cosy ||
            (!this._displayDensity && this.displayDensityOptions && this.displayDensityOptions.displayDensity === DisplayDensity.cosy);
    }

    /**
     *@hidden
     */
    public isComfortable(): boolean {
        return this._displayDensity === DisplayDensity.comfortable ||
            (!this._displayDensity && (!this.displayDensityOptions ||
             this.displayDensityOptions.displayDensity === DisplayDensity.comfortable));
    }

    /**
     *@hidden
     */
    public isCompact(): boolean {
        return this._displayDensity === DisplayDensity.compact ||
            (!this._displayDensity && this.displayDensityOptions && this.displayDensityOptions.displayDensity === DisplayDensity.compact);
    }
    constructor(protected displayDensityOptions: IDisplayDensity) {
        Object.assign(this.oldDisplayDensityOptions, displayDensityOptions);
    }

    public ngDoCheck() {
        const densityChangedArgs: IDensityChangedEventArgs = {
            oldDensity: this.oldDisplayDensityOptions,
            newDensity: this.displayDensityOptions
        };
        if (this.oldDisplayDensityOptions && this.displayDensityOptions &&
            this.oldDisplayDensityOptions.displayDensity !== this.displayDensityOptions.displayDensity) {

            this.onDensityChanged.emit(densityChangedArgs);
            this.oldDisplayDensityOptions = Object.assign(this.oldDisplayDensityOptions, this.displayDensityOptions);
        }
    }
}
