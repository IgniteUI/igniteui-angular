import { CommonModule } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Injector,
    NgModule, Optional, Output, ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { IgxComboItemComponent } from '../combo/combo-item.component';
import { IgxComboAPIService } from '../combo/combo.api';
import { IgxComboBaseDirective, IGX_COMBO_COMPONENT } from '../combo/combo.common';
import { IgxComboModule } from '../combo/combo.component';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/displayDensity';
import { IgxSelectionAPIService } from '../core/selection';
import { CancelableEventArgs, IBaseEventArgs, PlatformUtil } from '../core/utils';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownModule } from '../drop-down/public_api';
import { IgxIconModule, IgxIconService } from '../icon/public_api';
import { IgxInputGroupModule, IgxInputGroupType, IGX_INPUT_GROUP_TYPE } from '../input-group/public_api';

/** Emitted when an igx-simple-combo's selection is changing.  */
export interface ISimpleComboSelectionChangingEventArgs extends CancelableEventArgs, IBaseEventArgs {
    /** An object which represents the value that is currently selected */
    oldSelection: any;
    /** An object which represents the value that will be selected after this event */
    newSelection: any;
    /** The text that will be displayed in the combo text box */
    displayText: string;
}

/**
 * Represents a drop-down list that provides filtering functionality, allowing users to choose a single option from a predefined list.
 *
 * @igxModule IgxSimpleComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, single combo selection
 * @igxGroup Grids & Lists
 *
 * @remarks
 * It provides the ability to filter items as well as perform single selection on the provided data.
 * Additionally, it exposes keyboard navigation and custom styling capabilities.
 * @example
 * ```html
 * <igx-simple-combo [itemsMaxHeight]="250" [data]="locationData"
 *  [displayKey]="'field'" [valueKey]="'field'"
 *  placeholder="Location" searchPlaceholder="Search...">
 * </igx-simple-combo>
 * ```
 */
