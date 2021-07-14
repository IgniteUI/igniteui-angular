import { IgxColumnComponent } from '../columns/column.component';
import { IgxGridComponent } from '../grid/grid.component';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/hierarchical-grid.component';
import { IgxTreeGridComponent } from '../tree-grid/tree-grid.component';
import { RowType } from './row.interface';

export interface CellType {
	columnIndex: number;
	visibleColumnIndex: number;
	rowIndex: number;
	value: any;
	editValue: any;
	selected: boolean;
	editable: boolean;
	editMode: boolean;
	columnSelected: boolean;
	column: IgxColumnComponent;
	row: RowType;
	rowData: any;
	grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent;
	cellID: { rowID: any; columnID: number; rowIndex: number };
	width: string;
	update?: (value: any) => void;
	setEditMode?: (value: boolean) => void;
}

