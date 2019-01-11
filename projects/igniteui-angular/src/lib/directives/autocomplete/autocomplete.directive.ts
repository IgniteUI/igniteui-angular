//#region imports
import { IgxDropDownItemNavigationDirective, IgxDropDownModule } from '../../drop-down/drop-down.component';
import {
    Directive, Input, Self, Optional, Inject, HostBinding, Output, EventEmitter,
    TemplateRef, NgModule, AfterViewInit, OnDestroy, ComponentRef, ElementRef, HostListener } from '@angular/core';
import { IgxDropDownBase } from '../../drop-down/drop-down.base';
import { OverlaySettings, IgxOverlayService, AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../../services';
import { NgModel, FormControlName } from '@angular/forms';
import { IgxAutocompleteDropDownComponent } from './autocomplete.dropdown.component';
import { IgxToggleModule } from '../toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';
//#endregion

@Directive({
    selector: '[igxAutocomplete]'
})
export class IgxAutocompleteDirective extends IgxDropDownItemNavigationDirective implements AfterViewInit, OnDestroy {

    //#region constructor
    constructor(@Self() @Optional() public dropdown: IgxDropDownBase,
                @Self() @Optional() @Inject(NgModel) protected ngModel: NgModel,
                @Self() @Optional() @Inject(FormControlName) protected formControl: FormControlName,
                protected elementRef: ElementRef,
                protected overlay: IgxOverlayService) {
        super(dropdown);
    }
    //#endregion

    //#region private properties
    //#endregion

    //#region protected properties
    protected ref: ComponentRef<IgxAutocompleteDropDownComponent>;
    protected id: string;
    //#endregion

    //#region public properties
    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    get visible() {
        return this.target ? this.target.collapsed : false;
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

    @Input()
    itemTemplate: TemplateRef<any>;

    @Input('igxAutocompleteCondition')
    condition: (item: any, term: any) => boolean;

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
    @HostBinding(`attr.role`)
    public role = 'combobox';

    /**
     * @hidden
     */
    @HostBinding('attr.aria-expanded')
    public get ariaExpanded() {
        return this.visible;
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
    onInput(event) {
        if (this.disabled)  {
            return;
        }
        if (!this.visible) {
            this.openPanel();
        }
    }
    //#endregion

    //#region igxDropDownItemNavigationDirective overrides
    handleFocus() {}
    handleKeyDown(event) {
        if (this.visible) {
            super.handleKeyDown(event);
        }
    }
    //#endregion

    //#region lifecycle hooks
    ngAfterViewInit() {
        this.elementRef.nativeElement.setAttribute('autocomplete', 'off');
    }

    ngOnDestroy() {
        this.elementRef.nativeElement.setAttribute('autocomplete', 'on');
    }
    //#endregion

    //#region public methods
    openPanel() {
        this.overlay.onOpening
            .pipe(first())
            .subscribe(event => {
                this.ref = event.componentRef as ComponentRef<IgxAutocompleteDropDownComponent>;
                this.target = this.ref.instance;
                // this.target.collapsed = false;
            });

        this.id = this.overlay.show(IgxAutocompleteDropDownComponent, this.overlaySettings);
        this.createAutocompleteDropDown(this.target);
    }

    closePanel() {
        if (!this.visible) {
            this.overlay.hide(this.id);
        }
    }
    //#endregion

    //#region private methods
    private createAutocompleteDropDown(ref) {
        ref.data = this.data;
        ref.width = this.nativeElement.clientWidth;
        // this.ref.changeDetectorRef.detectChanges();
    }
    //#endregion
}

//#region module
@NgModule({
    imports: [IgxDropDownModule, IgxToggleModule, CommonModule],
    declarations: [IgxAutocompleteDirective, IgxAutocompleteDropDownComponent],
    entryComponents: [IgxAutocompleteDropDownComponent],
    exports: [IgxAutocompleteDirective]
})
export class IgxAutocompleteModule { }
//#endregion

/* TODO
==================
1. DEV sample.
2. Add tests
    - Don't open on click, but on type.
    - Option for autofocus first match (false) by default
    - Hide browser autocomplete
    - Close on Esc, Select and blur (option or close by default)
    - Textbox
    - Other components - dialog
3. Filtering
4. Item template
5. Update model when item is selected - issue in angular - input text is not updated.
6. Disabled
7. Aria (autocomplete)
8. Grouping in template
9. POC and specification update
10. Comments on properties and methods
11. Readme.MD
12. Changelog
13. Demos
14. DocFX
*/
