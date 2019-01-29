//#region imports
import {
    Directive, Input, Self, Optional, Inject, HostBinding, Output, EventEmitter,
    NgModule, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { CancelableEventArgs } from '../../core/utils';
import { OverlaySettings, AbsoluteScrollStrategy, ConnectedPositioningStrategy,
    IScrollStrategy, IPositionStrategy } from '../../services/index';
import { IgxDropDownModule, IgxDropDownComponent, ISelectionEventArgs, IgxDropDownItemNavigationDirective } from '../../drop-down/index';
import { IgxInputGroupComponent } from '../../input-group/index';
import { IgxOverlayOutletDirective } from '../toggle/toggle.directive';
//#endregion

/**
 * Interface that encapsulates onItemSelection event arguments - new value and cancel selection.
 * @export
 */
export interface IAutocompleteItemSelectionEventArgs extends CancelableEventArgs {
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
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective {

    constructor(@Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
                @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
                @Optional() protected group: IgxInputGroupComponent,
                protected elementRef: ElementRef,
                protected cdr: ChangeDetectorRef) {
        super(null);
    }

    private _disabled = false;
    private settings: OverlaySettings = {
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy({ target: this.parentElement })
    };

    protected id: string;
    protected queryListNotifier$ = new Subject<boolean>();
    protected get model() {
        return this.ngModel ? this.ngModel : this.formControl;
    }

    /**
     * @hidden
     */
    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    get parentElement(): HTMLElement {
        return this.group ? this.group.element.nativeElement : this.nativeElement;
    }

    /**
     * @hidden
     */
    @Input('igxAutocomplete')
    public dropDown: IgxDropDownComponent;

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
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this.close();
    }

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
     * <input igxInput [igxAutocomplete]="townsPanel" (onItemSelected)='itemSelected()' />
     * ```
     */
    @Output()
    onItemSelected = new EventEmitter<any>();

    /**
     * @hidden
     */
    @HostBinding('attr.autocomplete')
    public autofill = 'off';

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'combobox';

    /**
     * @hidden
     */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded() {
        return !this.collapsed;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-haspopup')
    public get hasPopUp() {
        return 'listbox';
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-owns')
    public get ariaOwns() {
        return this.dropDown.id;
    }

    /**
     * @hidden
     */
    @HostListener('input', ['$event'])
    onInput() {
        if (this.disabled)  {
            return;
        }
        if (this.collapsed) {
            this.open();
        } else {
            this.unhighlightFirstItem();
        }
    }

    /**
     * @hidden
     */
    @HostListener('blur', ['$event'])
    onBlur() {
        this.close();
    }

    /**
     * @hidden
     */
    handleFocus() {}

    /**
     * @hidden
     */
    handleKeyDown(event) {
        if (!this.collapsed) {
            super.handleKeyDown(event);
        }
    }

    /**
     * Closes autocomplete drop down
     */
    public close() {
        this.dropDown.close();
        this.queryListNotifier$.complete();
    }

    /**
     * Opens autocomplete drop down
     */
    public open() {
        const settings = Object.assign({}, this.settings, this.autocompleteSettings);
        if (!settings.positionStrategy.settings.target) {
            settings.positionStrategy.settings.target = this.parentElement;
        }
        this.dropDown.open(settings);
        this.target = this.dropDown;
        this.dropDown.width = this.parentElement.clientWidth + 'px';
        this.dropDown.onSelection.subscribe(this.select);
        this.dropDown.onOpened.pipe(first()).subscribe(() => {
            this.highlightFirstItem();
        });
        this.dropDown.children.changes.pipe(takeUntil(this.queryListNotifier$)).subscribe(() => this.highlightFirstItem());
    }

    private get collapsed(): boolean {
        return this.dropDown ? this.dropDown.collapsed : true;
    }

    private select = (value: ISelectionEventArgs) => {
        if (!value.newSelection) {
            return;
        }
        value.cancel = true; // Disable selection in the drop down, because in autocomplete we do not save selection.
        const newValue = value.newSelection.value;
        const args: IAutocompleteItemSelectionEventArgs = { value: newValue, cancel: false };
        this.onItemSelected.emit(args);
        if (args.cancel) {
            return;
        }
        this.model ? this.model.control.setValue(newValue) : this.nativeElement.value = newValue;
        this.close();
    }

    private unhighlightFirstItem() {
        const firstItem = this.dropDown.items[0];
        if (firstItem) {
            firstItem.isFocused = false;
            this.dropDown.focusedItem = null;
        }
    }

    private highlightFirstItem() {
        const firstItem = this.dropDown.items[0];
        if (firstItem) {
            firstItem.isFocused = true;
            this.dropDown.focusedItem = firstItem;
        }
        this.cdr.detectChanges();
    }
}

@NgModule({
    imports: [IgxDropDownModule, CommonModule],
    declarations: [IgxAutocompleteDirective],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }
