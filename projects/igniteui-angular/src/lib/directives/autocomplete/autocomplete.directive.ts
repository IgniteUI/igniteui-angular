import {
    Directive, Input, Self, Optional, Inject, HostBinding, Output, EventEmitter,
    NgModule, ElementRef, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { CancelableEventArgs, CancelableBrowserEventArgs } from '../../core/utils';
import { OverlaySettings, AbsoluteScrollStrategy, IScrollStrategy, IPositionStrategy, AutoPositionStrategy } from '../../services/index';
import { IgxDropDownModule, IgxDropDownComponent, ISelectionEventArgs, IgxDropDownItemNavigationDirective } from '../../drop-down/index';
import { IgxInputGroupComponent } from '../../input-group/index';
import { IgxOverlayOutletDirective } from '../toggle/toggle.directive';

/**
 * Interface that encapsulates onItemSelection event arguments - new value and cancel selection.
 * @export
 */
export interface AutocompleteItemSelectionEventArgs extends CancelableEventArgs {
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
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective implements OnDestroy {

    constructor(@Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
                @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
                @Optional() protected group: IgxInputGroupComponent,
                protected elementRef: ElementRef,
                protected cdr: ChangeDetectorRef) {
        super(null);
    }

    private settings: OverlaySettings = {
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new AutoPositionStrategy({ target: this.parentElement }),
        excludePositionTarget: true
    };

    protected id: string;
    protected dropDownOpened$ = new Subject<boolean>();
    protected get model() {
        return this.ngModel || this.formControl;
    }

    /**
     * @hidden
     * @internal
     */
    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    get parentElement(): HTMLElement {
        return this.group ? this.group.element.nativeElement : this.nativeElement;
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

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.autocomplete')
    public autofill = 'off';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.role')
    public role = 'combobox';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded() {
        return !this.collapsed;
    }

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.aria-haspopup')
    public get hasPopUp() {
        return 'listbox';
    }

    /**
     * @hidden
     * @internal
     */
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

    /**
     * @hidden
     * @internal
     */
    @HostListener('input', ['$event'])
    onInput() {
        if (this.disabled)  {
            return;
        }
        if (this.collapsed) {
            this.open();
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    @HostListener('keydown.ArrowUp', ['$event'])
    @HostListener('keydown.Alt.ArrowUp', ['$event'])
    onArrowDown(event: Event) {
        event.preventDefault();
        this.open();
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keydown.Tab', ['$event'])
    @HostListener('keydown.Shift.Tab', [`$event`])
    onTab() {
        this.close();
    }

    /**
     * @hidden
     * @internal
     */
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

    /**
     * @hidden
     * @internal
     */
    onArrowDownKeyDown() {
        super.onArrowDownKeyDown();
    }

    /**
     * @hidden
     * @internal
     */
    onArrowUpKeyDown() {
        super.onArrowUpKeyDown();
    }

    /**
     * @hidden
     * @internal
     */
    onEndKeyDown() {
        super.onEndKeyDown();
    }

    /**
     * @hidden
     * @internal
     */
    onHomeKeyDown() {
        super.onHomeKeyDown();
    }

    /**
     * Closes autocomplete drop down
     */
    public close() {
        if (this.collapsed) {
            return;
        }
        this.target.close();
        this.dropDownOpened$.next();
    }

    /**
     * Opens autocomplete drop down
     */
    public open() {
        if (!this.collapsed) {
            return;
        }
        const settings = Object.assign({}, this.settings, this.autocompleteSettings);
        if (!settings.positionStrategy.settings.target) {
            settings.positionStrategy.settings.target = this.parentElement;
        }
        this.target.open(settings);
        this.target.width = this.parentElement.clientWidth + 'px';
        this.target.onSelection.pipe(takeUntil(this.dropDownOpened$)).subscribe(this.select);
        this.target.onOpened.pipe(first()).subscribe(this.highlightFirstItem);
        this.target.onClosing.pipe(takeUntil(this.dropDownOpened$)).subscribe(this.onDropDownClosing);
        this.target.children.changes.pipe(takeUntil(this.dropDownOpened$)).subscribe(this.highlightFirstItem);
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
        this.model ? this.model.control.setValue(newValue) : this.nativeElement.value = newValue;
        this.close();
        this.nativeElement.focus();
    }

    private highlightFirstItem = () => {
        if (this.target.focusedItem) {
            this.target.focusedItem.focused = false;
            this.target.focusedItem = null;
        }
        this.target.navigateFirst();
        this.cdr.detectChanges();
        this.reposition();
    }

    /**
     * If we have a custom strategy that is showing drop down above the input and after filtering is applied in the drop down,
     * then reposition of the drop down should be called in order to align the filtered drop down to the top of the input.
     */
    private reposition() {
        setTimeout(() => { this.target.toggleDirective.reposition(); });
    }

    private onDropDownClosing = (args: CancelableBrowserEventArgs) => {
        if (args.event && this.parentElement.contains(args.event.target as Node)) {
            args.cancel = true;
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.dropDownOpened$.complete();
    }
}

@NgModule({
    imports: [IgxDropDownModule, CommonModule],
    declarations: [IgxAutocompleteDirective],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }
