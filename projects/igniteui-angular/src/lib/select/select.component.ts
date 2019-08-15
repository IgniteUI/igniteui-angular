import { IgxInputDirective, IgxInputState } from './../directives/input/input.directive';
import {
    Component, ContentChildren, forwardRef, QueryList, ViewChild, Input, ContentChild,
    AfterContentInit, HostBinding, Directive, TemplateRef, ElementRef, ChangeDetectorRef, Optional,
    Injector, OnInit, AfterViewInit, OnDestroy, Inject

} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IgxDropDownItemBase } from '../drop-down/index';
import { IgxInputGroupComponent } from '../input-group/input-group.component';

import { IgxDropDownComponent } from './../drop-down/drop-down.component';
import { IgxSelectItemComponent } from './select-item.component';
import { SelectPositioningStrategy } from './select-positioning-strategy';

import { OverlaySettings, AbsoluteScrollStrategy } from '../services/index';
import { IGX_DROPDOWN_BASE, ISelectionEventArgs, Navigate } from '../drop-down/drop-down.common';
import { CancelableEventArgs } from '../core/utils';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxSelectBase } from './select.common';
import { EditorProvider } from '../core/edit-provider';
import { IgxSelectionAPIService } from '../core/selection';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';

/** @hidden @internal */
@Directive({
    selector: '[igxSelectToggleIcon]'
})
export class IgxSelectToggleIconDirective {
}

const noop = () => { };

/**
 * **Ignite UI for Angular Select** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select.html)
 *
 * The `igxSelect` provides an input with dropdown list allowing selection of a single item.
 *
 * Example:
 * ```html
 * <igx-select #select1 [placeholder]="'Pick One'">
 *   <label igxLabel>Select Label</label>
 *   <igx-select-item *ngFor="let item of items" [value]="item.field">
 *     {{ item.field }}
 *   </igx-select-item>
 * </igx-select>
 * ```
 */
