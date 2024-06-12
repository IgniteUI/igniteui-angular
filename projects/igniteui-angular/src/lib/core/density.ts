import {
    InjectionToken,
    Input,
    Output,
    EventEmitter,
    DoCheck,
    OnInit,
    Directive,
    Optional,
    Inject,
    ElementRef,
} from '@angular/core';
import { IBaseEventArgs, mkenum } from './utils';

/**
 * Defines the possible values of the components' display density.
 */
export const DisplayDensity = mkenum({
    comfortable: 'comfortable',
    cosy: 'cosy',
    compact: 'compact',
});
/**
 * @deprecated since version 16.1.0.
 * Please use the `--ig-size` CSS custom property.
 * @see {@link [Update Guide](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide#from-160x-to-161x)}
 */
export type DisplayDensity =
    (typeof DisplayDensity)[keyof typeof DisplayDensity];

/**
 * Describes the object used to configure the DisplayDensity in Angular DI.
 *
 * @deprecated since version 16.1.0. Please use the `--ig-size` CSS custom property.
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
 *
 * @deprecated since version 16.1.0.
 * Please use the `--ig-size` CSS custom property.
 * @see {@link [Update Guide](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide#from-160x-to-161x)}
 *
 * @hidden
 */
export const DisplayDensityToken = new InjectionToken<IDisplayDensityOptions>(
    'DisplayDensity'
);

/**
 * @hidden
 * Base class containing all logic required for implementing DisplayDensity.
 */
@Directive({
    selector: '[igxDisplayDensityBase]',
    standalone: true,
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class DisplayDensityBase implements DoCheck, OnInit {

    @Output()
    public densityChanged = new EventEmitter<IDensityChangedEventArgs>();

    /**
     * Returns the theme of the component.
     * The default theme is `comfortable`.
     * Available options are `comfortable`, `cosy`, `compact`.
     * ```typescript
     * let componentTheme = this.component.displayDensity;
     * ```
     *
     * @deprecated since version 16.1.0.
     * Please use the `--ig-size` CSS custom property.
     * @see {@link [Update Guide](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide#from-160x-to-161x)}
     */
    @Input()
    public get displayDensity(): DisplayDensity {
        return (
            this._displayDensity ??
            this.displayDensityOptions?.displayDensity ??
            DisplayDensity.comfortable
        );
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
                newDensity: this._displayDensity,
            };

            this.densityChanged.emit(densityChangedArgs);
        }
    }

    /**
     * @hidden
     */
    public initialDensity: DisplayDensity;

    protected oldDisplayDensityOptions: IDisplayDensityOptions = {
        displayDensity: DisplayDensity.comfortable,
    }

    protected _displayDensity: DisplayDensity;

    constructor(
        @Optional()
        @Inject(DisplayDensityToken)
        protected displayDensityOptions: IDisplayDensityOptions,
        protected _host: ElementRef
    ) {
        Object.assign(this.oldDisplayDensityOptions, displayDensityOptions);
    }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        const el = this._host?.nativeElement;

        if (el instanceof Element) {
            const size = globalThis.document?.defaultView
                .getComputedStyle(el)
                .getPropertyValue("--ig-size")
                .trim();

            switch (size) {
                case '1':
                    this._displayDensity = DisplayDensity.compact;
                    break;
                case '2':
                    this._displayDensity = DisplayDensity.cosy;
                    break;
                case '3':
                    this._displayDensity = DisplayDensity.comfortable;
                    break;
            }
        }

        this.initialDensity = this._displayDensity;
    }

    /** @hidden @internal **/
    public ngDoCheck() {
        if (
            !this._displayDensity &&
            this.displayDensityOptions &&
            this.oldDisplayDensityOptions.displayDensity !==
                this.displayDensityOptions.displayDensity
        ) {
            const densityChangedArgs: IDensityChangedEventArgs = {
                oldDensity: this.oldDisplayDensityOptions.displayDensity,
                newDensity: this.displayDensityOptions.displayDensity,
            };

            this.densityChanged.emit(densityChangedArgs);
            this.oldDisplayDensityOptions = Object.assign(
                this.oldDisplayDensityOptions,
                this.displayDensityOptions
            );
        }
    }

    /**
     * Given a style class of a component/element returns the modified version of it based
     * on the current display density.
     */
    protected getComponentDensityClass(baseStyleClass: string): string {
        switch (this._displayDensity || this.oldDisplayDensityOptions.displayDensity) {
            case DisplayDensity.cosy:
                return `${baseStyleClass}--${DisplayDensity.cosy}`;
            case DisplayDensity.compact:
                return `${baseStyleClass}--${DisplayDensity.compact}`;
            default:
                return baseStyleClass;
        }
    }

    /**
     * Sets the `--component-size` CSS variable based on the value of Display Density
     * @hidden @internal
     */
    public getComponentSizeStyles() {
        switch (this._displayDensity || this.oldDisplayDensityOptions.displayDensity) {
            case DisplayDensity.compact:
                return 'var(--ig-size, var(--ig-size-small))';
            case DisplayDensity.cosy:
                return 'var(--ig-size, var(--ig-size-medium))';
            case DisplayDensity.comfortable:
            default:
                return 'var(--ig-size, var(--ig-size-large))';
        }
    }
}
