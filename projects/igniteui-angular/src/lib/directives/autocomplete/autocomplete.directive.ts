import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Input,
    NgModule,
    OnDestroy,
    Optional,
    Output,
    Self,
    AfterViewInit
} from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CancelableEventArgs, IBaseEventArgs } from '../../core/utils';
import {
    AbsoluteScrollStrategy,
    AutoPositionStrategy,
    IPositionStrategy,
    IScrollStrategy,
    OverlaySettings
} from '../../services/public_api';
import {
    IgxDropDownComponent,
    IgxDropDownItemNavigationDirective,
    IgxDropDownModule,
    ISelectionEventArgs
} from '../../drop-down/public_api';
import { IgxInputGroupComponent } from '../../input-group/public_api';
import { IgxOverlayOutletDirective } from '../toggle/toggle.directive';

/**
 * Interface that encapsulates onItemSelection event arguments - new value and cancel selection.
 * @export
 */
export interface AutocompleteItemSelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /**
     * New value selected from the drop down
     */
    value: string;
}

export interface AutocompleteOverlaySettings {
    /** Position strategy to use with this settings */
    positionStrategy?: IPositionStrategy;
    /** Scroll strategy to use with this settings */
    scrollStrategy?: IScrollStrategy;
    /** Set the outlet container to attach the overlay to */
    outlet?: IgxOverlayOutletDirective | ElementRef;
}

/**
 * **Ignite UI for Angular Autocomplete** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/autocomplete.html)
 *
 * The igxAutocomplete directive provides a way to enhance a text input
 * by showing a drop down of suggested options, provided by the developer.
 *
 * Example:
 * ```html
 * <input type="text" [igxAutocomplete]="townsPanel" />
 * <igx-drop-down #townsPanel>
 *     <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
 *         {{town}}
 *     </igx-drop-down-item>
 * </igx-drop-down>
 * ```
 */