@Component({
    selector: 'igx-simple-combo',
    templateUrl: 'simple-combo.component.html',
    providers: [
        IgxComboAPIService,
        { provide: IGX_COMBO_COMPONENT, useExisting: IgxSimpleComboComponent },
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxSimpleComboComponent, multi: true }
    ]
})
export class IgxSimpleComboComponent extends IgxComboBaseDirective implements ControlValueAccessor, AfterViewInit {
    /** @hidden @internal */
    @ViewChild(IgxComboDropDownComponent, { static: true })
    public dropdown: IgxComboDropDownComponent;

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-simple-combo (selectionChanging)='handleSelection()'></igx-simple-combo>
     * ```
     */
    @Output()
    public selectionChanging = new EventEmitter<ISimpleComboSelectionChangingEventArgs>();

    /** @hidden @internal */
    public composing = false;

    private _updateInput = false;

    /** @hidden @internal */
    public get filteredData(): any[] | null {
        return this._filteredData;
    }
    /** @hidden @internal */
    public set filteredData(val: any[] | null) {
        this._filteredData = this.groupKey ? (val || []).filter((e) => e.isHeader !== true) : val;
        this.checkMatch();
    }

    constructor(protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selectionService: IgxSelectionAPIService,
        protected comboAPI: IgxComboAPIService,
        protected _iconService: IgxIconService,
        private platformUtil: PlatformUtil,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType: IgxInputGroupType,
        @Optional() protected _injector: Injector) {
        super(elementRef, cdr, selectionService, comboAPI,
            _iconService, _displayDensityOptions, _inputGroupType, _injector);
        this.comboAPI.register(this);
    }

    /**
     * Select a defined item
     *
     * @param item the item to be selected
     * ```typescript
     * this.combo.select("New York");
     * ```
     */
    public select(item: any): void {
        if (item !== null && item !== undefined) {
            const newSelection = this.selectionService.add_items(this.id, item instanceof Array ? item : [item], true);
            this.setSelection(newSelection);
        }
    }

    /**
     * Deselect a defined item
     *
     * @param item the items to be deselected
     * ```typescript
     * this.combo.deselect("New York");
     * ```
     */
    public deselect(item: any): void {
        if (item !== null && item !== undefined) {
            const newSelection = this.selectionService.delete_items(this.id, item instanceof Array ? item : [item]);
            this.setSelection(newSelection);
        }
    }

    /** @hidden @internal */
    public writeValue(value: any) {
        const oldSelection = this.selection;
        this.selectionService.select_items(this.id, value ? [value] : [], true);
        this.cdr.markForCheck();
        this._value = this.createDisplayText(this.selection, oldSelection);
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.dropdown.opened.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.composing) {
                this.comboInput.focus();
            }
        });
        this.dropdown.closed.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.composing = false;
        });
        this.dropdown.closing.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const selection = this.selectionService.first_item(this.id);
            this.comboInput.value = selection !== undefined && selection !== null ? selection : '';
        });
        this.dropdown.opening.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (!this.comboInput.value.length) {
                this.clearSelection();
            }
        });
        super.ngAfterViewInit();
    }

    /** @hidden @internal */
    public handleInputChange(event?: any) {
        this.searchValue = event.target.value;
        this._onChangeCallback(this.searchValue);
        if (this.collapsed) {
            this.open();
        }
        super.handleInputChange(event);
    }

    /** @hidden @internal */
    public handleKeyDown(event: KeyboardEvent) {
        if (event.key === this.platformUtil.KEYMAP.ENTER) {
            const filtered = this.filteredData.find(this.findMatch);
            if (filtered === null || filtered === undefined) {
                return;
            }
            this.select(this.dropdown.items[0].itemID);
            event.preventDefault();
            event.stopPropagation();
            this.close();
            return;
        }
        if (event.key === this.platformUtil.KEYMAP.BACKSPACE
            || event.key === this.platformUtil.KEYMAP.DELETE) {
            this._updateInput = false;
            this.clearSelection();
        }
        super.handleKeyDown(event);
        this.composing = event.key !== this.platformUtil.KEYMAP.ARROW_DOWN
            && event.key !== this.platformUtil.KEYMAP.ARROW_LEFT
            && event.key !== this.platformUtil.KEYMAP.ARROW_RIGHT
            && event.key !== this.platformUtil.KEYMAP.TAB;
    }

    /** @hidden @internal */
    public handleKeyUp(event: KeyboardEvent) {
        if (event.key === this.platformUtil.KEYMAP.ARROW_DOWN) {
            const firstItem = this.selectionService.first_item(this.id);
            this.dropdown.focusedItem = firstItem && this.filteredData.length > 0
                ? this.dropdown.items.find(i => i.itemID === firstItem)
                : this.dropdown.items[0];
            this.dropdownContainer.nativeElement.focus();
        }
    }

    /** @hidden @internal */
    public getEditElement(): HTMLElement {
        return this.comboInput.nativeElement;
    }

    /** @hidden @internal */
    public handleClear(event: Event) {
        if (this.disabled) {
            return;
        }
        this.clearSelection(true);
        if (this.collapsed) {
            this.getEditElement().focus();
        } else {
            this.focusSearchInput(true);
        }
        event.stopPropagation();

        this.comboInput.value = this.filterValue = this.searchValue = '';
        this.dropdown.focusedItem = null;
        this.comboInput.focus();
    }

    /** @hidden @internal */
    public handleOpened() {
        this.triggerCheck();
        this.dropdownContainer.nativeElement.focus();
        this.opened.emit({ owner: this });
    }

    /** @hidden @internal */
    public focusSearchInput(opening?: boolean): void {
        if (opening) {
            this.dropdownContainer.nativeElement.focus();
        } else {
            this.comboInput.nativeElement.focus();
            this.toggle();
        }
    }

    protected findMatch = (element: any): boolean => {
        const value = this.displayKey ? element[this.displayKey] : element;
        return value.toString().toLowerCase().includes(this.searchValue.trim().toLowerCase());
    };

    protected setSelection(newSelection: any): void {
        const newSelectionAsArray = newSelection ? Array.from(newSelection) as IgxComboItemComponent[] : [];
        const oldSelectionAsArray = Array.from(this.selectionService.get(this.id) || []);
        const displayText = this.createDisplayText(newSelectionAsArray, oldSelectionAsArray);
        const args: ISimpleComboSelectionChangingEventArgs = {
            newSelection: newSelectionAsArray[0],
            oldSelection: oldSelectionAsArray[0],
            displayText,
            owner: this,
            cancel: false
        };
        this.selectionChanging.emit(args);
        if (!args.cancel) {
            const argsSelection = args.newSelection !== undefined
                && args.newSelection !== null
                ? [args.newSelection]
                : [];
            this.selectionService.select_items(this.id, argsSelection, true);
            if (this._updateInput) {
                this._value = displayText !== args.displayText
                    ? args.displayText
                    : this.createDisplayText([args.newSelection], [args.oldSelection]);
            }
            this._onChangeCallback(args.newSelection);
            this._updateInput = true;
        }
    }

    protected createDisplayText(newSelection: any[], oldSelection: any[]) {
        if (this.isRemote) {
            return this.getRemoteSelection(newSelection, oldSelection);
        }

        return this.displayKey !== null && this.displayKey !== undefined
            ? this.convertKeysToItems(newSelection).map(e => e[this.displayKey])[0]
            : newSelection[0];
    }

    private clearSelection(ignoreFilter?: boolean): void {
        let newSelection = this.selectionService.get_empty();
        if (this.filteredData.length !== this.data.length && !ignoreFilter) {
            newSelection = this.selectionService.delete_items(this.id, this.selectionService.get_all_ids(this.filteredData, this.valueKey));
        }
        this.setSelection(newSelection);
    }
}

@NgModule({
    declarations: [IgxSimpleComboComponent],
    imports: [
        IgxComboModule, IgxRippleModule, CommonModule,
        IgxInputGroupModule, FormsModule, ReactiveFormsModule,
        IgxForOfModule, IgxToggleModule, IgxCheckboxModule,
        IgxDropDownModule, IgxButtonModule, IgxIconModule,
        IgxTextSelectionModule
    ],
    exports: [IgxSimpleComboComponent, IgxComboModule]
})
export class IgxSimpleComboModule { }
