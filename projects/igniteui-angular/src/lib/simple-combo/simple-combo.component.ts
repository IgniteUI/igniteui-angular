import { CommonModule } from '@angular/common';
import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, Injector,
    NgModule, Optional, Output, ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxComboAddItemComponent } from '../combo/combo-add-item.component';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { IgxComboItemComponent } from '../combo/combo-item.component';
import { IgxComboAPIService } from '../combo/combo.api';
import { IgxComboBaseDirective, IGX_COMBO_COMPONENT } from '../combo/combo.common';
import { IgxComboModule } from '../combo/combo.component';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/displayDensity';
import { IgxSelectionAPIService } from '../core/selection';
import { CancelableEventArgs, IBaseCancelableBrowserEventArgs, IBaseEventArgs, PlatformUtil } from '../core/utils';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxForOfModule } from '../directives/for-of/for_of.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxTextSelectionDirective, IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
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

    /** @hidden @internal */
    @ViewChild(IgxComboAddItemComponent)
    public addItem: IgxComboAddItemComponent;

    /**
     * Emitted when item selection is changing, before the selection completes
     *
     * ```html
     * <igx-simple-combo (selectionChanging)='handleSelection()'></igx-simple-combo>
     * ```
     */
    @Output()
    public selectionChanging = new EventEmitter<ISimpleComboSelectionChangingEventArgs>();

    @ViewChild(IgxTextSelectionDirective, { static: true })
    private textSelection: IgxTextSelectionDirective;

    /** @hidden @internal */
    public composing = false;

    private _updateInput = true;

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

    /** @hidden @internal */
    @HostListener('keydown.ArrowDown', ['$event'])
    @HostListener('keydown.Alt.ArrowDown', ['$event'])
    public onArrowDown(event: Event) {
        if (this.collapsed) {
            event.preventDefault();
            event.stopPropagation();
            this.open();
        } else {
            if (this.virtDir.igxForOf.length > 0) {
                this.dropdown.navigateFirst();
                this.dropdownContainer.nativeElement.focus();
            } else if (this.allowCustomValues) {
                this.addItem.element.nativeElement.focus();
            }
        }
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
     * Deselect the currently selected item
     *
     * @param item the items to be deselected
     * ```typescript
     * this.combo.deselect("New York");
     * ```
     */
    public deselect(): void {
        this.clearSelection();
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
        this.virtDir.contentSizeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.selection.length > 0) {
                const index = this.virtDir.igxForOf.findIndex(e => {
                    let current = e[this.valueKey];
                    if (this.valueKey === null || this.valueKey === undefined) {
                        current = e;
                    }
                    return current === this.selection[0];
                });
                this.dropdown.navigateItem(index);
            }
        });
        this.dropdown.opened.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.composing) {
                this.comboInput.focus();
            }
        });
        this.dropdown.closing.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            if (this.getEditElement() && !args.event) {
                this.comboInput.focus();
            } else {
                this.clearOnBlur();
                this._onTouchedCallback();
            }
        });

        super.ngAfterViewInit();
    }

    /** @hidden @internal */
    public handleInputChange(event?: any) {
        if (event !== undefined) {
            this.searchValue = typeof event === 'string' ? event : event.target.value;
        }
        this._onChangeCallback(this.searchValue);
        if (this.collapsed && this.comboInput.focused) {
            this.open();
            this.dropdown.navigateFirst();
        }
        if (!this.comboInput.value.trim()) {
            // handle clearing of input by space
            this.clearSelection();
            this._onChangeCallback(null);
        }
        super.handleInputChange(event);
        this.composing = true;
    }

    /** @hidden @internal */
    public handleKeyDown(event: KeyboardEvent) {
        if (event.key === this.platformUtil.KEYMAP.ENTER) {
            const filtered = this.filteredData.find(this.findMatch);
            if (filtered === null || filtered === undefined) {
                return;
            }
            this.select(this.dropdown.focusedItem.itemID);
            event.preventDefault();
            event.stopPropagation();
            this.close();
            // manually trigger text selection as it will not be triggered during editing
            this.textSelection.trigger();
            return;
        }
        if (event.key === this.platformUtil.KEYMAP.BACKSPACE
            || event.key === this.platformUtil.KEYMAP.DELETE) {
            this._updateInput = false;
            this.clearSelection();
        }
        if (!this.collapsed && event.key === this.platformUtil.KEYMAP.TAB) {
            this.close();
            this.clearOnBlur();
        }
        this.composing = false;
        super.handleKeyDown(event);
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
    public handleItemKeyDown(event: KeyboardEvent) {
        if (event.key === this.platformUtil.KEYMAP.ARROW_UP && event.altKey) {
            this.close();
            this.comboInput.focus();
            return;
        }
        if (event.key === this.platformUtil.KEYMAP.ENTER) {
            this.comboInput.focus();
        }
    }

    /** @hidden @internal */
    public handleItemClick() {
        this.close();
        this.comboInput.focus();
    }

    /** @hidden @internal */
    public onBlur() {
        if (this.collapsed) {
            this.clearOnBlur();
        }
        super.onBlur();
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
            this.open();
            this.dropdown.navigateFirst();
        } else {
            this.focusSearchInput(true);
        }
        event.stopPropagation();

        this.comboInput.value = this.filterValue = this.searchValue = '';
        this.dropdown.focusedItem = null;
        this.composing = false;
        this.comboInput.focus();
    }

    /** @hidden @internal */
    public handleOpened() {
        this.triggerCheck();
        this.dropdownContainer.nativeElement.focus();
        this.opened.emit({ owner: this });
    }

    /** @hidden @internal */
    public handleClosing(e: IBaseCancelableBrowserEventArgs) {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, event: e.event, cancel: e.cancel };
        this.closing.emit(args);
        e.cancel = args.cancel;
        if (e.cancel) {
            return;
        }

        this.composing = false;
        // explicitly update selection and trigger text selection so that we don't have to force CD
        this.textSelection.selected = true;
        this.textSelection.trigger();
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

    /** @hidden @internal */
    public onClick(event: Event) {
        super.onClick(event);
        if (this.comboInput.value.length === 0) {
            this.virtDir.scrollTo(0);
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
            let argsSelection = args.newSelection !== undefined
                && args.newSelection !== null
                ? args.newSelection
                : [];
            argsSelection = Array.isArray(argsSelection) ? argsSelection : [argsSelection];
            this.selectionService.select_items(this.id, argsSelection, true);
            if (this._updateInput) {
                this.comboInput.value = this._value = displayText !== args.displayText
                    ? args.displayText
                    : this.createDisplayText(argsSelection, [args.oldSelection]);
            }
            this._onChangeCallback(args.newSelection);
            this._updateInput = true;
        }
    }

    protected createDisplayText(newSelection: any[], oldSelection: any[]) {
        if (this.isRemote) {
            return this.getRemoteSelection(newSelection, oldSelection);
        }

        if (this.displayKey !== null && this.displayKey !== undefined
            && newSelection.length > 0) {
            return this.convertKeysToItems(newSelection).map(e => e[this.displayKey])[0];
        }

        return newSelection[0] || '';
    }

    private clearSelection(ignoreFilter?: boolean): void {
        let newSelection = this.selectionService.get_empty();
        if (this.filteredData.length !== this.data.length && !ignoreFilter) {
            newSelection = this.selectionService.delete_items(this.id, this.selectionService.get_all_ids(this.filteredData, this.valueKey));
        }
        this.setSelection(newSelection);
    }

    private clearOnBlur() {
        const filtered = this.filteredData.find(this.findMatch);
        if ((filtered === undefined || filtered === null)) {
            this.close();
            this.clearSelection();
            this.searchValue = '';
        }
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