@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxSelectComponent, multi: true },
        { provide: IGX_DROPDOWN_BASE, useExisting: IgxSelectComponent }],
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxSelectComponent extends IgxDropDownComponent implements IgxSelectBase, ControlValueAccessor,
    AfterContentInit, OnInit, AfterViewInit, OnDestroy, EditorProvider {

    private ngControl: NgControl = null;
    private _statusChanges$: Subscription;
    private _overlayDefaults: OverlaySettings;
    private _value: any;

    /** @hidden @internal do not use the drop-down container class */
    public cssClass = false;

    /** @hidden @internal */
    @ViewChild('inputGroup', { read: IgxInputGroupComponent, static: true }) public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild('input', { read: IgxInputDirective, static: true }) public input: IgxInputDirective;

    /** @hidden @internal */
    @ContentChildren(forwardRef(() => IgxSelectItemComponent), { descendants: true })
    public children: QueryList<IgxSelectItemComponent>;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxLabelDirective), { static: true }) label: IgxLabelDirective;

    /** @hidden @internal */
    public allowItemsFocus = false;

    /** @hidden @internal */
    public height: string;

    /**
     * An @Input property that gets/sets the component value.
     *
     * ```typescript
     * // get
     * let selectValue = this.select.value;
     * ```
     *
     * ```typescript
     * // set
     * this.select.value = 'London';
     * ```
     * ```html
     * <igx-select [value]="value"></igx-select>
     * ```
     */
    @Input()
    public get value(): any {
        return this._value;
    }
    public set value(v: any) {
        if (this._value === v) {
            return;
        }
        this._value = v;
        this.setSelection(this.items.find(x => x.value === this.value));
        this.cdr.detectChanges();
    }
    /**
     * An @Input property that sets input placeholder.
     *
     */
    @Input() public placeholder;


    /**
     * An @Input property that disables the `IgxSelectComponent`.
     * ```html
     * <igx-select [disabled]="'true'"></igx-select>
     * ```
     */
    @Input() public disabled = false;

    /**
     * An @Input property that sets custom OverlaySettings `IgxSelectComponent`.
     * ```html
     * <igx-select [overlaySettings] = "customOverlaySettings"></igx-select>
     * ```
     */
    @Input()
    overlaySettings: OverlaySettings;

    /** @hidden @internal */
    @HostBinding('style.maxHeight')
    public maxHeight = '256px';

    /** @hidden @internal */
    public width: string;

    /**
     * An @Input property that sets how the select will be styled.
     * The allowed values are `line`, `box` and `border`. The default is `line`.
     * ```html
     *<igx-select [type]="'box'"></igx-select>
     * ```
     */
    @Input()
    public type = 'line';

    /**
     * An @Input property that sets what display density to be used for the input group.
     * The allowed values are `compact`, `cosy` and `comfortable`. The default is `comfortable`.
     * ```html
     *<igx-select [displayDensity]="'compact'"></igx-select>
     * ```
     */
    @Input()
    public displayDensity = 'comfortable';

    /**
     * The custom template, if any, that should be used when rendering the select TOGGLE(open/close) button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.select.toggleIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-select #select>
     *      ...
     *      <ng-template igxSelectToggleIcon let-collapsed>
     *          <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
     *      </ng-template>
     *  </igx-select>
     * ```
     */
    @ContentChild(IgxSelectToggleIconDirective, { read: TemplateRef, static: false })
    public toggleIconTemplate: TemplateRef<any> = null;

    /** @hidden @internal */
    public get selectionValue() {
        const selectedItem = this.selectedItem;
        return selectedItem ? selectedItem.itemText : '';
    }

    /** @hidden @internal */
    public get selectedItem(): IgxSelectItemComponent {
        return this.selection.first_item(this.id);
    }

    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService,

        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        private _injector: Injector) {
        super(elementRef, cdr, selection, _displayDensityOptions);
    }

    /** @hidden @internal */
    private _onChangeCallback: (_: any) => void = noop;

    /** @hidden @internal */
    public writeValue = (value: any) => {
        this.value = value;
    }

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void { }

    /** @hidden @internal */
    public getEditElement(): HTMLElement {
        return this.input.nativeElement;
    }

    /** @hidden @internal */
    public selectItem(newSelection: IgxDropDownItemBase, event?) {
        const oldSelection = this.selectedItem;

        if (event) {
            this.toggleDirective.close();
        }
        if (newSelection === null || newSelection === oldSelection || newSelection.disabled || newSelection.isHeader) {
            return;
        }

        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.onSelection.emit(args);

        if (args.cancel) {
            return;
        }

        this.setSelection(newSelection);
        this._value = newSelection.value;
        this.cdr.detectChanges();
        this._onChangeCallback(this.value);
    }

    /** @hidden @internal */
    public getFirstItemElement(): HTMLElement {
        return this.children.first.element.nativeElement;
    }

    /**
     * Opens the select
     *
     * ```typescript
     * this.select.open();
     * ```
     */
    public open(overlaySettings?: OverlaySettings) {
        if (this.disabled || this.items.length === 0) {
            return;
        }
        if (!this.selectedItem) {
            this.navigateFirst();
        }

        super.open(Object.assign({}, this._overlayDefaults, this.overlaySettings, overlaySettings));
    }

    /** @hidden @internal */
    ngAfterContentInit() {
        this._overlayDefaults = {
            modal: false,
            closeOnOutsideClick: false,
            positionStrategy: new SelectPositioningStrategy(this, { target: this.inputGroup.element.nativeElement }),
            scrollStrategy: new AbsoluteScrollStrategy(),
            excludePositionTarget: true
        };
        this.children.changes.subscribe(() => {
            this.setSelection(this.items.find(x => x.value === this.value));
            this.cdr.detectChanges();
        });
        Promise.resolve().then(() => this.children.notifyOnChanges());
    }

    /** @hidden @internal */
    public onToggleOpening(event: CancelableEventArgs) {
        this.onOpening.emit(event);
        if (event.cancel) {
            return;
        }
        this.scrollToItem(this.selectedItem);
    }

    protected navigate(direction: Navigate, currentIndex?: number) {
        if (this.collapsed && this.selectedItem) {
            this.navigateItem(this.selectedItem.itemIndex);
        }
        super.navigate(direction, currentIndex);
    }

    protected manageRequiredAsterisk(): void {
        if (this.ngControl && this.ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this.ngControl.control.validator({} as AbstractControl);
            this.inputGroup.isRequired = error && error.required;
            this.cdr.markForCheck();
        }
    }
    private setSelection(item: IgxDropDownItemBase) {
        if (item && item.value !== undefined && item.value !== null) {
            this.selection.set(this.id, new Set([item]));
        } else {
            this.selection.clear(this.id);
        }
    }

    /** @hidden @internal */
    public onBlur(): void {
        if (this.ngControl && !this.ngControl.valid) {
             this.input.valid = IgxInputState.INVALID;
        } else {
            this.input.valid = IgxInputState.INITIAL;
        }
        if (!this.collapsed) {
            this.toggleDirective.close();
        }
    }

    protected onStatusChanged() {
        if ((this.ngControl.control.touched || this.ngControl.control.dirty) &&
            (this.ngControl.control.validator || this.ngControl.control.asyncValidator)) {
            if (this.inputGroup.isFocused) {
                this.input.valid = this.ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                this.input.valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        }
        this.manageRequiredAsterisk();
    }
    /**
     * @hidden @internal
     */
    public ngOnInit() {
        this.ngControl = this._injector.get(NgControl, null);
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit() {
        if (this.ngControl) {
            this._statusChanges$ = this.ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
            this.manageRequiredAsterisk();
        }
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.selection.clear(this.id);
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }
}

