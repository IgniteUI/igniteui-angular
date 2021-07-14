import { CellType } from './common/cell.interface';
import { RowType } from './common/row.interface';
import { IgxGridComponent } from './grid/public_api';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/public_api';
import { IgxColumnComponent } from './public_api';
import { ISelectionNode } from './selection/selection.service';
import { IgxTreeGridComponent } from './tree-grid/public_api';

export class IgxGridCell implements CellType {
	/**
	 * @hidden
	 */
	constructor(
		public grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent,
		public rowIndex: number,
		private columnField: string) {
	}

	/**
	 * Returns the row containing the cell.
	 * ```typescript
	 * let row = this.cell.row;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get row(): RowType {
		return this.grid.createRow(this.rowIndex);
	}

	/**
	 * Returns the column of the cell.
	 * ```typescript
	 * let column = this.cell.column;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get column(): IgxColumnComponent {
		return this.grid.getColumnByName(this.columnField);
	}

	/**
	 * Returns the column index.
	 * ```typescript
	 * let colIndex = this.cell.columnIndex;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get columnIndex(): number {
		return this.column.index;
	}

	/**
	 * Returns the column index.
	 * ```typescript
	 * let isSelected = this.cell.columnSelected;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get columnSelected(): boolean {
		return this.grid.selectionService.isColumnSelected(this.columnField);
	}

	/**
	 * Returns the column visible index.
	 * ```typescript
	 * let visibleIndex = this.cell.visibleColumnIndex;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get visibleColumnIndex(): number {
		return this.column.visibleIndex;
	}

	/**
	 * Gets the current edit value while a cell is in edit mode.
	 * ```typescript
	 * let editValue = this.cell.editValue;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get editValue(): any {
		if (this.grid.crudService.cellInEditMode) {
			return this.grid.crudService.cell.editValue;
		}
	}

	/**
	 * Sets the current edit value while a cell is in edit mode.
	 * Only for cell editing mode.
	 * ```typescript
	 * this.cell.editValue = value;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public set editValue(value: any) {
			if (this.grid.crudService.cellInEditMode) {
					this.grid.crudService.cell.editValue = value;
			}
	}

	/**
	 * Returns whether the cell is editable..
	 *
	 * @memberof IgxGridCell
	 */
	public get editable(): boolean {
		return this.column.editable;
		// TODO cell
		// return this.column.editable && !this.intRow.disabled;
	}

	/**
	 * Gets the width of the cell.
	 * ```typescript
	 * let cellWidth = this.cell.width;
	 * ```
	 *
	 * @memberof IgxGridCell
	 */
	public get width(): string {
		return this.column.width;
	}

	/**
	 * Returns the row data.
	 */
	public get rowData(): any {
		return this.row.data;
	}

	/**
	 * Returns the row that contains the cell.
	 */
		public get value(): any {
		return this.rowData[this.columnField];
	}

	/**
	 * Gets the row key.
	 * A row in the grid is identified either by:
	 * - primaryKey data value,
	 * - the whole rowData, if the primaryKey is omitted.
	 *
	 * ```typescript
	 * let rowKey = row.key;
	 * ```
	 */
	public get cellID(): any {
		const primaryKey = this.grid.primaryKey;
		const rowID = primaryKey ? this.rowData[primaryKey] : this.rowData;
		return { rowID, columnID: this.columnIndex, rowIndex: this.rowIndex };
	}

	/**
	 * Returns if the row is currently in edit mode.
	 */
	public get editMode(): boolean {
		// TODO cell
		if (this.grid.crudService.cellInEditMode) {
			const isCurrentCell = this.grid.crudService.cell.id === this.cellID;
			return isCurrentCell;
		} else {
			return false;
		}
	}

	/**
	 * Gets whether the cell is selected.
	 * ```typescript
	 * let isSelected = this.cell.selected;
	 * ```
	 *
	 * @memberof IgxGridCellComponent
	 */
	public get selected(): boolean {
		return this.grid.selectionService.selected(this.selectionNode);
	}

	/**
	 * Selects/deselects the cell.
	 * ```typescript
	 * this.cell.selected = true.
	 * ```
	 *
	 * @memberof IgxGridCellComponent
	 */
	public set selected(val: boolean) {
			const node = this.selectionNode;
			if (val) {
					this.grid.selectionService.add(node);
			} else {
					this.grid.selectionService.remove(node);
			}
			this.grid.notifyChanges();
	}

	/**
	 * Updates the cell value.
	 *
	 * ```typescript
	 * cell.update(newValue);
	 * ```
	 */
	public update(val: any): void {
		if (this.row.deleted) {
				return;
		}

		let cell = this.grid.crudService.cell;
		if (!cell) {
				cell = this.grid.crudService.createCell(this);
		}
		cell.editValue = val;
		this.grid.crudService.endCellEdit();
		// TODO cell
		// this.cdr.markForCheck();
	}

	/**
	 * Starts/ends edit mode for the cell.
	 *
	 * ```typescript
	 * cell.setEditMode(true);
	 * ```
	 */
	public setEditMode(value: boolean): void {
		if (this.row.deleted) {
			return;
		}
		if (this.editable && value) {
				if (this.grid.crudService.cellInEditMode) {
						this.grid.gridAPI.update_cell(this.grid.crudService.cell);
						this.grid.crudService.endCellEdit();
				}
				this.grid.crudService.enterEditMode(this);
		} else {
				this.grid.crudService.endCellEdit();
		}
		this.grid.notifyChanges();
	}

	protected get selectionNode(): ISelectionNode {
			return {
					row: this.rowIndex,
					column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
					layout: this.column.columnLayoutChild ? {
							rowStart: this.column.rowStart,
							colStart: this.column.colStart,
							rowEnd: this.column.rowEnd,
							colEnd: this.column.colEnd,
							columnVisibleIndex: this.visibleColumnIndex
					} : null
			};
	}
}