@Directive({
    selector: '[igxAutocomplete]'
})
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective implements AfterViewInit, OnDestroy {

    private _shouldBeOpen = false;
    constructor(@Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
        @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
        @Optional() protected group: IgxInputGroupComponent,
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef) {
        super(null);
    }
    private destroy$ = new Subject();

    private defaultSettings: OverlaySettings = {
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new AutoPositionStrategy({ target: this.parentElement }),
        excludePositionTarget: true
    };

    private _opening = false;
    private destroy$ = new Subject();
    private _lastListLength = 0;

    protected id: string;
    protected get model() {
        return this.ngModel || this.formControl;
    }

    /** @hidden @internal */
    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /** @hidden @internal */
    get parentElement(): HTMLElement {
        return this.group ? this.group.element.nativeElement : this.nativeElement;
    }

    private get settings(): OverlaySettings {
        const settings = Object.assign({}, this.defaultSettings, this.autocompleteSettings);
        if (!settings.positionStrategy.settings.target) {
            const positionStrategyClone: IPositionStrategy = settings.positionStrategy.clone();
            positionStrategyClone.settings.target = this.parentElement;
            settings.positionStrategy = positionStrategyClone;
        }
        return settings;
    }

    /**
     * Sets the target of the autocomplete directive
     *
     * ```html
     * <!-- Set -->
     * <input [igxAutocomplete]="dropdown" />
     * ...
     * <igx-drop-down #dropdown>
     * ...
     * </igx-drop-down>
     * ```
     */
    @Input('igxAutocomplete')
    public target: IgxDropDownComponent;

    /**
     * Enables/disables autocomplete component
     *
     * ```typescript
     * // get
     * let disabled = this.autocomplete.disabled;
     * ```
     * ```html
     * <!--set-->
     * <input type="text" [igxAutocomplete]="townsPanel" [igxAutocompleteDisabled]="disabled"/>
     * ```
     * ```typescript
     * // set
     * public disabled = true;
     * ```
     */
    @Input('igxAutocompleteDisabled')
    public disabled = false;

    /**
     * Provide overlay settings for the autocomplete drop down
     *
     * ```typescript
     * // get
     * let settings = this.autocomplete.autocompleteSettings;
     * ```
     * ```html
     * <!--set-->
     * <input type="text" [igxAutocomplete]="townsPanel" [igxAutocompleteSettings]="settings"/>
     * ```
     * ```typescript
     * // set
     * this.settings = {
     *  positionStrategy: new ConnectedPositioningStrategy({
     *      closeAnimation: null,
     *      openAnimation: null
     *  })
     * };
     * ```
     */
    @Input('igxAutocompleteSettings')
    autocompleteSettings: AutocompleteOverlaySettings;

    /**
     * Emitted after item from the drop down is selected
     *
     * ```html
     * <input igxInput [igxAutocomplete]="townsPanel" (onItemSelected)='itemSelected($event)' />
     * ```
     */
    @Output()
    onItemSelected = new EventEmitter<AutocompleteItemSelectionEventArgs>();

    /** @hidden @internal */
    @HostBinding('attr.autocomplete')
    public autofill = 'off';

    /** @hidden  @internal */
    @HostBinding('attr.role')
    public role = 'combobox';

    /** @hidden  @internal */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded() {
        return !this.collapsed;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-haspopup')
    public get hasPopUp() {
        return 'listbox';
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-owns')
    public get ariaOwns() {
        return this.target.listId;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-activedescendant')
    public get ariaActiveDescendant() {
        return !this.target.collapsed && this.target.focusedItem ? this.target.focusedItem.id : null;
    }

    /** @hidden  @internal */
    @HostBinding('attr.aria-autocomplete')
    public get ariaAutocomplete() {
        return 'list';
    }

    /** @hidden  @internal */
    @HostListener('input')
    onInput() {
        this.open();
    }

    /** @hidden  @internal */
    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    @HostListener('keydown.ArrowUp', ['$event'])
    @HostListener('keydown.Alt.ArrowUp', ['$event'])
    onArrowDown(event: Event) {
        event.preventDefault();
        this.open();
    }

    /** @hidden  @internal */
    @HostListener('keydown.Tab')
    @HostListener('keydown.Shift.Tab')
    onTab() {
        this.close();
    }

    /** @hidden  @internal */
    handleKeyDown(event) {
        if (!this.collapsed) {
            switch (event.key.toLowerCase()) {
                case 'space':
                case 'spacebar':
                case ' ':
                case 'home':
                case 'end':
                    return;
                default:
                    super.handleKeyDown(event);
            }
        }
    }

    /** @hidden  @internal */
    onArrowDownKeyDown() {
        super.onArrowDownKeyDown();
    }

    /** @hidden  @internal */
    onArrowUpKeyDown() {
        super.onArrowUpKeyDown();
    }

    /** @hidden  @internal */
    onEndKeyDown() {
        super.onEndKeyDown();
    }

    /** @hidden  @internal */
    onHomeKeyDown() {
        super.onHomeKeyDown();
    }

    /**
     * Closes autocomplete drop down
     */
    public close() {
        this._shouldBeOpen = false;
        if (this.collapsed) {
            return;
        }
        this.target.close();
    }

    /**
     * Opens autocomplete drop down
     */
    public open() {
        this._shouldBeOpen = true;
        if (this.disabled || !this.collapsed || this.target.children.length === 0) {
            return;
        }
        // if no drop-down width is set, the drop-down will be as wide as the autocomplete input;
        this.target.width = this.target.width || (this.parentElement.clientWidth + 'px');
        this.target.open(this.settings);
        this.highlightFirstItem();
    }

    private get collapsed(): boolean {
        return this.target ? this.target.collapsed : true;
    }

    private select = (value: ISelectionEventArgs) => {
        if (!value.newSelection) {
            return;
        }
        value.cancel = true; // Disable selection in the drop down, because in autocomplete we do not save selection.
        const newValue = value.newSelection.value;
        const args: AutocompleteItemSelectionEventArgs = { value: newValue, cancel: false };
        this.onItemSelected.emit(args);
        if (args.cancel) {
            return;
        }
        this.close();
        this.nativeElement.focus();

        // Update model after the input is re-focused, in order to have proper valid styling.
        // Otherwise when item is selected using mouse (and input is blurred), then valid style will be removed.
        this.model ? this.model.control.setValue(newValue) : this.nativeElement.value = newValue;
    }

    private highlightFirstItem = () => {
        if (this.target.focusedItem) {
            this.target.focusedItem.focused = false;
            this.target.focusedItem = null;
        }
        this.target.navigateFirst();
        this.cdr.detectChanges();
    }

    /** @hidden */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public ngAfterViewInit() {
        this.target.children.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.target.children.length) {
                if (!this.collapsed) {
                    this.highlightFirstItem();
                } else if (this._shouldBeOpen) {
                    this.open();
                }
            } else {
                this.highlightFirstItem();
                this.close();
            }
        });
        this.target.onSelection.pipe(takeUntil(this.destroy$)).subscribe(this.select);
    }
}

/** @hidden */
@NgModule({
    imports: [IgxDropDownModule, CommonModule],
    declarations: [IgxAutocompleteDirective],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }
