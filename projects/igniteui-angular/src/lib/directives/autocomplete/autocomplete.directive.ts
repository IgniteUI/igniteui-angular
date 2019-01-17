//#region imports
import {
    Directive, Input, Self, Optional, Inject, HostBinding, Output, EventEmitter,
    TemplateRef, NgModule, ComponentRef, ElementRef, HostListener } from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';
import { OverlaySettings, IgxOverlayService, AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../../services';
import { IgxDropDownModule } from '../../drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../drop-down/drop-down-navigation.directive';
import { IgxAutocompleteDropDownComponent } from './autocomplete.dropdown.component';
import { ISelectionEventArgs } from '../../drop-down';
import { IgxAutocompletePipe } from './autocomplete.pipe';
import { IAutocompleteItemSelectionEventArgs } from './autocomplete.common';
//#endregion

@Directive({
    selector: '[igxAutocomplete]'
})
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective {

    //#region constructor
    constructor(@Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
                @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
                protected elementRef: ElementRef,
                protected overlay: IgxOverlayService) {
        super(null);
    }
    //#endregion

    //#region private properties
    //#endregion

    //#region protected properties
    protected ref: ComponentRef<IgxAutocompleteDropDownComponent>;
    protected id: string;
    protected get model() {
        return this.ngModel ? this.ngModel : this.formControl;
    }
    //#endregion

    //#region @ContentChild

    //#endregion

    //#region public properties
    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    get collapsed(): boolean {
        return this.target ? this.target.collapsed : true;
    }

    //#endregion

    //#region inputs
    @Input('igxAutocomplete')
    data = [];

    @Input('igxAutocompleteDisabled')
    disabled = false;

    @Input('igxAutocompleteSettings')
    overlaySettings: OverlaySettings = {
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy({ target: this.nativeElement })
    };

    @Input('igxAutocompleteCondition')
    condition: (item: any, term: any) => boolean;

    @Input('igxAutocompleteItemTemplate')
    protected itemTemplate: TemplateRef<any>;

    @Input('igxAutocompleteHighlightMatch')
    protected highlightMatch = false;

    // @Input() width: number;
    // @Input() itemHeight: number;
    // @Input() itemsMaxHeight: number;
    //#endregion

    //#region outputs
    @Output()
    onItemSelected = new EventEmitter<any>();
    //#endregion

    //#region aria @HostBindings
    /**
     * @hidden
     */
    @HostBinding('class.igx-autocomplete')
    public cssClass = 'igx-autocomplete';
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
    //#endregion

    //#region @HostListeners
    @HostListener('input', ['$event'])
    onInput() {
        if (this.disabled)  {
            return;
        }
        if (this.collapsed) {
            this.open();
        } else {
            this.filter();
            this.highlightItem();
        }
    }
    @HostListener('blur', ['$event'])
    onBlur() {
        this.close();
    }
    //#endregion

    //#region igxDropDownItemNavigationDirective overrides
    handleFocus() {}
    handleKeyDown(event) {
        if (!this.collapsed) {
            super.handleKeyDown(event);
        }
    }
    //#endregion

    //#region public methods
    close() {
        if (!this.collapsed) {
            this.overlay.hide(this.id);
        }
    }
    //#endregion

    //#region private methods

    private open() {
        this.overlay.onOpening
            .pipe(first())
            .subscribe(event => {
                this.ref = event.componentRef as ComponentRef<IgxAutocompleteDropDownComponent>;
                this.target = this.ref.instance;
                this.target.collapsed = false;
                this.createAutocompleteDropDown(this.target as IgxAutocompleteDropDownComponent); // ?
                this.filter();
            });
        this.overlay.onOpened
            .pipe(first())
            .subscribe(() => {
                this.highlightItem();
            });
        this.overlay.onClosing
            .pipe()
            .subscribe(() => {
                this.target.collapsed = true;
            });

        this.id = this.overlay.show(IgxAutocompleteDropDownComponent, this.overlaySettings);
    }

    private filter () {
        (this.target as IgxAutocompleteDropDownComponent).term = this.nativeElement.value;
    }

    private select = (value: ISelectionEventArgs) => { // ?
        const newValue = value.newSelection.value;
        const args: IAutocompleteItemSelectionEventArgs = { value: newValue, cancel: false };
        this.onItemSelected.emit(args);
        if (args.cancel) {
            return;
        }
        this.model ? this.model.control.setValue(newValue) : this.nativeElement.value = newValue;
        this.close();
    }

    private createAutocompleteDropDown(dropdown: IgxAutocompleteDropDownComponent) { // ?
        dropdown.autocomplete = this;
        dropdown.data = this.data;
        dropdown.width = this.nativeElement.clientWidth;
        dropdown.itemTemplate = this.itemTemplate;
        dropdown.condition = this.condition;
        dropdown.onSelection.subscribe(this.select);
    }

    private highlightItem() {
        if (this.highlightMatch) {
            this.onArrowDownKeyDown();
        }
    }
    //#endregion
}

//#region module
@NgModule({
    imports: [IgxDropDownModule, CommonModule],
    declarations: [IgxAutocompleteDirective, IgxAutocompleteDropDownComponent, IgxAutocompletePipe],
    entryComponents: [IgxAutocompleteDropDownComponent],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }
//#endregion


