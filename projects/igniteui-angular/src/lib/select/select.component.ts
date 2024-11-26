import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Inject,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { DOCUMENT, NgIf, NgTemplateOutlet } from '@angular/common';
import { AbstractControl, ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditorProvider } from '../core/edit-provider';
import { IgxSelectionAPIService } from '../core/selection';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs } from '../core/utils';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxDropDownItemBaseDirective } from '../drop-down/drop-down-item.base';
import { IGX_DROPDOWN_BASE, ISelectionEventArgs, Navigate } from '../drop-down/drop-down.common';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll/absolute-scroll-strategy';
import { OverlaySettings } from '../services/overlay/utilities';
import { IgxDropDownComponent } from './../drop-down/drop-down.component';
import { IgxSelectItemComponent } from './select-item.component';
import { SelectPositioningStrategy } from './select-positioning-strategy';
import { IgxSelectBase } from './select.common';
import { IgxHintDirective, IgxInputGroupType, IgxPrefixDirective, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';
import { ToggleViewCancelableEventArgs, ToggleViewEventArgs, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxOverlayService } from '../services/overlay/overlay';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';

/** @hidden @internal */
@Directive({
    selector: '[igxSelectToggleIcon]',
    standalone: true
})
export class IgxSelectToggleIconDirective {
}

/** @hidden @internal */
@Directive({
    selector: '[igxSelectHeader]',
    standalone: true
})
export class IgxSelectHeaderDirective {
}

/** @hidden @internal */
@Directive({
    selector: '[igxSelectFooter]',
    standalone: true
})
export class IgxSelectFooterDirective {
}

/**
 * **Ignite UI for Angular Select** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select)
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
        { provide: IGX_DROPDOWN_BASE, useExisting: IgxSelectComponent }
    ],
    styles: [`
        :host {
            display: block;
        }
    `],
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxSelectItemNavigationDirective, IgxSuffixDirective, NgIf, NgTemplateOutlet, IgxIconComponent, IgxToggleDirective]
})
export class IgxSelectComponent extends IgxDropDownComponent implements IgxSelectBase, ControlValueAccessor,
    AfterContentInit, OnInit, AfterViewInit, OnDestroy, EditorProvider, AfterContentChecked {

    /** @hidden @internal */
    @ViewChild('inputGroup', { read: IgxInputGroupComponent, static: true }) public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild('input', { read: IgxInputDirective, static: true }) public input: IgxInputDirective;

    /** @hidden @internal */
    @ContentChildren(forwardRef(() => IgxSelectItemComponent), { descendants: true })
    public override children: QueryList<IgxSelectItemComponent>;

    @ContentChildren(IgxPrefixDirective, { descendants: true })
    protected prefixes: QueryList<IgxPrefixDirective>;

    @ContentChildren(IgxSuffixDirective, { descendants: true })
    protected suffixes: QueryList<IgxSuffixDirective>;

    /** @hidden @internal */
    @ContentChild(forwardRef(() => IgxLabelDirective), { static: true }) public label: IgxLabelDirective;

    /**
     * Sets input placeholder.
     *
     */
    @Input() public placeholder;


    /**
     * Disables the component.
     * ```html
     * <igx-select [disabled]="'true'"></igx-select>
     * ```
     */
    @Input({ transform: booleanAttribute }) public disabled = false;

    /**
     * Sets custom OverlaySettings `IgxSelectComponent`.
     * ```html
     * <igx-select [overlaySettings] = "customOverlaySettings"></igx-select>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /** @hidden @internal */
    @HostBinding('style.maxHeight')
    public override maxHeight = '256px';

    /**
     * Emitted before the dropdown is opened
     *
     * ```html
     * <igx-select opening='handleOpening($event)'></igx-select>
     * ```
     */
    @Output()
    public override opening = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is opened
     *
     * ```html
     * <igx-select (opened)='handleOpened($event)'></igx-select>
     * ```
     */
    @Output()
    public override opened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted before the dropdown is closed
     *
     * ```html
     * <igx-select (closing)='handleClosing($event)'></igx-select>
     * ```
     */
    @Output()
    public override closing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted after the dropdown is closed
     *
     * ```html
     * <igx-select (closed)='handleClosed($event)'></igx-select>
     * ```
     */
    @Output()
    public override closed = new EventEmitter<IBaseEventArgs>();

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
    @ContentChild(IgxSelectToggleIconDirective, { read: TemplateRef })
    public toggleIconTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the HEADER for the select items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.select.headerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-select #select>
     *      ...
     *      <ng-template igxSelectHeader>
     *          <div class="select__header">
     *              This is a custom header
     *          </div>
     *      </ng-template>
     *  </igx-select>
     * ```
     */
    @ContentChild(IgxSelectHeaderDirective, { read: TemplateRef, static: false })
    public headerTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering the FOOTER for the select items list
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.select.footerTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-select #select>
     *      ...
     *      <ng-template igxSelectFooter>
     *          <div class="select__footer">
     *              This is a custom footer
     *          </div>
     *      </ng-template>
     *  </igx-select>
     * ```
     */
    @ContentChild(IgxSelectFooterDirective, { read: TemplateRef, static: false })
    public footerTemplate: TemplateRef<any> = null;

    @ContentChild(IgxHintDirective, { read: ElementRef }) private hintElement: ElementRef;

    /** @hidden @internal */
    public override width: string;

    /** @hidden @internal do not use the drop-down container class */
    public override cssClass = false;

    /** @hidden @internal */
    public override allowItemsFocus = false;

    /** @hidden @internal */
    public override height: string;

    private ngControl: NgControl = null;
    private _overlayDefaults: OverlaySettings;
    private _value: any;
    private _type = null;

    /**
     * Gets/Sets the component value.
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
    }

    /**
     * Sets how the select will be styled.
     * The allowed values are `line`, `box` and `border`. The input-group default is `line`.
     * ```html
     * <igx-select [type]="'box'"></igx-select>
     * ```
     */
    @Input()
    public get type(): IgxInputGroupType {
        return this._type || this._inputGroupType || 'line';
    }

    public set type(val: IgxInputGroupType) {
        this._type = val;
    }

    /** @hidden @internal */
    public get selectionValue() {
        const selectedItem = this.selectedItem;
        return selectedItem ? selectedItem.itemText : '';
    }

    /** @hidden @internal */
    public override get selectedItem(): IgxSelectItemComponent {
        return this.selection.first_item(this.id);
    }

    private _onChangeCallback: (_: any) => void = noop;
    private _onTouchedCallback: () => void = noop;

    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        @Inject(DOCUMENT) document: any,
        selection: IgxSelectionAPIService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) private _inputGroupType: IgxInputGroupType,
        private _injector: Injector,
    ) {
        super(elementRef, cdr, document, selection);
    }

    //#region ControlValueAccessor

    /** @hidden @internal */
    public writeValue = (value: any) => {
        this.value = value;
    };

    /** @hidden @internal */
    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //#endregion

    /** @hidden @internal */
    public getEditElement(): HTMLInputElement {
        return this.input.nativeElement;
    }

    /** @hidden @internal */
    public override selectItem(newSelection: IgxDropDownItemBaseDirective, event?) {
        const oldSelection = this.selectedItem ?? <IgxDropDownItemBaseDirective>{};

        if (newSelection === null || newSelection.disabled || newSelection.isHeader) {
            return;
        }

        if (newSelection === oldSelection) {
            this.toggleDirective.close();
            return;
        }

        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false, owner: this };
        this.selectionChanging.emit(args);

        if (args.cancel) {
            return;
        }

        this.setSelection(newSelection);
        this._value = newSelection.value;

        if (event) {
            this.toggleDirective.close();
        }

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
    public override open(overlaySettings?: OverlaySettings) {
        if (this.disabled || this.items.length === 0) {
            return;
        }
        if (!this.selectedItem) {
            this.navigateFirst();
        }

        super.open(Object.assign({}, this._overlayDefaults, this.overlaySettings, overlaySettings));
    }

    public inputGroupClick(event: MouseEvent, overlaySettings?: OverlaySettings) {
        const targetElement = event.target as HTMLElement;

        if (this.hintElement && targetElement.contains(this.hintElement.nativeElement)) {
            return;
        }
        this.toggle(Object.assign({}, this._overlayDefaults, this.overlaySettings, overlaySettings));
    }

    /** @hidden @internal */
    public ngAfterContentInit() {
        this._overlayDefaults = {
            target: this.getEditElement(),
            modal: false,
            positionStrategy: new SelectPositioningStrategy(this),
            scrollStrategy: new AbsoluteScrollStrategy(),
            excludeFromOutsideClick: [this.inputGroup.element.nativeElement as HTMLElement]
        };
        const changes$ = this.children.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.setSelection(this.items.find(x => x.value === this.value));
            this.cdr.detectChanges();
        });
        Promise.resolve().then(() => {
            if (!changes$.closed) {
                this.children.notifyOnChanges();
            }
        });
    }

    /**
     * Event handlers
     *
     * @hidden @internal
     */
    public handleOpening(e: ToggleViewCancelableEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: e.cancel };
        this.opening.emit(args);

        e.cancel = args.cancel;
        if (args.cancel) {
            return;
        }
    }

    /** @hidden @internal */
    public override onToggleContentAppended(event: ToggleViewEventArgs) {
        const info = this.overlayService.getOverlayById(event.id);
        if (info?.settings?.positionStrategy instanceof SelectPositioningStrategy) {
            return;
        }
        super.onToggleContentAppended(event);
    }

    /** @hidden @internal */
    public handleOpened() {
        this.updateItemFocus();
        this.opened.emit({ owner: this });
    }

    /** @hidden @internal */
    public handleClosing(e: ToggleViewCancelableEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: e.cancel };
        this.closing.emit(args);
        e.cancel = args.cancel;
    }

    /** @hidden @internal */
    public handleClosed() {
        this.focusItem(false);
        this.closed.emit({ owner: this });
    }

    /** @hidden @internal */
    public onBlur(): void {
        this._onTouchedCallback();
        if (this.ngControl && this.ngControl.invalid) {
            this.input.valid = IgxInputState.INVALID;
        } else {
            this.input.valid = IgxInputState.INITIAL;
        }
    }

    /** @hidden @internal */
    public onFocus(): void {
        this._onTouchedCallback();
    }

    /**
     * @hidden @internal
     */
    public override ngOnInit() {
        this.ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /**
     * @hidden @internal
     */
    public override ngAfterViewInit() {
        super.ngAfterViewInit();

        if (this.ngControl) {
            this.ngControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(this.onStatusChanged.bind(this));
            this.manageRequiredAsterisk();
        }

        this.cdr.detectChanges();
    }

    /** @hidden @internal */
    public ngAfterContentChecked() {
        if (this.inputGroup && this.prefixes?.length > 0) {
            this.inputGroup.prefixes = this.prefixes;
        }

        if (this.inputGroup && this.suffixes?.length > 0) {
            this.inputGroup.suffixes = this.suffixes;
        }
    }

    /** @hidden @internal */
    public get toggleIcon(): string {
        return this.collapsed ? 'input_expand' : 'input_collapse';
    }

    /**
     * @hidden @internal
     * Prevent input blur - closing the items container on Header/Footer Template click.
     */
    public mousedownHandler(event) {
        event.preventDefault();
    }

    protected onStatusChanged() {
        this.manageRequiredAsterisk();
        if (this.ngControl && !this.disabled && this.isTouchedOrDirty) {
            if (this.hasValidators && this.inputGroup.isFocused) {
                this.input.valid = this.ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
            } else {
                // B.P. 18 May 2021: IgxDatePicker does not reset its state upon resetForm #9526
                this.input.valid = this.ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
            }
        } else {
            this.input.valid = IgxInputState.INITIAL;
        }
    }

    private get isTouchedOrDirty(): boolean {
        return (this.ngControl.control.touched || this.ngControl.control.dirty);
    }

    private get hasValidators(): boolean {
        return (!!this.ngControl.control.validator || !!this.ngControl.control.asyncValidator);
    }

    protected override navigate(direction: Navigate, currentIndex?: number) {
        if (this.collapsed && this.selectedItem) {
            this.navigateItem(this.selectedItem.itemIndex);
        }
        super.navigate(direction, currentIndex);
    }

    protected manageRequiredAsterisk(): void {
        const hasRequiredHTMLAttribute = this.elementRef.nativeElement.hasAttribute('required');
        if (this.ngControl && this.ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this.ngControl.control.validator({} as AbstractControl);
            this.inputGroup.isRequired = error && error.required;
            this.cdr.markForCheck();

            // If validator is dynamically cleared and no required HTML attribute is set,
            // reset label's required class(asterisk) and IgxInputState #6896
        } else if (this.inputGroup.isRequired && this.ngControl && !this.ngControl.control.validator && !hasRequiredHTMLAttribute) {
            this.input.valid = IgxInputState.INITIAL;
            this.inputGroup.isRequired = false;
            this.cdr.markForCheck();
        }
    }

    private setSelection(item: IgxDropDownItemBaseDirective) {
        if (item && item.value !== undefined && item.value !== null) {
            this.selection.set(this.id, new Set([item]));
        } else {
            this.selection.clear(this.id);
        }
    }
}

