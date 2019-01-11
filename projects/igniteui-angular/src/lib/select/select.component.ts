import { NgModule, Component, ContentChildren, forwardRef, QueryList, ViewChild, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IgxDropDownModule } from '../drop-down/drop-down.component';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';

import { IgxDropDownItemBase, IgxDropDownBase } from '../drop-down';
import { IgxDropDownComponent } from './../drop-down/drop-down.component';
import { IgxSelectItemComponent } from './select-item.component';

import { OverlaySettings, AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../services';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { IgxDropDownItemComponent } from 'igniteui-angular';
import { IGX_DROPDOWN_BASE } from '../drop-down/drop-down.common';

let NEXT_ID = 0;
const noop = () => { };

@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IgxSelectComponent),
            multi: true
        },
        { provide: IGX_DROPDOWN_BASE, useExisting: IgxSelectComponent }]
})
export class IgxSelectComponent extends IgxDropDownComponent implements ControlValueAccessor {
    @ViewChild('inputGroup', { read: IgxInputGroupComponent}) public inputGroup: IgxInputGroupComponent;
    @ViewChild('input', { read: IgxInputGroupComponent}) public input: HTMLInputElement;
    @ContentChildren(forwardRef(() => IgxSelectItemComponent))
    protected children: QueryList<IgxSelectItemComponent>;
    @Input() public value: any;
    @Input() public placeholder = '';

    //#region IMPLEMENT ControlValueAccessor METHODS
    private _onChangeCallback: (_: any) => void = noop;
    public writeValue = (value: any) => {
        // 1. Select the new item from the drop down
        // 2. Set the input value
        if (value) {
            const item = this.items.find((x) => x.value === value);
            if (!item) {
                return;
            }
            this.selectItem(item);
         }
    }

    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }
    public registerOnTouched(fn: any): void { }

    ngAfterContentInit() {
    }
    //#endregion

    //#region ITEMS POSITION MANAGEMENT
    // Option1: OVERRIDE ITEMS POSITION METHODS IN drop-DownRightButtonComponent.base
    scrollToItem(item: IgxDropDownItemBase) {
        const itemPosition = this.calculateScrollPosition(item);
        this.scrollContainer.scrollTop = (itemPosition);
    }

    // calculateScrollPosition(item: IgxDropDownItemBase): number {

    // }
    public getSelectedItemPosition() {

    }

    public positionSelectedItem() {

    }
    //#endregion


    public selectItem(item: IgxDropDownItemBase, event?) {
        super.selectItem(item, event);
        if (this.selectedItem) {
            this.value = this.selectedItem.value;
            this._onChangeCallback(this.value);
        }
    }
    public openDropDown() {
        if (this.toggleDirective.collapsed) {
            this.toggleDirective.open({
                modal: false,
                positionStrategy: new ConnectedPositioningStrategy({
                    target: this.inputGroup.element.nativeElement
                })
            });
        }
    }

}

@NgModule({
    declarations: [IgxSelectComponent, IgxSelectItemComponent],
    exports: [IgxSelectComponent, IgxSelectItemComponent],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxToggleModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: []
})
export class IgxSelectModule { }
