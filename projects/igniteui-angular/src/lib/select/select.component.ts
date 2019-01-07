import { NgModule, Component, ContentChildren, forwardRef, QueryList, ViewChild, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IgxDropDownModule } from '../drop-down/drop-down.component';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/input-group.component';

import { IgxDropDownItemBase, IgxDropDownBase } from '../drop-down/drop-down.base';
import { IgxDropDownComponent } from './../drop-down/drop-down.component';
import { IgxSelectItemComponent } from './select-item.component';

import { OverlaySettings, AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../services';
import { Subscription } from 'rxjs';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { DefaultSortingStrategy, ISortingStrategy } from '../data-operations/sorting-strategy';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { IgxInputDirective } from 'igniteui-angular';


let NEXT_ID = 0;
const noop = () => { };

@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [{ provide: IgxDropDownBase, useExisting: IgxSelectComponent }]
})
export class IgxSelectComponent extends IgxDropDownComponent implements ControlValueAccessor {
    @ViewChild('inputGroup', { read: IgxInputGroupComponent}) public inputGroup: IgxInputGroupComponent;

    @ContentChildren(forwardRef(() => IgxSelectItemComponent))
    protected children: QueryList<IgxSelectItemComponent>;
    @Input() value: any;
    //#region Implement ControlValueAccessor methods

    private _onChangeCallback: (_: any) => void = noop;
    public writeValue(value: any): void {
    // this.selectItems(value, true);
    // this.cdr.markForCheck();
    }

    public registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
    }
    public registerOnTouched(fn: any): void { }

    //#endregion

    //#region Items position management
    public getSelectedItemPosition() {

    }

    public positionSelectedItem() {

    }
    //#endregion
    public selectItem(item: IgxDropDownItemBase, event?) {
        super.selectItem(item, event);
        this.value = this.selectedItem.value;
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

// declarations: [IgxComboComponent, IgxComboItemComponent, IgxComboFilterConditionPipe, IgxComboGroupingPipe,
//     IgxComboFilteringPipe, IgxComboSortingPipe, IgxComboDropDownComponent,
//     IgxComboItemDirective,
//     IgxComboEmptyDirective,
//     IgxComboHeaderItemDirective,
//     IgxComboHeaderDirective,
//     IgxComboFooterDirective,
//     IgxComboAddItemDirective],
// exports: [IgxComboComponent, IgxComboItemComponent, IgxComboDropDownComponent,
//     IgxComboItemDirective,
//     IgxComboEmptyDirective,
//     IgxComboHeaderItemDirective,
//     IgxComboHeaderDirective,
//     IgxComboFooterDirective,
//     IgxComboAddItemDirective],
// imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
//     IgxForOfModule, IgxToggleModule, IgxCheckboxModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
// providers: [IgxSelectionAPIService]
export class IgxSelectModule { }
