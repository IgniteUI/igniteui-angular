import { IgxInputDirective } from './../directives/input/input.directive';
import {
    NgModule, Component, ContentChildren, forwardRef, QueryList, ViewChild, Input, ContentChild,
    AfterContentInit, HostBinding, Directive, TemplateRef
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
import { SelectPositioningStrategy } from './select-positioning-strategy';

import { OverlaySettings, AbsoluteScrollStrategy } from '../services/index';
import { IGX_DROPDOWN_BASE, ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { CancelableEventArgs } from '../core/utils';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxSelectBase } from './select.common';

    /** @hidden @internal */
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
export class IgxSelectComponent extends IgxDropDownComponent implements IgxSelectBase, ControlValueAccessor, AfterContentInit {

    // /** @hidden @internal do not use the drop-down container class */
    public cssClass = false;

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
    @Input() public placeholder = '';
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
    public get ariaExpanded(): boolean {
        return !this.collapsed;
    }

    /** @hidden @internal */
    public get ariaOwns() {
        return this.listId;
    }

    /** @hidden @internal */
    public width: string;

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

    /** @hidden @internal */
    public get listId() {
        return this.id + '-list';
    }

    /** @hidden @internal */
    public get selectionValue() {
        const selectedItem = this.selectedItem;
        return selectedItem ? selectedItem.itemText : '';
    }

    /** @hidden @internal */
    public get selectedItem(): IgxSelectItemComponent {
        return this.selection.first_item(this.id);
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
    public selectItem(newSelection: IgxDropDownItemBase, event?) {
        const oldSelection = this.selectedItem;
        if (newSelection === null || newSelection.disabled) {
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

        if (event) {
            this.toggleDirective.close();
        }
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
        if (overlaySettings) {
            super.open(overlaySettings);
            return;
        }
        if (this.overlaySettings) {
            super.open(this.overlaySettings);
        } else {
            super.open({
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new SelectPositioningStrategy(this),
                scrollStrategy: new AbsoluteScrollStrategy(),
            });
        }
    }

    /** @hidden @internal */
    ngAfterContentInit() {
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

    /** @hidden @internal */
    private setSelection(item: IgxDropDownItemBase) {
        if (item && item.value !== undefined && item.value !== null) {
            this.selection.set(this.id, new Set([item]));
        } else {
            this.selection.clear(this.id);
        }
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
