import { ElementRef, EventEmitter, Inject, LOCALE_ID, Optional, Input, Directive, Output } from '@angular/core';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { InteractionMode } from '../core/enums';
import { IToggleView } from '../core/navigation';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs } from '../core/utils';
import { DateRange } from '../date-range-picker/public_api';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { OverlaySettings } from '../services/overlay/utilities';

@Directive()
export abstract class PickersBaseDirective extends DisplayDensityBase implements IToggleView {
    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `"'MM/dd/yyyy'"`
     *
     * @example
     * ```html
     * <igx-date-picker inputFormat="dd/MM/yy"></igx-date-picker>
     * ```
     */
    @Input()
    public inputFormat: string;

    /**
     * The format used when the editable input(s) are not focused.
     *
     * @remarks
     * Uses Angular's DatePipe.
     *
     * @example
     * ```html
     * <igx-date-picker displayFormat="EE/M/yy"></igx-date-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string;

    /**
     * Sets the `placeholder` of the picker's input.
     *
     * @example
     * ```html
     * <igx-date-picker [placeholder]="'Choose your date'"></igx-date-picker>
     * ```
     */
    @Input()
    public placeholder = '';

    /**
     * Display calendar in either `dialog` or `dropdown` mode.
     *
     * @remarks
     * Default mode is `dialog`
     *
     * @example
     * ```html
     * <igx-date-picker mode="dropdown"></igx-date-picker>
     * ```
     */
    @Input()
    public mode: InteractionMode = InteractionMode.DropDown;

    /**
     * Custom overlay settings that will be used to display the calendar.
     *
     * @example
     * ```html
     * <igx-date-picker [overlaySettings]="customOverlaySettings"></igx-date-picker>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * Enables/Disables the picker.
     *
     * @example
     * ```html
     * <igx-date-picker [disabled]="'true'"></igx-date-picker>
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * Locale settings used for value formatting and calendar.
     *
     * @remarks
     * Uses Angular's `LOCALE_ID` by default. Affects both input mask and display format if those are not set.
     * If a `locale` is set, it must be registered via `registerLocaleData`.
     * Please refer to https://angular.io/guide/i18n#i18n-pipes.
     * If it is not registered, `Intl` will be used for formatting.
     *
     * @example
     * ```html
     * <igx-date-picker locale="jp"></igx-date-picker>
     * ```
     */
    @Input()
    public locale: string;

    /**
     * The container used for the popup element.
     *
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * <!-- ... -->
     * <igx-date-picker [outlet]="outlet"></igx-date-picker>
     * <!-- ... -->
     * ```
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * Determines how the picker will be styled.
     *
     * @remarks
     * Default is `box`.
     *
     * @example
     * ```html
     * <igx-date-picker [type]="'line'"></igx-date-picker>
     * ```
     */
    @Input()
    public set type(val: IgxInputGroupType) {
        this._type = val;
    }
    public get type(): IgxInputGroupType {
        return this._type || this._inputGroupType || 'box';
    }

    /**
     * Emitted right before a selection is done, cancelable.
     *
     * @example
     * ```html
     * <igx-date-picker (selecting)="onSelecting($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public selecting = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after a selection has been done.
     *
     * @example
     * ```html
     * <igx-date-picker (selected)="onSelection($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public abstract selected = new EventEmitter<Date | DateRange>();

    /**
     * Emitted when the calendar starts opening, cancelable.
     *
     * @example
     * ```html
     * <igx-date-picker (opening)="handleOpening($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public opening = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted when the picker has opened.
     *
     * @example
     * ```html
     * <igx-date-picker (opened)="handleOpened($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public opened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted when the calendar starts closing, cancelable.
     *
     * @example
     * ```html
     * <igx-date-picker (closing)="handleClosing($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public closing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted when the picker has closed.
     *
     * @example
     * ```html
     * <igx-date-picker (closed)="handleClosed($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public closed = new EventEmitter<IBaseEventArgs>();

    protected _collapsed = true;
    protected _type: IgxInputGroupType;
    protected _minValue: Date | string;
    protected _maxValue: Date | string;

    /**
     * Gets the picker's calendar state.
     *
     * @example
     * ```typescript
     * const state = this.picker.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this._collapsed;
    }

    constructor(public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType?: IgxInputGroupType) {
        super(_displayDensityOptions || { displayDensity: 'comfortable' });
        this.locale = this.locale || this._localeId;
    }

    public abstract select(value: Date | DateRange): void;
    public abstract open(settings?: OverlaySettings): void;
    public abstract toggle(settings?: OverlaySettings): void;
    public abstract close(): void;
}
