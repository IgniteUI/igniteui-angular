//#region imports
import {
    Directive, Input, Self, Optional, Inject, HostBinding, Output, EventEmitter,
    NgModule, ElementRef, HostListener } from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';
import { CancelableEventArgs } from '../../core/utils';
import { OverlaySettings, AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../../services';
import { ISelectionEventArgs } from '../../drop-down';
import { IgxDropDownModule, IgxDropDownComponent } from '../../drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../drop-down/drop-down-navigation.directive';
//#endregion

/**
 * Interface that encapsulates onItemSelection event arguments - old selection, new selection and cancel selection.
 * @export
 */
export interface IAutocompleteItemSelectionEventArgs extends CancelableEventArgs {
    value: string;
}

@Directive({
    selector: '[igxAutocomplete]'
})
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective {

    constructor(@Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
                @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
                protected elementRef: ElementRef) {
        super(null);
    }

    protected id: string;
    protected get model() {
        return this.ngModel ? this.ngModel : this.formControl;
    }

    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    private get collapsed(): boolean {
        return this.target ? this.target.collapsed : true;
    }

    @Input('igxAutocomplete')
    dropDown: IgxDropDownComponent;

    @Input('igxAutocompleteDisabled')
    disabled = false;

    @Input('igxAutocompleteSettings')
    overlaySettings: OverlaySettings = {
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy({ target: this.nativeElement })
    };

    @Input('igxAutocompleteHighlightMatch')
    protected highlightMatch = false;

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
        return this.id;
    }

    @HostListener('input', ['$event'])
    onInput() {
        if (this.disabled)  {
            return;
        }
        this.open();
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

    private close() {
        this.dropDown.close();
    }

    private open() {
        if (this.collapsed) {
            this.dropDown.open(this.overlaySettings);
            this.target = this.dropDown;
            this.dropDown.width = this.nativeElement.clientWidth + 'px';
            this.dropDown.onSelection.subscribe(this.select);
            this.dropDown.onOpened.pipe(first()).subscribe(() => {
                this.target.focusedItem = this.target.items[0];
            });
        }
    }

    private select = (value: ISelectionEventArgs) => { // ?
        if (!value.newSelection) {
            return;
        }
        value.cancel = true;
        const newValue = value.newSelection.value;
        const args: IAutocompleteItemSelectionEventArgs = { value: newValue, cancel: false };
        this.onItemSelected.emit(args);
        if (args.cancel) {
            return;
        }
        this.model ? this.model.control.setValue(newValue) : this.nativeElement.value = newValue;
        this.close();
    }
}

@NgModule({
    imports: [IgxDropDownModule, CommonModule],
    declarations: [IgxAutocompleteDirective],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }



