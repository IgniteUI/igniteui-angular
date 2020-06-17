
import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { ColumnChooserBaseDirective } from '../column-chooser-base';
import { IgxColumnPinningItemDirective } from './pinning.directive';



@Component({
    preserveWhitespaces: false,
    selector: 'igx-column-pinning',
    templateUrl: './column-pinning.component.html'
})
export class IgxColumnPinningComponent extends ColumnChooserBaseDirective {
    /**
     * Returns a boolean indicating whether the `PIN ALL` button is disabled.
     * ```typescript
     * let isPinAlldisabled =  this.columnPinning.disablePinAll;
     * ```
     * @memberof IgxColumnPinningComponent
     */
    @Input()
    get disablePinAll(): boolean {
        if (!this.columnItems || this.columnItems.length < 1 ||
            this.pinnedColumnsCount === this.columns.length) {
            return true;
        } else if (this.pinnableColumns.length < 1 ||
            this.pinnableColumns.length === this.pinnableColumns.filter((col) => col.value).length) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * Returns a boolean indicating whether the `UNPIN ALL` button is disabled.
     * ```typescript
     * let isUnpinAlldisabled =  this.columnPinning.disableUnpinAll;
     * ```
     * @memberof IgxColumnPinningComponent
     */
    @Input()
    get disableUnpinAll(): boolean {
        if (!this.columnItems || this.columnItems.length < 1 ||
            this.pinnedColumnsCount < 1 || this.pinnableColumns.length < 1) {
            return true;
        } else if (this.pinnableColumns.length === this.pinnableColumns.filter((col) => !col.value).length) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * Sets/gets the text of the button that pins all columns if they are unpinned.
     * ```typescript
     * let pinAllButtonText =  this.columnPinning.pinAllText;
     * ```
     *
     * ```html
     * <igx-column-pinning [pinAllText] = "'Pin Columns'"></igx-column-pinning>
     * ```
     * @memberof IgxColumnPinningComponent
     */
    @Input()
    public pinAllText = 'Pin All';
    /**
     * Sets/gets the text of the button that unpins all columns if they are pinned.
     * ```typescript
     * let unpinAllButtonText =  this.columnPinning.unpinAllText;
     * ```
     *
     * ```html
     * <igx-column-pinning [unpinAllText] = "'Unpin Columns'"></igx-column-pinning>
     * ```
     * @memberof IgxColumnPinningComponent
     */
    @Input()
    public unpinAllText = 'Unpin All';
    /**
     * Gets the count of the pinned columns.
     * ```typescript
     * let pinnedColumnsCount =  this.columnPinning.pinnedColumnsCount;
     * ```
     * @memberof IgxColumnPinningComponent
     */
    public get pinnedColumnsCount() {
        return (this.columns) ? this.columns.filter((col) => col.pinned).length : 0;
    }

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    /**
     * @hidden
     */
    createColumnItem(container: any, column: any) {
        if (column.level !== 0 || column.disablePinning) {
            return null;
        }
        const item = new IgxColumnPinningItemDirective();
        item.container = container;
        item.column = column;
        return item;
    }

    /**
     * @hidden
     */
    public checkboxValueChange(event, columnItem: IgxColumnPinningItemDirective) {
        if (event.checked && !columnItem.pinnable) {
            event.checkbox.checked = false;
            return false;
        }
        columnItem.value = !columnItem.value;
    }

    /**
     * @hidden @internal
     */
    public get pinnableColumns() {
        return this.columnItems.filter((col) => !col.pinningDisabled);
    }

    /**
     * Pins all columns in the grid.
     * ```typescript
     * this.columnPinning.pinAllColumns();
     * ```
     * @memberof IgxColumnPinningComponent
     */
    public pinAllColumns() {
        const collection = this.pinnableColumns;
        for (const col of collection) {
            col.value = true;
        }
    }

    /**
     * Unpins all columns in the grid.
     * ```typescript
     * this.columnPinning.unpinAllColumns();
     * ```
     * @memberof IgxColumnPinningComponent
     */
    public unpinAllColumns() {
        const collection = this.pinnableColumns;
        for (const col of collection) {
            col.value = false;
        }
    }
}

