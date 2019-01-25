import { IgxInputDirective } from './../directives/input/input.directive';
// tslint:disable-next-line:max-line-length
import { NgModule, Component, ContentChildren, forwardRef, QueryList, ViewChild, Input, ContentChild, AfterContentInit, HostBinding } from '@angular/core';
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
import { SelectPositioningStrategy } from './../services/overlay/position/select-positioning-strategy';

import { OverlaySettings, AbsoluteScrollStrategy } from '../services';
import { IGX_DROPDOWN_BASE, ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { IgxLabelDirective } from '../input-group';
import { timer, Subscription } from 'rxjs';
import { CancelableEventArgs } from '../core/utils';
import { fadeIn, fadeOut } from '../animations/main';

const noop = () => { };
@Component({
    selector: 'igx-select',
    templateUrl: './select.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxSelectComponent, multi: true },
        { provide: IGX_DROPDOWN_BASE, useExisting: IgxSelectComponent }]
})
export class IgxSelectComponent extends IgxDropDownComponent implements ControlValueAccessor, AfterContentInit {

    /** @hidden @internal TODO: igx-select class hostbind? */
    public cssClass = false;

    @ViewChild('inputGroup', { read: IgxInputGroupComponent }) public inputGroup: IgxInputGroupComponent;
    @ViewChild('input', { read: IgxInputDirective }) public input: IgxInputDirective;
    @ContentChildren(forwardRef(() => IgxSelectItemComponent))
    public children: QueryList<IgxSelectItemComponent>;
    @ContentChild(IgxLabelDirective) label: IgxLabelDirective;

    /**
     * An @Input property that sets how the input value.
     *
     */
    @Input() public value: any;
    /**
     * An @Input property that sets how input placeholder.
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
        if (value) {
            this.value = value;
            if (this.items.find(x => x.value === value)) {
                this.selection.set(this.id, new Set([this.value]));
            }
        }
    }

    public registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any): void { }
    //#endregion

    public selectItem(newSelection: IgxDropDownItemBase, event?) {
        const oldSelection = this.selectedItem;
        if (newSelection.isHeader || newSelection.disabled || newSelection === null) {
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

    public getElementPadding() {
        return this.input.nativeElement.getBoundingClientRect().x - this.inputGroup.element.nativeElement.getBoundingClientRect().x + `px`;
    }
    public open(overlaySettings?: OverlaySettings) {
        if (this.disabled) {
            return;
        }
        super.open({
            modal: false,
            closeOnOutsideClick: true,
            positionStrategy: new SelectPositioningStrategy(
                this,
                { target: this.inputGroup.element.nativeElement,
                    closeAnimation: fadeOut,
                    openAnimation: fadeIn
                }
            ),
            scrollStrategy: new AbsoluteScrollStrategy(),
        });
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

    // tslint:disable:member-ordering
    private inputStream = '';
    private cancelSub$: Subscription;

    // Key listeners go here
    public captureKey(event: KeyboardEvent) {
        if (!event) {
            return;
        }
        this.inputStream += event.key;
        const focusedItem = this.focusedItem as IgxSelectItemComponent;
        // select the item
        if (focusedItem && this.inputStream.length > 1 && focusedItem.itemText.startsWith(this.inputStream)) {
            return;
        }
        this.activateItemByText(this.inputStream);
        console.log(this.inputStream);
        if (this.cancelSub$) {
            this.cancelSub$.unsubscribe();
        }
        this.cancelSub$ = timer(500).subscribe(() => {
            console.log('---');
            this.inputStream = '';
        });
    }

    public activateItemByText(text: string) {
        const items = this.items as IgxSelectItemComponent[];
        const activeItemIndex = items.indexOf(this.focusedItem as IgxSelectItemComponent) || 0;
        // ^ this is focused OR selected if the dd is closed
        let nextItem = items.slice(activeItemIndex + 1).find(x => !x.disabled && x.itemText.startsWith(text));

        if (!nextItem) {
            nextItem = items.slice(0, activeItemIndex).find(x => !x.disabled && x.itemText.startsWith(text));
        }

        if (!nextItem) {
            return;
        }

        if (!this.collapsed) {
            this.navigateItem(items.indexOf(nextItem));
        } else {
            this.selectItem(nextItem);
        }
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
    declarations: [IgxSelectComponent, IgxSelectItemComponent, IgxSelectItemNavigationDirective],
    exports: [IgxSelectComponent, IgxSelectItemComponent, IgxSelectItemNavigationDirective],
    imports: [IgxRippleModule, CommonModule, IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxToggleModule, IgxDropDownModule, IgxButtonModule, IgxIconModule],
    providers: []
})
export class IgxSelectModule { }
