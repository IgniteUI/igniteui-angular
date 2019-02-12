import { IgxInputDirective } from './../directives/input/input.directive';
import {
    NgModule, Component, ContentChildren,
    forwardRef, QueryList, ViewChild,
    Input, ContentChild, AfterContentInit,
    HostBinding, Directive, TemplateRef, EventEmitter
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IgxDropDownModule, IgxDropDownItemBase } from '../drop-down/index';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';

import { IgxDropDownComponent } from './../drop-down/drop-down.component';
import { IgxSelectItemComponent } from './select-item.component';
import { SelectPositioningStrategy } from './../services/overlay/position/select-positioning-strategy';

import { OverlaySettings, AbsoluteScrollStrategy } from '../services/index';
import { IGX_DROPDOWN_BASE, ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { CancelableEventArgs } from '../core/utils';
import { IgxLabelDirective } from '../directives/label/label.directive';

/**
 * @hidden
 */
@Directive({
    selector: '[igxSelectToggleIcon]'
})
export class IgxSelectToggleIconDirective {
}

const noop = () => { };
@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxSelectComponent, multi: true },
        { provide: IGX_DROPDOWN_BASE, useExisting: IgxSelectComponent }]
})
export class IgxSelectComponent extends IgxDropDownComponent implements ControlValueAccessor, AfterContentInit {

    // /** @hidden @internal do not use the drop-down container class? */
    public cssClass = false;

    /**
     * @hidden
     */
    // Currently there is no need to add a css class to wrap the component
    // @HostBinding('class.igx-select')
    // public selectCssClass = true;

    @ViewChild('inputGroup', { read: IgxInputGroupComponent }) public inputGroup: IgxInputGroupComponent;
    @ViewChild('input', { read: IgxInputDirective }) public input: IgxInputDirective;
    @ContentChildren(forwardRef(() => IgxSelectItemComponent), { descendants: true })
    public children: QueryList<IgxSelectItemComponent>;
    @ContentChild(forwardRef(() => IgxLabelDirective)) label: IgxLabelDirective;

    private _value: any;
    /**
     * An @Input property that sets the input value.
     *
     */
    @Input()
    public get value(): any {
        return this._value;
    }
    public set value(v: any) {
        this._value = v;
        if (v && this.items.find(x => x.value === v)) {
            this.selection.set(this.id, new Set([this.value]));
        } else {
            this.selection.clear(this.id); // 0 , ''
        }
        // update input group value
        this.cdr.detectChanges();
    }
    /**
     * An @Input property that sets input placeholder.
     *
     */
    @Input() public placeholder = '';
    /**
     * An @Input property that disables the `IgxSelectComponent`.
     * ```html
     * <igx-select [disabled]="'true'"></igx-select>
     * ```
     */
    @Input() public disabled = false;

    @Input()
    overlaySettings: OverlaySettings;

    /**
     * @hidden
     */
    @HostBinding('style.maxHeight')
    public maxHeight = '256px';

    /**
     * @hidden
     */
    public get ariaExpanded(): boolean {
        return !this.collapsed;
    }

    /**
     * @hidden
     */
    public get ariaHasPopUp() {
        return 'listbox';
    }

    /**
     * @hidden
     */
    public get ariaOwns() {
        return this.listId;
    }

    /**
     * An @Input property that sets how the select will be styled.
     * The allowed values are `line`, `box` and `border`. The default is `line`.
     * ```html
     *<igx-select [type]="'box'">
     * ```
     */
    @Input()
    public type = 'line';

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

    public get listId() {
        return this.id + '-list';
    }

    public get selectionValue() {
        const selectedItem = this.selectedItem;
        return selectedItem ? selectedItem.itemText : '';
    }

    public get selectedItem(): IgxSelectItemComponent {
        const selectedValue = this.selection.first_item(this.id);
        return this.items.find(x => x.value === selectedValue) as IgxSelectItemComponent;
    }

    //#region IMPLEMENT ControlValueAccessor METHODS
    private _onChangeCallback: (_: any) => void = noop;

    public writeValue = (value: any) => {
        // 1. Set the input value
        // 2. Select the new item from the drop down
        this.value = value;
    }

    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any): void { }
    //#endregion

    public selectItem(newSelection: IgxDropDownItemBase, event?) {
        const oldSelection = this.selectedItem;
        if (newSelection.disabled || newSelection === null) {
            return;
        }

        const args: ISelectionEventArgs = { oldSelection, newSelection, cancel: false };
        this.onSelection.emit(args);

        if (args.cancel) {
            return;
        }

        this.selection.set(this.id, new Set([newSelection.value]));
        if (event) {
            this.toggleDirective.close();
        }

        if (this.selectedItem) {
            this.value = this.selectedItem.value;
            this._onChangeCallback(this.value);
        }
    }

    public getFirstItemElement(): HTMLElement {
        return this.children.first.element.nativeElement;
    }
    public open(overlaySettings?: OverlaySettings) {
        if (this.disabled || this.items.length === 0) {
            return;
        }

        // open with the overlaySettings passed to the open method (if such)
        if (overlaySettings) {
            super.open(overlaySettings);
            return;
        }
        // open with the overlaySettings passed as input ([overlaySettings]="customOverlaySettings")
        if (this.overlaySettings) {
            super.open(this.overlaySettings);
            // default overlay settings, positionStrategy and scrollStrategy
        } else {
            super.open({
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new SelectPositioningStrategy(this),
                scrollStrategy: new AbsoluteScrollStrategy(),
            });
        }
    }

    // Initially the items are still not existing, so handle ngAfterContentInit
    ngAfterContentInit() {
        this.children.changes.subscribe(() => {
            if (this.items.find(x => x.value === this.value)) {
                this.selection.set(this.id, new Set([this.value]));
                this.cdr.detectChanges();
            }
        });
        Promise.resolve().then(() => this.children.notifyOnChanges());
    }

    public onToggleOpening(event: CancelableEventArgs) {
        this.onOpening.emit(event);
        if (event.cancel) {
            return;
        }
        this.scrollToItem(this.selectedItem);
    }
}
@NgModule({
    declarations: [IgxSelectComponent, IgxSelectItemComponent, IgxSelectItemNavigationDirective, IgxSelectToggleIconDirective],
    exports: [IgxSelectComponent, IgxSelectItemComponent, IgxSelectItemNavigationDirective, IgxSelectToggleIconDirective],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxToggleModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: []
})
export class IgxSelectModule { }
