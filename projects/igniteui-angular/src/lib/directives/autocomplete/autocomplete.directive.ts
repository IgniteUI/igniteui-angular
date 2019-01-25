//#region imports
import {
    Directive, Input, Self, Optional, Inject, HostBinding, Output, EventEmitter,
    NgModule, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { CancelableEventArgs } from '../../core/utils';
import { OverlaySettings, AbsoluteScrollStrategy, ConnectedPositioningStrategy, IScrollStrategy, IPositionStrategy } from '../../services';
import { ISelectionEventArgs } from '../../drop-down';
import { IgxDropDownModule, IgxDropDownComponent } from '../../drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../drop-down/drop-down-navigation.directive';
import { IgxInputGroupComponent } from '../../input-group';
import { IgxOverlayOutletDirective } from 'igniteui-angular';
//#endregion

/**
 * Interface that encapsulates onItemSelection event arguments - old selection, new selection and cancel selection.
 * @export
 */
export interface IAutocompleteItemSelectionEventArgs extends CancelableEventArgs {
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

    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    get parentElement(): HTMLElement {
        return this.group ? this.group.element.nativeElement : this.nativeElement;
    }

    private get collapsed(): boolean {
        return this.dropDown ? this.dropDown.collapsed : true;
    }

    @Input('igxAutocomplete')
    dropDown: IgxDropDownComponent;

    @Input('igxAutocompleteDisabled')
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
        this.close();
    }

    @Input('igxAutocompleteSettings')
    autocompleteSettings: AutocompleteOverlaySettings;

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
    @HostListener('blur', ['$event'])
    onBlur() {
        this.close();
    }

    handleFocus() {}
    handleKeyDown(event) {
        if (!this.collapsed) {
            super.handleKeyDown(event);
        }
    }

    public close() {
        this.dropDown.close();
        this.queryListNotifier$.complete();
    }

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

    private select = (value: ISelectionEventArgs) => { // ?
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
