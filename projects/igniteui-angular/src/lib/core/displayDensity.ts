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
export interface IDisplayDensityOptions {
    displayDensity: DisplayDensity;
}

export interface IDensityChangedEventArgs {
    oldDensity: DisplayDensity;
    newDensity: DisplayDensity;
}

/**
 * Defines the DisplayDensity DI token.
 */
export const DisplayDensityToken = new InjectionToken<IDisplayDensityOptions>('DisplayDensity');

/**
 * Base class containing all logic required for implementing DisplayDensity.
 */
export class DisplayDensityBase implements DoCheck {
    protected _displayDensity: DisplayDensity;

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
        return this._displayDensity ||
            ((this.displayDensityOptions && this.displayDensityOptions.displayDensity) || DisplayDensity.comfortable);
    }

    /**
     * Sets the theme of the component.
     */
    public set displayDensity(val: DisplayDensity | string) {
        const currentDisplayDensity = this._displayDensity;
        this._displayDensity = val as DisplayDensity;

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

    protected oldDisplayDensityOptions: IDisplayDensityOptions = { displayDensity: DisplayDensity.comfortable };


    constructor(protected displayDensityOptions: IDisplayDensityOptions) {
        Object.assign(this.oldDisplayDensityOptions, displayDensityOptions);
    }

    public ngDoCheck() {
        if (!this._displayDensity && this.displayDensityOptions &&
                this.oldDisplayDensityOptions.displayDensity !== this.displayDensityOptions.displayDensity) {
            const densityChangedArgs: IDensityChangedEventArgs = {
                oldDensity: this.oldDisplayDensityOptions.displayDensity,
                newDensity: this.displayDensityOptions.displayDensity
            };

            this.onDensityChanged.emit(densityChangedArgs);
            this.oldDisplayDensityOptions = Object.assign(this.oldDisplayDensityOptions, this.displayDensityOptions);
        }
    }

    /**
     * Given a style class of a component/element returns the modified version of it based
     * on the current display density.
     */
    protected componentDensityClass(baseStyleClass: string): string {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return `${baseStyleClass}--${DisplayDensity.cosy}`;
            case DisplayDensity.compact:
                return `${baseStyleClass}--${DisplayDensity.compact}`;
            default:
                return baseStyleClass;
        }
    }
}
