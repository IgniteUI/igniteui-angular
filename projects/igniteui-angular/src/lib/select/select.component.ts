import { NgModule, Component, ContentChildren, forwardRef, QueryList, ViewChild, Input, HostBinding } from '@angular/core';
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
import { IGX_DROPDOWN_BASE, ISelectionEventArgs } from '../drop-down/drop-down.common';

const noop = () => { };

@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxSelectComponent,
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
    @Input()
    @HostBinding('class.igx-select--disabled')
    public disabled = false;

    public get selectedItem(): any {
        const selectedValue = this.selection.first_item(this.id);
        return this.items.find(x => x.value === selectedValue);
    }

    //#region IMPLEMENT ControlValueAccessor METHODS
    private _onChangeCallback: (_: any) => void = noop;
    public writeValue = (value: any) => {
        // 1. Select the new item from the drop down
        // 2. Set the input value
        if (value) {
            this.value = value;
            this.selection.set(this.id, new Set([this.value]));
        }
    }

    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }
    public registerOnTouched(fn: any): void { }

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


    public selectItem(newSelection: IgxDropDownItemBase, event?) {
        const oldSelection = this.selectedItem;
        if (newSelection === null) {
            return;
        }
        if (newSelection.isHeader) {
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

    public open(overlaySettings?: OverlaySettings) {
        super.open({
            modal: false,
            positionStrategy: new ConnectedPositioningStrategy({
                target: this.inputGroup.element.nativeElement
            })
        });
    }

    // getPrefixClientWidth () {

    // }
}

@NgModule({
    declarations: [IgxSelectComponent, IgxSelectItemComponent],
    exports: [IgxSelectComponent, IgxSelectItemComponent],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxToggleModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: []
})
export class IgxSelectModule { }
