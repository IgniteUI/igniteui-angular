import { InjectionToken, Input, Output, EventEmitter, DoCheck, OnInit, Directive, NgModule, Optional, Inject } from '@angular/core';
import { IBaseEventArgs, mkenum } from './utils';

/**
 * Defines the possible values of the components' display density.
 */
export const DisplayDensity = mkenum({
    comfortable: 'comfortable',
    cosy: 'cosy',
    compact: 'compact'
});
export type DisplayDensity = (typeof DisplayDensity)[keyof typeof DisplayDensity];

/**
 * Describes the object used to configure the DisplayDensity in Angular DI.
 */
export interface IDisplayDensityOptions {
    displayDensity: DisplayDensity;
}

export interface IDensityChangedEventArgs extends IBaseEventArgs {
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
@Directive({
    selector: '[igxDisplayDensityBase]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class DisplayDensityBase implements DoCheck, OnInit {
    @Output()
    public onDensityChanged = new EventEmitter<IDensityChangedEventArgs>();

    /**
     * Returns the theme of the component.
     * The default theme is `comfortable`.
     * Available options are `comfortable`, `cosy`, `compact`.
     * ```typescript
     * let componentTheme = this.component.displayDensity;
     * ```
     */
    @Input()
    public get displayDensity(): DisplayDensity {
        return this._displayDensity ||
            ((this.displayDensityOptions && this.displayDensityOptions.displayDensity) || DisplayDensity.comfortable);
    }

    /**
     * Sets the theme of the component.
     */
    public set displayDensity(val: DisplayDensity) {
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

    /**
     * @hidden
     */
    public initialDensity: DisplayDensity;

    protected oldDisplayDensityOptions: IDisplayDensityOptions = { displayDensity: DisplayDensity.comfortable };
    protected _displayDensity: DisplayDensity;


    constructor(@Optional() @Inject(DisplayDensityToken) protected displayDensityOptions: IDisplayDensityOptions) {
        Object.assign(this.oldDisplayDensityOptions, displayDensityOptions);
    }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        this.initialDensity = this._displayDensity;
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
    protected getComponentDensityClass(baseStyleClass: string): string {
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

@NgModule({
    declarations: [
        DisplayDensityBase
    ],
    exports: [
        DisplayDensityBase
    ]
})
export class IgxDisplayDensityModule {}
